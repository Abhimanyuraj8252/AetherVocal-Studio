import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FeatureCards } from './components/FeatureCards';
import { TextEditor } from './components/TextEditor';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioVisualizer } from './components/AudioVisualizer';
import { ChunkQueue } from './components/ChunkQueue';
import { FooterPlayer } from './components/FooterPlayer';

import { sanitizeMarkdown, strictSpeechClean } from './utils/markdownSanitizer';
import { chunkText, calculateTextStats } from './utils/textChunker';
import { PREMIUM_VOICE_PROFILES, findMatchingSystemVoice, getRecommendedProfileForText } from './utils/voiceProfiles';
import { convertAndExportAudio, downloadAudioBlob } from './utils/audioBufferEncoder';
import { TabAudioRecorderEngine } from './utils/tabAudioRecorder';
import { openSpeechPlaybackPopup, speakInPlaybackPopup } from './utils/speechPlaybackPopup';

export default function App() {
  // 1. Text & Sanitization state
  const [text, setText] = useState('');
  const [autoSanitize, setAutoSanitize] = useState(true);

  // 2. Voice Profiles & System Voices
  const [systemVoices, setSystemVoices] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(PREMIUM_VOICE_PROFILES[0]);
  const [targetLang, setTargetLang] = useState('all');
  const [targetGender, setTargetGender] = useState('all');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [outputFormat, setOutputFormat] = useState('mp3');

  // 3. Playback & Recording state
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastAudioExport, setLastAudioExport] = useState(null);
  const [deviceNotice, setDeviceNotice] = useState('');

  const currentChunkIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const isMobileDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }, []);

  // Load system voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setSystemVoices(availableVoices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Update pitch/rate automatically on profile selection
  useEffect(() => {
    if (selectedProfile) {
      setPitch(selectedProfile.defaultPitch || (selectedProfile.gender === 'Male' ? 0.85 : 1.15));
      setRate(selectedProfile.defaultRate || 1.0);
    }
  }, [selectedProfile]);

  const handleTextChange = (newText) => {
    if (autoSanitize) {
      const cleaned = sanitizeMarkdown(newText);
      setText(cleaned);
    } else {
      setText(newText);
    }
  };

  const handleManualSanitize = () => {
    const cleaned = sanitizeMarkdown(text);
    setText(cleaned);
  };

  const chunks = useMemo(() => {
    const cleanSpeechText = strictSpeechClean(text);
    return chunkText(cleanSpeechText, 180);
  }, [text]);

  const stats = useMemo(() => {
    return calculateTextStats(text, rate);
  }, [text, rate]);

  const scriptProfile = useMemo(() => {
    return getRecommendedProfileForText(text, {
      langGroup: targetLang,
      gender: targetGender,
      fallbackProfile: selectedProfile
    });
  }, [text, targetLang, targetGender, selectedProfile]);

  const stopAllSpeech = () => {
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch (e) {}
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setIsPlayingSample(false);
    setActiveChunkIndex(-1);
    currentChunkIndexRef.current = -1;
  };

  const handlePlaySample = (profile = selectedProfile) => {
    stopAllSpeech();
    if (!synthRef.current) return;

    try {
      const matchedVoice = findMatchingSystemVoice(systemVoices, profile);
      const cleanSample = strictSpeechClean(profile.sampleText);
      const utterance = new SpeechSynthesisUtterance(cleanSample);
      if (matchedVoice) utterance.voice = matchedVoice;
      
      utterance.rate = profile.defaultRate || rate;
      utterance.pitch = profile.defaultPitch || (profile.gender === 'Male' ? 0.85 : 1.15);

      utterance.onend = () => setIsPlayingSample(false);
      utterance.onerror = () => setIsPlayingSample(false);

      setIsPlayingSample(true);
      synthRef.current.speak(utterance);
    } catch (e) {
      setIsPlayingSample(false);
    }
  };

  const handlePlaySingleChunk = (chunkTextString, idx) => {
    stopAllSpeech();
    if (!synthRef.current) return;

    try {
      const matchedVoice = findMatchingSystemVoice(systemVoices, scriptProfile);
      const cleanChunk = strictSpeechClean(chunkTextString);
      const utterance = new SpeechSynthesisUtterance(cleanChunk);
      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.lang = matchedVoice?.lang || scriptProfile.lang;
      utterance.rate = scriptProfile.defaultRate || rate;
      utterance.pitch = scriptProfile.defaultPitch || pitch;

      utterance.onstart = () => {
        setIsPlaying(true);
        setActiveChunkIndex(idx);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setActiveChunkIndex(-1);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveChunkIndex(-1);
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      setIsPlaying(false);
      setActiveChunkIndex(-1);
    }
  };

  const playNextChunk = (chunksArray, index) => {
    if (!isPlayingRef.current || index >= chunksArray.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setActiveChunkIndex(-1);
      currentChunkIndexRef.current = -1;
      return;
    }

    currentChunkIndexRef.current = index;
    setActiveChunkIndex(index);

    try {
      const chunkContent = strictSpeechClean(chunksArray[index]);
      const utterance = new SpeechSynthesisUtterance(chunkContent);
      const matchedVoice = findMatchingSystemVoice(systemVoices, scriptProfile);
      
      if (matchedVoice) utterance.voice = matchedVoice;
      utterance.lang = matchedVoice?.lang || scriptProfile.lang;
      utterance.rate = scriptProfile.defaultRate || rate;
      utterance.pitch = scriptProfile.defaultPitch || pitch;

      console.log('[AetherVocal] queue chunk voice selected', {
        profile: scriptProfile.name,
        chunkIndex: index,
        voice: matchedVoice?.name || 'browser-default',
        lang: utterance.lang,
        rate: utterance.rate,
        pitch: utterance.pitch
      });

      utterance.onend = () => {
        if (isPlayingRef.current) {
          playNextChunk(chunksArray, index + 1);
        }
      };

      utterance.onerror = () => {
        if (isPlayingRef.current && index + 1 < chunksArray.length) {
          playNextChunk(chunksArray, index + 1);
        } else {
          setIsPlaying(false);
          isPlayingRef.current = false;
        }
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  };

  const handleStartPlay = () => {
    if (!chunks || chunks.length === 0) return;
    stopAllSpeech();

    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    playNextChunk(chunks, 0);
  };

  const handlePause = () => {
    if (synthRef.current && isPlaying) {
      try { synthRef.current.pause(); } catch (e) {}
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (synthRef.current && isPaused) {
      try { synthRef.current.resume(); } catch (e) {}
      setIsPaused(false);
    }
  };

  // Generate & Save Genuine Speech Audio Stream (.mp3, .wav, .ogg)
  const handleGenerateAndDownload = async () => {
    if (!text || text.trim().length === 0) return;
    stopAllSpeech();

    if (isMobileDevice) {
      setDeviceNotice('Mobile browsers usually cannot capture tab audio for file export. Use Play Speech on mobile. For Generate & Save, open AetherVocal on desktop.');
      return;
    }

    setIsRecording(true);
    let liveRecordedBlob = null;
    const capturer = new TabAudioRecorderEngine();
    let playbackPopup = null;

    try {
      playbackPopup = openSpeechPlaybackPopup();
      await capturer.startCapture();
    } catch (e) {}

    isPlayingRef.current = true;
    setIsPlaying(true);

    try {
      const playbackChunks = chunks.map((chunk) => strictSpeechClean(chunk)).filter(Boolean);
      const matchedVoice = findMatchingSystemVoice(systemVoices, scriptProfile);

      console.log('[AetherVocal] generate profile', {
        selectedProfile: selectedProfile.name,
        scriptProfile: scriptProfile.name,
        voice: matchedVoice?.name || 'browser-default',
        lang: matchedVoice?.lang || scriptProfile.lang,
        chunkCount: playbackChunks.length
      });

      await speakInPlaybackPopup(playbackPopup, {
        chunks: playbackChunks,
        voiceName: matchedVoice?.name || '',
        voiceURI: matchedVoice?.voiceURI || '',
        lang: matchedVoice?.lang || scriptProfile.lang,
        rate: scriptProfile.defaultRate || rate,
        pitch: scriptProfile.defaultPitch || pitch
      });
    } catch (e) {}

    try {
      liveRecordedBlob = await capturer.stopCapture();
    } catch (e) {}

    try {
      const result = await convertAndExportAudio({
        chunksBlob: liveRecordedBlob,
        text: text,
        pitch: scriptProfile.defaultPitch || pitch,
        rate: scriptProfile.defaultRate || rate,
        estimatedSeconds: stats.estimatedSeconds,
        format: outputFormat
      });

      if (result && result.blob) {
        setLastAudioExport(result);
        const filename = `AetherVocal_${selectedProfile.id}_${Date.now()}.${result.format}`;
        downloadAudioBlob(result.blob, filename);
      }
    } catch (err) {
      console.warn('Export error handled gracefully:', err);
    }

    setIsRecording(false);
    setIsPlaying(false);
    isPlayingRef.current = false;
    setActiveChunkIndex(-1);

    if (playbackPopup && !playbackPopup.closed) {
      playbackPopup.close();
    }
  };

  const handleDownloadLastAudio = () => {
    if (lastAudioExport && lastAudioExport.blob) {
      const filename = `AetherVocal_Speech_Export.${lastAudioExport.format}`;
      downloadAudioBlob(lastAudioExport.blob, filename);
    }
  };

  return (
    <div className="app-layout">
      <Header />

      {deviceNotice ? (
        <div className="mx-auto mt-3 w-[min(1100px,calc(100%-24px))] rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {deviceNotice}
        </div>
      ) : null}

      <main className="main-content">
        <HeroBanner />
        <FeatureCards />

        <div className="grid-container mt-4">
          <div className="column-left">
            <TextEditor
              text={text}
              setText={handleTextChange}
              autoSanitize={autoSanitize}
              setAutoSanitize={setAutoSanitize}
              stats={stats}
              chunkCount={chunks.length}
              onSanitize={handleManualSanitize}
            />
          </div>

          <div className="column-right">
            <VoiceSelector
              systemVoices={systemVoices}
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              targetLang={targetLang}
              setTargetLang={setTargetLang}
              targetGender={targetGender}
              setTargetGender={setTargetGender}
              rate={rate}
              setRate={setRate}
              pitch={pitch}
              setPitch={setPitch}
              onPlaySample={handlePlaySample}
              isPlayingSample={isPlayingSample}
              onStopSample={stopAllSpeech}
            />

            <div className="card visualizer-card mt-4">
              <div className="card-header border-b-0 pb-1">
                <h3 className="card-title text-sm">Real-time Audio Spectrum Equalizer</h3>
              </div>
              <AudioVisualizer 
                isPlaying={isPlaying || isPlayingSample} 
                isRecording={isRecording} 
              />
            </div>

            <ChunkQueue
              chunks={chunks}
              activeChunkIndex={activeChunkIndex}
              isPlaying={isPlaying}
              onPlaySingleChunk={handlePlaySingleChunk}
            />
          </div>
        </div>
      </main>

      <FooterPlayer
        isPlaying={isPlaying}
        isPaused={isPaused}
        isRecording={isRecording}
        onPlay={handleStartPlay}
        onPause={handlePause}
        onResume={handleResume}
        onStop={stopAllSpeech}
        onGenerateAndDownload={handleGenerateAndDownload}
        outputFormat={outputFormat}
        setOutputFormat={setOutputFormat}
        hasAudioFile={!!lastAudioExport}
        onDownloadAudio={handleDownloadLastAudio}
        text={text}
        isGenerateSupported={!isMobileDevice}
      />
    </div>
  );
}
