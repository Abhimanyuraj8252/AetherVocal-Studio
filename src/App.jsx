import React, { useState, useEffect, useRef } from 'react';
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
import { convertAndExportAudio, downloadAudioBlob } from './utils/audioBufferEncoder';
import { WebSpeechAudioStreamCapturer } from './utils/WebSpeechAudioStreamCapturer';
import { MobileSafeAudioExporter } from './utils/MobileSafeAudioExporter';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [text, setText] = useState('नमस्ते! एथरवोकल स्टूडियो में आपका स्वागत है। यहाँ आप हिंदी और इंग्लिश स्क्रिप्ट को हाई-क्वालिटी न्यूरल ऑडियो में बदल सकते हैं।');
  const [autoSanitize, setAutoSanitize] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(PREMIUM_VOICE_PROFILES[0]);
  const [targetLang, setTargetLang] = useState('all');
  const [targetGender, setTargetGender] = useState('all');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.15);
  const [selectedFormat, setSelectedFormat] = useState('mp3');

  // Speech State
  const [systemVoices, setSystemVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);
  
  // LocalStorage Audio History Log
  const [audioHistory, setAudioHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('aethervocal_audio_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const capturerRef = useRef(new WebSpeechAudioStreamCapturer());
  const synthRef = useRef(window.speechSynthesis);

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

  // Play full speech
  const handlePlayFullSpeech = async () => {
    if (!text.trim()) return;
    if (synthRef.current) synthRef.current.cancel();

    setIsSpeaking(true);
    setIsPaused(false);
    capturerRef.current.startRecording();

    for (let i = 0; i < chunks.length; i++) {
      setActiveChunkIndex(i);
      await speakChunkPromise(chunks[i]);
    }

    setIsSpeaking(false);
    setActiveChunkIndex(-1);
  };

  const speakChunkPromise = (chunkText) => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunkText);
      const matchVoice = findMatchingSystemVoice(systemVoices, selectedProfile);
      if (matchVoice) utterance.voice = matchVoice;

      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      synthRef.current.speak(utterance);
    });
  };

  const handlePause = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveChunkIndex(-1);
    }
  };

  const handlePlaySingleChunk = (chunkText, index) => {
    if (synthRef.current) synthRef.current.cancel();
    setActiveChunkIndex(index);
    setIsSpeaking(true);

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

    synthRef.current.speak(utterance);
  };

  const handlePlaySample = (profile) => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlayingSample(true);

    const sample = profile.sampleText || 'AetherVocal Studio Speech Synthesis';
    const utterance = new SpeechSynthesisUtterance(sample);
    const matchVoice = findMatchingSystemVoice(systemVoices, profile);
    if (matchVoice) utterance.voice = matchVoice;

    utterance.rate = rate;
    utterance.pitch = profile.defaultPitch || pitch;

    utterance.onend = () => setIsPlayingSample(false);
    utterance.onerror = () => setIsPlayingSample(false);

    synthRef.current.speak(utterance);
  };

  const handleStopSample = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsPlayingSample(false);
  };

  // Generate & Save Audio File
  const handleDownload = async () => {
    MobileSafeAudioExporter.resumeAudioContext();
    const recordedBlob = await capturerRef.current.stopRecording();
    
    const charCount = text.length || 1;
    const estSeconds = Math.max(5, Math.ceil(charCount / 12));

    const exportResult = await convertAndExportAudio({
      chunksBlob: recordedBlob,
      text,
      selectedProfile,
      pitch,
      rate,
      estimatedSeconds: estSeconds,
      format: selectedFormat
    });

    // Save to LocalStorage Audio History
    const historyItem = {
      id: Date.now().toString(),
      title: text.slice(0, 32) + '...',
      voiceName: selectedProfile.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      format: selectedFormat,
      filename: exportResult.filename,
      blob: exportResult.blob
    };

    const updatedHistory = [historyItem, ...audioHistory].slice(0, 10);
    setAudioHistory(updatedHistory);
    try {
      localStorage.setItem('aethervocal_audio_history', JSON.stringify(updatedHistory.map(h => ({
        ...h,
        blob: null // Do not serialize binary blob to avoid quota errors
      }))));
    } catch (e) {}

    downloadAudioBlob(exportResult.blob, exportResult.filename);
  };

  const handleClearHistory = () => {
    setAudioHistory([]);
    try {
      localStorage.removeItem('aethervocal_audio_history');
    } catch (e) {}
  };

  const handlePlayHistoryItem = (item) => {
    if (item.blob) {
      const url = URL.createObjectURL(item.blob);
      const audio = new Audio(url);
      audio.play();
    } else {
      handlePlayFullSpeech();
    }
  };

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

            <AudioVisualizer isSpeaking={isSpeaking || isPlayingSample} />
          </div>
        </div>
      </main>

      <FooterPlayer
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        onPlay={handlePlayFullSpeech}
        onPause={handlePause}
        onStop={handleStop}
        onDownload={handleDownload}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        stats={{ charCount, wordCount, formattedDuration }}
      />
    </div>
  );
}
