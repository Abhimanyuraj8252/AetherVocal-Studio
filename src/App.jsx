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
import { PREMIUM_VOICE_PROFILES } from './utils/voiceProfiles';
import { MobileSafeAudioExporter } from './utils/MobileSafeAudioExporter';
import { CloudSpeechSynthesizer } from './utils/CloudSpeechSynthesizer';
import { AudioDB } from './utils/audioDB';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(-1);

  // Download/Generate State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, percent: 0, statusText: '' });
  const [downloadError, setDownloadError] = useState('');
  const [lastGeneratedChunkIndex, setLastGeneratedChunkIndex] = useState(0);

  // Audio History Log
  const [audioHistory, setAudioHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('aethervocal_audio_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const audioRef = useRef(new Audio());
  const currentObjectUrlRef = useRef(null);

  // Sync theme attribute to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Split text into chunks
  useEffect(() => {
    if (!text.trim()) {
      setChunks([]);
      setLastGeneratedChunkIndex(0);
      return;
    }
    const rawChunks = CloudSpeechSynthesizer.smartChunkText(text, 180);
    setChunks(rawChunks.length > 0 ? rawChunks : [text.trim()]);
    setLastGeneratedChunkIndex(0); // reset if text completely changes
  }, [text]);

  // Sync pitch and rate when selectedProfile changes
  useEffect(() => {
    if (selectedProfile) {
      setPitch(selectedProfile.defaultPitch || 1.0);
      setRate(selectedProfile.defaultRate || 1.0);
    }
  }, [selectedProfile]);

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

  // Helper to safely play blob
  const playBlob = async (blob, onEnd) => {
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
    }
    audioRef.current.pause();
    
    const url = URL.createObjectURL(blob);
    currentObjectUrlRef.current = url;
    audioRef.current.src = url;
    
    audioRef.current.onended = () => {
      setIsSpeaking(false);
      setIsPlayingSample(false);
      setActiveChunkIndex(-1);
      if (onEnd) onEnd();
    };

    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      setIsPlayingSample(false);
      setActiveChunkIndex(-1);
    };

    try {
      await audioRef.current.play();
      setIsPaused(false);
    } catch (err) {
      console.error("Playback failed:", err);
      setIsSpeaking(false);
      setIsPlayingSample(false);
    }
  };

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsSpeaking(false);
    setIsPaused(false);
    setIsPlayingSample(false);
    setActiveChunkIndex(-1);
  };

  // ─── PLAY FULL SPEECH (PREVIEW ONLY) ───
  const handlePlayFullSpeech = useCallback(async () => {
    if (!text.trim()) return;

    if (isPaused) {
      audioRef.current.play();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    stopAudio();
    setIsGenerating(true);

    try {
      const { wavBlob } = await CloudSpeechSynthesizer.synthesize(text, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(text) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate,
        startIndex: 0,
        maxChunks: 20, // Preview only first 20 chunks to avoid timeout
        onProgress: (progress) => setGenerationProgress(progress)
      });

      if (!wavBlob) throw new Error('Audio generation failed.');

      setIsSpeaking(true);
      await playBlob(wavBlob);
    } catch (e) {
      setDownloadError(e.message || "Failed to preview.");
    } finally {
      setIsGenerating(false);
    }
  }, [text, isPaused, targetLang]);

  // ─── PAUSE ───
  const handlePause = useCallback(() => {
    if (isSpeaking) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // ─── PLAY SINGLE CHUNK ───
  const handlePlaySingleChunk = useCallback(async (chunkText, index) => {
    stopAudio();
    setActiveChunkIndex(index);
    setIsGenerating(true);
    try {
      const { wavBlob } = await CloudSpeechSynthesizer.synthesize(chunkText, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(chunkText) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate
      });
      if (wavBlob) {
        setIsSpeaking(true);
        await playBlob(wavBlob);
      } else {
        setActiveChunkIndex(-1);
      }
    } catch (e) {
      setActiveChunkIndex(-1);
    } finally {
      setIsGenerating(false);
    }
  }, [targetLang]);

  // ─── PLAY SAMPLE ───
  const handlePlaySample = useCallback(async (profile) => {
    stopAudio();
    setIsPlayingSample(true);
    setIsGenerating(true);
    const sample = profile.sampleText || 'AetherVocal Studio Speech Synthesis';
    try {
      const { wavBlob } = await CloudSpeechSynthesizer.synthesize(sample, { 
        lang: profile.lang || 'hi',
        pitch: profile.defaultPitch || 1.0,
        rate: profile.defaultRate || 1.0 
      });
      if (wavBlob) {
        await playBlob(wavBlob);
      }
    } catch (e) {
      setIsPlayingSample(false);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // ─── DOWNLOAD SINGLE CHUNK ───
  const handleDownloadSingleChunk = useCallback(async (chunkText, index) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setDownloadError('');
    try {
      const { wavBlob } = await CloudSpeechSynthesizer.synthesize(chunkText, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(chunkText) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate,
      });
      if (wavBlob) {
        MobileSafeAudioExporter.resumeAudioContext();
        MobileSafeAudioExporter.download(wavBlob, `AetherVocal_Chunk_${index + 1}.wav`);
      }
    } catch (err) {
      console.warn('Chunk download error:', err);
      setDownloadError(err?.message || 'Chunk download failed.');
    } finally {
      setIsGenerating(false);
    }
  }, [targetLang, pitch, rate, isGenerating]);

  // ─── DOWNLOAD: BLOCK GENERATION ───
  const handleGenerateBlock = useCallback(async () => {
    if (!text.trim() || isGenerating) return;

    stopAudio();
    setIsGenerating(true);
    setDownloadError('');

    try {
      const { wavBlob, endIndex, isComplete } = await CloudSpeechSynthesizer.synthesize(text, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(text) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate,
        startIndex: lastGeneratedChunkIndex,
        maxChunks: 20, // Strict API limit per block
        onProgress: (progress) => {
          setGenerationProgress(progress);
        }
      });

      if (!wavBlob || wavBlob.size < 100) {
        throw new Error('Audio generation failed. Block might be empty.');
      }

      // Save to IndexedDB
      const dbId = `audio_blob_${Date.now()}`;
      await AudioDB.saveAudioBlob(dbId, wavBlob);

      const partNum = Math.floor(lastGeneratedChunkIndex / 20) + 1;
      const historyItem = {
        id: dbId,
        title: `Part ${partNum}: ` + text.slice(lastGeneratedChunkIndex * 50, (lastGeneratedChunkIndex * 50) + 40) + '...',
        voiceName: selectedProfile?.name || 'Standard Voice',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        format: 'WAV',
        dbId: dbId,
        chunksRange: `${lastGeneratedChunkIndex + 1} - ${endIndex}`,
        isPart: true
      };

      const updatedHistory = [historyItem, ...audioHistory].slice(0, 50); // Keep 50 blocks
      setAudioHistory(updatedHistory);
      localStorage.setItem('aethervocal_audio_history', JSON.stringify(updatedHistory));

      setLastGeneratedChunkIndex(endIndex);

      if (isComplete) {
        // Automatically trigger combine if they only generated one part, or just let them select.
        setDownloadError("Generation complete. Select parts in History to Combine & Download!");
      }

    } catch (err) {
      console.warn('Audio download error:', err);
      setDownloadError(err?.message || 'Audio generate nahi ho saka. Kripya punah prayas karein.');
    } finally {
      setIsGenerating(false);
    }
  }, [text, isGenerating, selectedProfile, targetLang, audioHistory, lastGeneratedChunkIndex]);

  // ─── HISTORY ACTIONS ───
  const handleClearHistory = useCallback(async () => {
    setAudioHistory([]);
    try {
      localStorage.removeItem('aethervocal_audio_history');
      await AudioDB.clearAll();
    } catch (e) {}
  }, []);

  const handlePlayHistoryItem = useCallback(async (item) => {
    if (!item.dbId) return;
    stopAudio();
    setIsGenerating(true);
    try {
      const blob = await AudioDB.getAudioBlob(item.dbId);
      if (blob) {
        setIsSpeaking(true);
        await playBlob(blob);
      }
    } catch (e) {
      console.warn("Could not load history audio");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleCombineAndDownload = useCallback(async (selectedIds) => {
    if (selectedIds.length === 0) return;
    setIsGenerating(true);
    setDownloadError('');
    setGenerationProgress({ current: 0, total: 100, percent: 0, statusText: 'Fetching parts from database...' });

    try {
      const blobsToCombine = [];
      // To preserve order, map over audioHistory backwards, but the user selects them via UI checkboxes. 
      // It's better to sort the selected IDs based on their chunksRange or order in history (bottom to top).
      const sortedSelectedItems = [...audioHistory]
        .filter(h => selectedIds.includes(h.id))
        .reverse(); // History is newest first, so reverse to chronological order

      for (const item of sortedSelectedItems) {
        if (item.dbId) {
          const blob = await AudioDB.getAudioBlob(item.dbId);
          if (blob) blobsToCombine.push(blob);
        }
      }

      if (blobsToCombine.length === 0) throw new Error("No audio data found to combine.");

      const combinedBlob = await CloudSpeechSynthesizer.combineSavedBlobs(blobsToCombine, (prog) => {
        setGenerationProgress({ current: 0, total: 100, percent: 50, statusText: prog.statusText });
      });

      const ext = selectedFormat === 'webm' ? 'mp3' : 'wav';
      const filename = `AetherVocal_Combined_${Date.now()}.${ext}`;

      MobileSafeAudioExporter.resumeAudioContext();
      MobileSafeAudioExporter.download(combinedBlob, filename);

    } catch (err) {
      setDownloadError("Combine failed: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0, percent: 0, statusText: '' });
    }
  }, [audioHistory, selectedFormat]);

  const handleDismissError = useCallback(() => setDownloadError(''), []);

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
          <div className="flex flex-col gap-4 min-w-0 w-full overflow-hidden">
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
              isPlaying={isSpeaking}
              onPlaySingleChunk={handlePlaySingleChunk}
              onDownloadSingleChunk={handleDownloadSingleChunk}
            />

            <AudioHistory
              history={audioHistory}
              onClearHistory={handleClearHistory}
              onPlayHistoryItem={handlePlayHistoryItem}
              onCombineAndDownload={handleCombineAndDownload}
              isGenerating={isGenerating}
            />
          </div>

          <div className="flex flex-col gap-4 min-w-0 w-full overflow-hidden">
            <VoiceSelector
              systemVoices={[]}
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
              onStopSample={stopAudio}
            />

            <AudioVisualizer isSpeaking={isSpeaking || isPlayingSample || isGenerating} />
          </div>
        </div>
      </main>

      <FooterPlayer
        isSpeaking={isSpeaking}
        isPaused={isPaused}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        downloadError={downloadError}
        onPlay={handlePlayFullSpeech}
        onPause={handlePause}
        onStop={stopAudio}
        onDownload={handleGenerateBlock} // Block generation triggers here
        onDismissError={handleDismissError}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        stats={{ charCount, wordCount, formattedDuration }}
        isComplete={lastGeneratedChunkIndex >= chunks.length && chunks.length > 0}
        nextChunkIndex={lastGeneratedChunkIndex}
        totalChunks={chunks.length}
      />
    </div>
  );
}
