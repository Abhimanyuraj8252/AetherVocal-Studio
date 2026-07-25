import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FeatureCards } from './components/FeatureCards';
import { TextEditor } from './components/TextEditor';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioVisualizer } from './components/AudioVisualizer';
import { ChunkQueue } from './components/ChunkQueue';
import { FooterPlayer } from './components/FooterPlayer';
import { GeneratedAudioPlayer } from './components/GeneratedAudioPlayer';

import { sanitizeMarkdown, strictSpeechClean } from './utils/markdownSanitizer';
import { chunkText, calculateTextStats } from './utils/textChunker';
import { PREMIUM_VOICE_PROFILES, findMatchingSystemVoice } from './utils/voiceProfiles';
import { convertAndExportAudio, downloadAudioBlob } from './utils/audioBufferEncoder';
import { TabAudioRecorderEngine } from './utils/tabAudioRecorder';

export default function App() {
  // 1. Text & Sanitization state
  const [text, setText] = useState('');
  const [autoSanitize, setAutoSanitize] = useState(true);

  // 2. Voice Profiles & System Voices
  const [systemVoices, setSystemVoices] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(PREMIUM_VOICE_PROFILES[0]);
  const [targetLang, setTargetLang] = useState('all'); // 'all', 'hi', 'en'
  const [targetGender, setTargetGender] = useState('all'); // 'all', 'male', 'female'
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [outputFormat, setOutputFormat] = useState('mp3'); // 'mp3', 'wav', 'ogg'

  // 3. Playback & Recording state
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastAudioExport, setLastAudioExport] = useState(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');
  const [generatedAudioError, setGeneratedAudioError] = useState('');
  const [generatedAudioWarning, setGeneratedAudioWarning] = useState('');
  const [generatedAudioMimeType, setGeneratedAudioMimeType] = useState('');

  // Refs for tracking playback loop
  const currentChunkIndexRef = useRef(-1);
  const isPlayingRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis);

  // Load available system voices
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

  // Update pitch/rate automatically when Male or Female voice profile changes
  useEffect(() => {
    if (selectedProfile) {
      setPitch(selectedProfile.defaultPitch || (selectedProfile.gender === 'Male' ? 0.85 : 1.15));
      setRate(selectedProfile.defaultRate || 1.0);
    }
  }, [selectedProfile]);

  useEffect(() => {
    return () => {
      if (generatedAudioUrl) {
        URL.revokeObjectURL(generatedAudioUrl);
      }
    };
  }, [generatedAudioUrl]);

  const clearGeneratedAudio = () => {
    if (generatedAudioUrl) {
      URL.revokeObjectURL(generatedAudioUrl);
    }

    setGeneratedAudioUrl('');
    setGeneratedAudioError('');
    setGeneratedAudioWarning('');
    setGeneratedAudioMimeType('');
    setLastAudioExport(null);
  };

  // Auto-sanitize on text change if autoSanitize is checked
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

  // Compute speech chunks with strict symbol stripping
  const chunks = useMemo(() => {
    const cleanSpeechText = strictSpeechClean(text);
    return chunkText(cleanSpeechText, 180);
  }, [text]);

  const stats = useMemo(() => {
    return calculateTextStats(text, rate);
  }, [text, rate]);

  // Stop any active speech synthesis
  const stopAllSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setIsPlayingSample(false);
    setActiveChunkIndex(-1);
    currentChunkIndexRef.current = -1;
  };

  // Play voice sample for a specific profile
  const handlePlaySample = (profile = selectedProfile) => {
    stopAllSpeech();
    if (!synthRef.current) return;

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
  };

  // Play single chunk
  const handlePlaySingleChunk = (chunkTextString, idx) => {
    stopAllSpeech();
    if (!synthRef.current) return;

    const matchedVoice = findMatchingSystemVoice(systemVoices, selectedProfile);
    const cleanChunk = strictSpeechClean(chunkTextString);
    const utterance = new SpeechSynthesisUtterance(cleanChunk);
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;

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
  };

  // Play full audio queue (sequential chunk processing)
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

    const chunkContent = strictSpeechClean(chunksArray[index]);
    const utterance = new SpeechSynthesisUtterance(chunkContent);
    const matchedVoice = findMatchingSystemVoice(systemVoices, selectedProfile);
    
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      if (isPlayingRef.current) {
        playNextChunk(chunksArray, index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech chunk error:', e);
      if (isPlayingRef.current && index + 1 < chunksArray.length) {
        playNextChunk(chunksArray, index + 1);
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    synthRef.current.speak(utterance);
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
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  // Generate & Download TRUE Spoken Text Audio (.mp3, .wav, .ogg) offline
  const handleGenerateAndDownload = async () => {
    if (!chunks || chunks.length === 0) return;
    stopAllSpeech();
    clearGeneratedAudio();

    const tabRecorder = new TabAudioRecorderEngine();

    try {
      setGeneratedAudioError('');
      setGeneratedAudioWarning('');
      setIsRecording(true);

      await tabRecorder.startCapture();

      isPlayingRef.current = true;
      setIsPlaying(true);

      // Synthesize all text script chunks while recorder captures live spoken audio
      const recordAndSynthesize = () => {
        return new Promise((resolve) => {
          const speakChunk = (idx) => {
            if (!isPlayingRef.current || idx >= chunks.length) {
              resolve();
              return;
            }

            setActiveChunkIndex(idx);
            const chunkStr = strictSpeechClean(chunks[idx]);
            const utterance = new SpeechSynthesisUtterance(chunkStr);
            const matchedVoice = findMatchingSystemVoice(systemVoices, selectedProfile);
            if (matchedVoice) utterance.voice = matchedVoice;
            utterance.lang = selectedProfile.langGroup === 'hi' ? 'hi-IN' : 'en-US';
            utterance.rate = rate;
            utterance.pitch = pitch;

            console.log('[AetherVocal] speaking chunk', {
              chunkIndex: idx,
              voice: matchedVoice?.name || 'browser-default',
              lang: utterance.lang,
              rate: utterance.rate,
              pitch: utterance.pitch
            });

            utterance.onend = () => {
              if (idx + 1 < chunks.length) {
                speakChunk(idx + 1);
              } else {
                resolve();
              }
            };

            utterance.onerror = (event) => {
              console.error('[AetherVocal] speech synthesis chunk error', event);
              if (idx + 1 < chunks.length) {
                speakChunk(idx + 1);
              } else {
                resolve();
              }
            };

            synthRef.current.speak(utterance);
          };

          speakChunk(0);
        });
      };

      await recordAndSynthesize();

      // Stop tab audio capture & retrieve genuine speech audio blob
      const liveRecordedBlob = await tabRecorder.stopCapture();

      if (!liveRecordedBlob || liveRecordedBlob.size === 0) {
        throw new Error('No valid audio was captured. Check tab/system audio permissions and try again.');
      }

      const result = await convertAndExportAudio({
        chunksBlob: liveRecordedBlob,
        format: outputFormat
      });

      if (result && result.blob) {
        const filename = result.filename || `AetherVocal_${selectedProfile.id}_${Date.now()}.${result.format}`;
        const objectUrl = URL.createObjectURL(result.blob);

        console.log('[AetherVocal] export complete', {
          filename,
          mimeType: result.mimeType || result.blob.type,
          format: result.format,
          size: result.blob.size,
          warning: result.warning
        });

        setLastAudioExport({
          ...result,
          filename,
          objectUrl
        });
        setGeneratedAudioUrl(objectUrl);
        setGeneratedAudioWarning(result.warning || '');
        setGeneratedAudioMimeType(result.mimeType || result.blob.type || '');
        downloadAudioBlob(result.blob, filename);
      }
    } catch (error) {
      console.error('[AetherVocal] audio generation failed', error);
      setGeneratedAudioError(error?.message || 'Audio generation failed.');
    } finally {
      setIsRecording(false);
      setIsPlaying(false);
      isPlayingRef.current = false;
      setActiveChunkIndex(-1);
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
      {/* Navbar Header */}
      <Header />

      {/* Main Workspace Area */}
      <main className="main-content">
        
        {/* Top Hero Banner */}
        <HeroBanner />

        {/* Dual 3D Image Feature Cards */}
        <FeatureCards />

        <div className="grid-container mt-4">
          
          {/* Left Column: Text Input & Markdown Live Preview */}
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

          {/* Right Column: Voice Selection, Audio Visualizer & Chunk Queue */}
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

            {/* Soundwave Spectrum Visualizer */}
            <div className="card visualizer-card mt-4">
              <div className="card-header border-b-0 pb-1">
                <h3 className="card-title text-sm">Real-time Audio Spectrum Equalizer</h3>
              </div>
              <AudioVisualizer 
                isPlaying={isPlaying || isPlayingSample} 
                isRecording={isRecording} 
              />
            </div>

            {/* Chunk Queue for long texts */}
            <ChunkQueue
              chunks={chunks}
              activeChunkIndex={activeChunkIndex}
              isPlaying={isPlaying}
              onPlaySingleChunk={handlePlaySingleChunk}
            />

            <GeneratedAudioPlayer
              audioUrl={generatedAudioUrl}
              audioBlob={lastAudioExport?.blob || null}
              filename={lastAudioExport?.filename || ''}
              mimeType={generatedAudioMimeType}
              warning={generatedAudioWarning}
              error={generatedAudioError}
              onDownload={handleDownloadLastAudio}
              onClear={clearGeneratedAudio}
            />
          </div>
        </div>
      </main>

      {/* Sticky Action Footer */}
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
      />
    </div>
  );
}
