import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FeatureCards } from './components/FeatureCards';
import { TextEditor } from './components/TextEditor';
import { ChunkQueue } from './components/ChunkQueue';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioVisualizer } from './components/AudioVisualizer';
import { FooterPlayer } from './components/FooterPlayer';
import { AudioHistory } from './components/AudioHistory';
import { PREMIUM_VOICE_PROFILES, findMatchingSystemVoice } from './utils/voiceProfiles';
import { MobileSafeAudioExporter } from './utils/MobileSafeAudioExporter';
import { CloudSpeechSynthesizer } from './utils/CloudSpeechSynthesizer';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [text, setText] = useState('नमस्ते! एथरवोकल स्टूडियो में आपका स्वागत है। यहाँ आप हिंदी और इंग्लिश स्क्रिप्ट को हाई-क्वालिटी न्यूरल ऑडियो में बदल सकते हैं।');
  const [autoSanitize, setAutoSanitize] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(PREMIUM_VOICE_PROFILES[0]);
  const [targetLang, setTargetLang] = useState('all');
  const [targetGender, setTargetGender] = useState('all');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.15);
  const [selectedFormat, setSelectedFormat] = useState('webm');

  // Speech State
  const [systemVoices, setSystemVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);

  // Download/Generate State
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // LocalStorage Audio History Log
  const [audioHistory, setAudioHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('aethervocal_audio_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const synthRef = useRef(window.speechSynthesis);
  const currentUtteranceRef = useRef(null);

  // Sync theme attribute to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load system voices
  useEffect(() => {
    const updateVoices = () => {
      if (window.speechSynthesis) {
        const available = window.speechSynthesis.getVoices();
        setSystemVoices(available);
      }
    };
    updateVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Split text into chunks
  useEffect(() => {
    if (!text.trim()) {
      setChunks([]);
      return;
    }
    const rawChunks = text
      .split(/(?<=[.?!।\n])\s+/)
      .map(c => c.trim())
      .filter(Boolean);

    setChunks(rawChunks.length > 0 ? rawChunks : [text.trim()]);
  }, [text]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSanitizeText = () => {
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*~_`^|\\{}[\]@$%&=+<>/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    setText(clean);
  };

  // Synchronous Speech & AudioContext Resumer
  const prepareSpeechExecution = useCallback(() => {
    MobileSafeAudioExporter.resumeAudioContext();
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }
  }, []);

  // ─── PLAY FULL SPEECH ───
  const handlePlayFullSpeech = useCallback(() => {
    if (!text.trim()) return;

    // If paused, just resume
    if (isPaused && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    prepareSpeechExecution();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);
    setIsPaused(false);
    setActiveChunkIndex(0);

    if (window.speechSynthesis) {
      try {
        // Speak chunk by chunk for proper progress tracking
        const speakChunks = (index) => {
          if (index >= chunks.length) {
            setIsSpeaking(false);
            setActiveChunkIndex(-1);
            return;
          }

          setActiveChunkIndex(index);
          const utterance = new SpeechSynthesisUtterance(chunks[index]);
          const matchVoice = findMatchingSystemVoice(systemVoices, selectedProfile);
          if (matchVoice) utterance.voice = matchVoice;
          utterance.rate = rate;
          utterance.pitch = pitch;

          currentUtteranceRef.current = utterance;

          utterance.onend = () => {
            speakChunks(index + 1);
          };
          utterance.onerror = (event) => {
            // Skip errored chunks, continue with next
            if (event.error !== 'canceled') {
              speakChunks(index + 1);
            }
          };

          window.speechSynthesis.speak(utterance);
        };

        speakChunks(0);
      } catch (e) {
        console.warn('Speech playback error:', e);
        setIsSpeaking(false);
        setActiveChunkIndex(-1);
      }
    }
  }, [text, chunks, isPaused, systemVoices, selectedProfile, rate, pitch, prepareSpeechExecution]);

  // ─── PAUSE ───
  const handlePause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  // ─── STOP ───
  const handleStop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveChunkIndex(-1);
  }, []);

  // ─── PLAY SINGLE CHUNK ───
  const handlePlaySingleChunk = useCallback((chunkText, index) => {
    prepareSpeechExecution();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setActiveChunkIndex(index);
    setIsSpeaking(true);
    setIsPaused(false);

    if (window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(chunkText);
        const matchVoice = findMatchingSystemVoice(systemVoices, selectedProfile);
        if (matchVoice) utterance.voice = matchVoice;
        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onend = () => {
          setIsSpeaking(false);
          setActiveChunkIndex(-1);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setActiveChunkIndex(-1);
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
        setActiveChunkIndex(-1);
      }
    }
  }, [systemVoices, selectedProfile, rate, pitch, prepareSpeechExecution]);

  // ─── PLAY VOICE SAMPLE ───
  const handlePlaySample = useCallback((profile) => {
    prepareSpeechExecution();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSample(true);

    const sample = profile.sampleText || 'AetherVocal Studio Speech Synthesis';

    if (window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(sample);
        const matchVoice = findMatchingSystemVoice(systemVoices, profile);
        if (matchVoice) utterance.voice = matchVoice;
        utterance.rate = rate;
        utterance.pitch = profile.defaultPitch || pitch;

        utterance.onend = () => setIsPlayingSample(false);
        utterance.onerror = () => setIsPlayingSample(false);

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsPlayingSample(false);
      }
    }
  }, [systemVoices, rate, pitch, prepareSpeechExecution]);

  const handleStopSample = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSample(false);
  }, []);

  // ─── DOWNLOAD: FORMANT SPEECH SYNTHESIS (MOBILE + PC SAFE) ───
  const handleDownload = useCallback(async () => {
    if (!text.trim() || isGenerating) return;

    // Stop any current playback first
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveChunkIndex(-1);

    prepareSpeechExecution();
    setIsGenerating(true);
    setDownloadError('');

    try {
      // Synthesize high-quality natural cloud speech MP3 blob
      const wavBlob = await CloudSpeechSynthesizer.synthesize(text, {
        gender: selectedProfile?.gender || 'Female',
        pitch,
        rate
      });

      if (!wavBlob || wavBlob.size < 100) {
        throw new Error('Audio generation failed. Text is empty or invalid.');
      }

      const ext = 'mp3'; // Cloud synth outputs MP3
      const filename = `AetherVocal_${selectedProfile?.id || 'Speech'}.${ext}`;

      // Trigger download using mobile-safe exporter
      MobileSafeAudioExporter.download(wavBlob, filename);

      // Save to audio history
      const historyItem = {
        id: Date.now().toString(),
        title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
        voiceName: selectedProfile?.name || 'Standard Voice',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        format: 'MP3',
        filename,
        textSnippet: text.slice(0, 200)
      };

      const updatedHistory = [historyItem, ...audioHistory].slice(0, 10);
      setAudioHistory(updatedHistory);
      try {
        localStorage.setItem('aethervocal_audio_history', JSON.stringify(updatedHistory));
      } catch (e) {}

    } catch (err) {
      console.warn('Audio download error:', err);
      setDownloadError(err?.message || 'Audio generate nahi ho saka. Kripya punah prayas karein.');
    } finally {
      setIsGenerating(false);
    }
  }, [text, isGenerating, selectedProfile, pitch, rate, selectedFormat, audioHistory, prepareSpeechExecution]);

  // ─── HISTORY ACTIONS ───
  const handleClearHistory = useCallback(() => {
    setAudioHistory([]);
    try {
      localStorage.removeItem('aethervocal_audio_history');
    } catch (e) {}
  }, []);

  const handlePlayHistoryItem = useCallback((item) => {
    // Re-speak the saved text snippet from history
    if (item.textSnippet && window.speechSynthesis) {
      prepareSpeechExecution();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(item.textSnippet);
      const profile = PREMIUM_VOICE_PROFILES.find(p => p.name === item.voiceName) || selectedProfile;
      const matchVoice = findMatchingSystemVoice(systemVoices, profile);
      if (matchVoice) utterance.voice = matchVoice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    }
  }, [systemVoices, selectedProfile, rate, pitch, prepareSpeechExecution]);

  // ─── DISMISS DOWNLOAD ERROR ───
  const handleDismissError = useCallback(() => {
    setDownloadError('');
  }, []);

  // Stats calculation
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const totalSeconds = Math.ceil(charCount / (12 * rate));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedDuration = `${mins}m ${secs}s`;

  return (
    <div className="app-layout">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="main-content">
        <HeroBanner />
        <FeatureCards />

        <div className="grid-container">
          {/* Left Column: Text Editor & Speech Queue */}
          <div className="flex flex-col gap-4">
            <TextEditor
              text={text}
              setText={setText}
              autoSanitize={autoSanitize}
              setAutoSanitize={setAutoSanitize}
              stats={{ charCount, wordCount, formattedDuration }}
              chunkCount={chunks.length}
              onSanitize={handleSanitizeText}
            />

            <ChunkQueue
              chunks={chunks}
              activeChunkIndex={activeChunkIndex}
              isSpeaking={isSpeaking}
              onPlayChunk={handlePlaySingleChunk}
            />

            <AudioHistory
              history={audioHistory}
              onClearHistory={handleClearHistory}
              onPlayHistoryItem={handlePlayHistoryItem}
            />
          </div>

          {/* Right Column: AI Voice Selector & Audio Visualizer */}
          <div className="flex flex-col gap-4">
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
              onStopSample={handleStopSample}
            />

            <AudioVisualizer isSpeaking={isSpeaking || isPlayingSample || isGenerating} />
          </div>
        </div>
      </main>

      <FooterPlayer
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        isGenerating={isGenerating}
        downloadError={downloadError}
        onPlay={handlePlayFullSpeech}
        onPause={handlePause}
        onStop={handleStop}
        onDownload={handleDownload}
        onDismissError={handleDismissError}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        stats={{ charCount, wordCount, formattedDuration }}
      />
    </div>
  );
}
