import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FeatureCards } from './components/FeatureCards';
import { TextEditor } from './components/TextEditor';
import { ChunkQueue } from './components/ChunkQueue';
import { SpeechPartQueue } from './components/SpeechPartQueue';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioVisualizer } from './components/AudioVisualizer';
import { FooterPlayer } from './components/FooterPlayer';
import { AudioHistory } from './components/AudioHistory';
import { StudioMixer } from './components/StudioMixer';
import { PREMIUM_VOICE_PROFILES } from './utils/voiceProfiles';
import { MobileSafeAudioExporter } from './utils/MobileSafeAudioExporter';
import { CloudSpeechSynthesizer } from './utils/CloudSpeechSynthesizer';
import { AudioDB } from './utils/audioDB';
import { mixAudioBlobWithBGM } from './utils/ambientSoundscapes';
import { AudioCompressor } from './utils/audioCompressor';
import { generateSafeFilename } from './utils/textSanitizer';

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

  // Studio BGM & Mixer State
  const [selectedBgm, setSelectedBgm] = useState('none');
  const [bgmVolume, setBgmVolume] = useState(0.15);
  const [reverbPreset, setReverbPreset] = useState('subtle');

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
  const [compressionReport, setCompressionReport] = useState(null);
  const [enableCompression, setEnableCompression] = useState(true);

  // Auto-Queue Batch Generation State
  const [autoGenerateAll, setAutoGenerateAll] = useState(false);
  const [autoQueueActive, setAutoQueueActive] = useState(false);
  const autoGenerateRef = useRef(false); // Ref to track cancel in async chain
  const [selectedQueueParts, setSelectedQueueParts] = useState([]);
  const [generatingPartNum, setGeneratingPartNum] = useState(null);
  const remainingPartsRef = useRef([]);
  const totalSelectedPartsRef = useRef(0);

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
  const generateBlockRef = useRef(null);

  // Sync theme attribute to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Split text into chunks
  useEffect(() => {
    if (!text.trim()) {
      setChunks([]);
      setLastGeneratedChunkIndex(0);
      setSelectedQueueParts([]);
      return;
    }
    const rawChunks = CloudSpeechSynthesizer.smartChunkText(text, 180);
    const newChunks = rawChunks.length > 0 ? rawChunks : [text.trim()];
    setChunks(newChunks);
    
    // Auto-select all parts initially
    const totalParts = Math.ceil(newChunks.length / 20);
    const initialParts = Array.from({ length: totalParts }, (_, i) => i + 1);
    setSelectedQueueParts(initialParts);
    
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

  // ─── PLAY FULL SPEECH (PREVIEW ONLY — NON-BLOCKING) ───
  const handlePlayFullSpeech = useCallback(async () => {
    if (!text.trim()) return;

    if (isPaused) {
      audioRef.current.play();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    stopAudio();
    // NOTE: We do NOT set isGenerating here — preview is non-blocking

    try {
      let { wavBlob } = await CloudSpeechSynthesizer.synthesize(text, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(text) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate,
        startIndex: 0,
        maxChunks: 20, // Preview only first 20 chunks to avoid timeout
      });

      if (!wavBlob) throw new Error('Audio generation failed.');

      // Mix BGM Soundscape if enabled
      if (selectedBgm !== 'none') {
        wavBlob = await mixAudioBlobWithBGM(wavBlob, selectedBgm, bgmVolume);
      }

      setIsSpeaking(true);
      await playBlob(wavBlob);
    } catch (e) {
      setDownloadError(e.message || "Failed to preview.");
    }
  }, [text, isPaused, targetLang, pitch, rate, selectedBgm, bgmVolume]);

  // ─── PAUSE ───
  const handlePause = useCallback(() => {
    if (isSpeaking) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // ─── PLAY SINGLE CHUNK (NON-BLOCKING) ───
  const handlePlaySingleChunk = useCallback(async (chunkText, index) => {
    stopAudio();
    setActiveChunkIndex(index);
    // NOTE: We do NOT set isGenerating here — chunk preview is non-blocking
    try {
      let { wavBlob } = await CloudSpeechSynthesizer.synthesize(chunkText, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(chunkText) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate
      });
      if (wavBlob) {
        if (selectedBgm !== 'none') {
          wavBlob = await mixAudioBlobWithBGM(wavBlob, selectedBgm, bgmVolume);
        }
        setIsSpeaking(true);
        await playBlob(wavBlob);
      } else {
        setActiveChunkIndex(-1);
      }
    } catch (e) {
      setActiveChunkIndex(-1);
    }
  }, [targetLang, pitch, rate, selectedBgm, bgmVolume]);

  // ─── PLAY SAMPLE (NON-BLOCKING) ───
  const handlePlaySample = useCallback(async (profile) => {
    stopAudio();
    setIsPlayingSample(true);
    // NOTE: We do NOT set isGenerating here — sample playback is non-blocking
    const sample = profile.sampleText || 'AetherVocal Studio Speech Synthesis';
    try {
      const rawLang = profile.lang || 'hi';
      const cleanLang = rawLang.split('-')[0];
      const { wavBlob } = await CloudSpeechSynthesizer.synthesize(sample, { 
        lang: cleanLang,
        pitch: profile.defaultPitch || 1.0,
        rate: profile.defaultRate || 1.0,
        engine: profile.engine,
        voiceProfile: profile
      });
      if (wavBlob) {
        await playBlob(wavBlob, () => setIsPlayingSample(false));
      } else {
        setIsPlayingSample(false);
      }
    } catch (e) {
      console.warn("Play sample error:", e);
      setIsPlayingSample(false);
    }
  }, [stopAudio, playBlob]);

  // ─── DOWNLOAD SINGLE CHUNK (WITH COMPRESSION & SCRIPT FILENAME) ───
  const handleDownloadSingleChunk = useCallback(async (chunkText, index) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setDownloadError('');
    try {
      let { wavBlob } = await CloudSpeechSynthesizer.synthesize(chunkText, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(chunkText) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate,
      });
      if (wavBlob) {
        if (selectedBgm !== 'none') {
          wavBlob = await mixAudioBlobWithBGM(wavBlob, selectedBgm, bgmVolume);
        }

        const rawSize = wavBlob.size;
        let downloadBlob = wavBlob;
        let ext = 'wav';
        if (selectedFormat === 'webm') {
          downloadBlob = await AudioCompressor.encodeToCompressedFormat(wavBlob);
          ext = 'mp3';
        } else if (enableCompression) {
          setGenerationProgress({ current: index + 1, total: chunks.length, percent: 85, statusText: '⚡ Compressing chunk audio...' });
          downloadBlob = await AudioCompressor.compressWavBlob(wavBlob, { targetSampleRate: 22050, mono: true });
        }

        const filename = generateSafeFilename(chunkText, `Chunk_${index + 1}`, ext);
        MobileSafeAudioExporter.resumeAudioContext();
        MobileSafeAudioExporter.download(downloadBlob, filename);

        if (enableCompression || selectedFormat === 'webm') {
          const stats = AudioCompressor.getCompressionStats(rawSize, downloadBlob.size);
          setCompressionReport({
            filename,
            originalFormatted: stats.originalFormatted,
            compressedFormatted: stats.compressedFormatted,
            reductionPercent: stats.reductionPercent,
            format: ext.toUpperCase()
          });
        }
      }
    } catch (err) {
      console.warn('Chunk download error:', err);
      setDownloadError(err?.message || 'Chunk download failed.');
    } finally {
      setIsGenerating(false);
    }
  }, [targetLang, pitch, rate, isGenerating, selectedBgm, bgmVolume, selectedFormat, chunks.length, enableCompression]);

  // ─── DOWNLOAD: BLOCK GENERATION (WITH AUTO-QUEUE & COMPRESSION) ───
  const handleGenerateBlock = useCallback(async () => {
    if (!text.trim() || isGenerating) return;

    // NOTE: We do NOT call stopAudio() — generation is non-blocking for playback
    setIsGenerating(true);
    setDownloadError('');

    const totalParts = Math.ceil(chunks.length / 20);
    let partNum;

    if (autoGenerateRef.current) {
      if (remainingPartsRef.current.length === 0) {
        setAutoQueueActive(false);
        autoGenerateRef.current = false;
        setIsGenerating(false);
        setDownloadError("Generation complete. Select parts in History to Combine & Download!");
        return;
      }
      partNum = remainingPartsRef.current.shift();
    } else {
      if (selectedQueueParts.length > 0) {
        const sorted = [...selectedQueueParts].sort((a, b) => a - b);
        partNum = sorted[0];
      } else {
        partNum = Math.floor(lastGeneratedChunkIndex / 20) + 1;
      }
    }

    if (partNum > totalParts) {
      setAutoQueueActive(false);
      autoGenerateRef.current = false;
      setIsGenerating(false);
      return;
    }

    const startIndex = (partNum - 1) * 20;
    setGeneratingPartNum(partNum);

    try {
      const totalSelected = totalSelectedPartsRef.current || 1;
      const completedCount = autoGenerateRef.current 
        ? Math.max(1, totalSelected - remainingPartsRef.current.length)
        : partNum;

      let { wavBlob, endIndex, isComplete } = await CloudSpeechSynthesizer.synthesize(text, {
        lang: targetLang === 'all' ? (/[\u0900-\u097F]/.test(text) ? 'hi' : 'en') : targetLang,
        pitch: pitch,
        rate: rate,
        startIndex: startIndex,
        maxChunks: 20, // Strict API limit per block
        onProgress: (progress) => {
          setGenerationProgress({
            ...progress,
            partNumber: autoGenerateRef.current ? completedCount : partNum,
            totalParts: autoGenerateRef.current ? totalSelected : totalParts,
            statusText: autoGenerateRef.current
              ? `Part ${completedCount} of ${totalSelected} (Part ${partNum}) • Chunk ${progress.current}/${progress.total}`
              : progress.statusText
          });
        }
      });

      if (!wavBlob || wavBlob.size < 100) {
        throw new Error('Audio generation failed. Block might be empty.');
      }

      // Mix BGM Soundscape if enabled
      if (selectedBgm !== 'none') {
        setGenerationProgress({ current: 0, total: 100, percent: 95, statusText: 'Blending BGM soundscape into audio...' });
        wavBlob = await mixAudioBlobWithBGM(wavBlob, selectedBgm, bgmVolume);
      }

      // Smart compression before saving — reduces IndexedDB storage (if enabled)
      if (enableCompression) {
        setGenerationProgress(prev => ({ ...prev, percent: 98, statusText: `⚡ Compressing Part ${partNum} Audio...` }));
        wavBlob = await AudioCompressor.compressWavBlob(wavBlob, { targetSampleRate: 22050, mono: true });
      }

      // Save to IndexedDB
      const dbId = `audio_blob_${Date.now()}`;
      await AudioDB.saveAudioBlob(dbId, wavBlob);

      const historyItem = {
        id: dbId,
        title: `Part ${partNum}: ` + text.slice(startIndex * 50, (startIndex * 50) + 40) + '...',
        voiceName: selectedProfile?.name || 'Standard Voice',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        format: 'WAV',
        dbId: dbId,
        chunksRange: `${startIndex + 1} - ${endIndex}`,
        isPart: true
      };

      const updatedHistory = [historyItem, ...audioHistory]; // Keep all generated parts (no 50-limit cap!)
      setAudioHistory(updatedHistory);
      localStorage.setItem('aethervocal_audio_history', JSON.stringify(updatedHistory));

      setLastGeneratedChunkIndex(endIndex);
      
      // Uncheck the part from queue
      setSelectedQueueParts(prev => prev.filter(p => p !== partNum));

      if (autoGenerateRef.current) {
        if (remainingPartsRef.current.length === 0) {
           setAutoQueueActive(false);
           autoGenerateRef.current = false;
           setDownloadError("Generation complete. Select parts in History to Combine & Download!");
        } else {
           // Auto-queue: schedule next part after a brief UI update delay
           setIsGenerating(false);
           setTimeout(() => {
             if (generateBlockRef.current) generateBlockRef.current();
           }, 800);
           return; // Don't hit the finally block's setIsGenerating(false) yet
        }
      } else {
         if (isComplete) {
            setDownloadError("Generation complete. Select parts in History to Combine & Download!");
         }
      }

    } catch (err) {
      console.warn('Audio download error:', err);
      setDownloadError(err?.message || 'Audio generate nahi ho saka. Kripya punah prayas karein.');
      setAutoQueueActive(false);
      autoGenerateRef.current = false;
    } finally {
      setIsGenerating(false);
      setGeneratingPartNum(null);
    }
  }, [text, isGenerating, selectedProfile, targetLang, audioHistory, lastGeneratedChunkIndex, pitch, rate, selectedBgm, bgmVolume, chunks.length, enableCompression, selectedQueueParts]);

  // Sync generateBlockRef so setTimeout always uses the latest closure
  useEffect(() => {
    generateBlockRef.current = handleGenerateBlock;
  }, [handleGenerateBlock]);

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
    // NOTE: We do NOT set isGenerating here — history playback is non-blocking
    try {
      const blob = await AudioDB.getAudioBlob(item.dbId);
      if (blob) {
        setIsSpeaking(true);
        await playBlob(blob);
      }
    } catch (e) {
      console.warn("Could not load history audio");
    }
  }, []);

  const handleCombineAndDownload = useCallback(async (selectedIds) => {
    if (selectedIds.length === 0) return;
    setIsGenerating(true);
    setDownloadError('');
    setGenerationProgress({ current: 0, total: 100, percent: 10, statusText: 'Fetching parts from database...' });

    try {
      const blobsToCombine = [];
      const sortedSelectedItems = [...audioHistory]
        .filter(h => selectedIds.includes(h.id))
        .reverse();

      for (const item of sortedSelectedItems) {
        if (item.dbId) {
          const blob = await AudioDB.getAudioBlob(item.dbId);
          if (blob) blobsToCombine.push(blob);
        }
      }

      if (blobsToCombine.length === 0) throw new Error("No audio data found to combine.");

      const combinedBlob = await CloudSpeechSynthesizer.combineSavedBlobs(blobsToCombine, (prog) => {
        setGenerationProgress({ current: 0, total: 100, percent: 60, statusText: prog.statusText });
      });

      const rawSize = combinedBlob.size;
      let downloadBlob = combinedBlob;
      let ext = 'wav';
      if (selectedFormat === 'webm') {
        setGenerationProgress({ current: 0, total: 100, percent: 85, statusText: '⚡ Encoding MP3 audio...' });
        downloadBlob = await AudioCompressor.encodeToCompressedFormat(combinedBlob);
        ext = 'mp3';
      } else if (enableCompression) {
        setGenerationProgress({ current: 0, total: 100, percent: 85, statusText: '⚡ Compressing combined audio...' });
        downloadBlob = await AudioCompressor.compressWavBlob(combinedBlob, { targetSampleRate: 22050, mono: true });
        ext = 'wav';
      }

      const tag = selectedIds.length > 1 ? 'Combined' : 'Part';
      const filename = generateSafeFilename(text, tag, ext);

      MobileSafeAudioExporter.resumeAudioContext();
      MobileSafeAudioExporter.download(downloadBlob, filename);

      if (enableCompression || selectedFormat === 'webm') {
        const stats = AudioCompressor.getCompressionStats(rawSize, downloadBlob.size);
        setCompressionReport({
          filename,
          originalFormatted: stats.originalFormatted,
          compressedFormatted: stats.compressedFormatted,
          reductionPercent: stats.reductionPercent,
          format: ext.toUpperCase()
        });
      }

    } catch (err) {
      setDownloadError("Combine failed: " + err.message);
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0, percent: 0, statusText: '' });
    }
  }, [audioHistory, selectedFormat, text, enableCompression]);

  const handleDismissError = useCallback(() => setDownloadError(''), []);
  const handleDismissCompressionReport = useCallback(() => setCompressionReport(null), []);

  // ─── AUTO-QUEUE HANDLERS ───
  const handleAutoGenerateAll = useCallback(() => {
    if (isGenerating) return;
    
    // Set up the queue based on selected parts
    if (selectedQueueParts.length === 0) {
      setDownloadError("Please select at least one part to generate.");
      return;
    }
    const sortedParts = [...selectedQueueParts].sort((a, b) => a - b);
    remainingPartsRef.current = [...sortedParts];
    totalSelectedPartsRef.current = sortedParts.length;

    setAutoGenerateAll(true);
    setAutoQueueActive(true);
    autoGenerateRef.current = true;
    
    // Trigger the first block — the chain will continue via handleGenerateBlock
    setTimeout(() => {
      if (generateBlockRef.current) generateBlockRef.current();
    }, 100);
  }, [isGenerating, selectedQueueParts]);

  const handleCancelAutoQueue = useCallback(() => {
    setAutoGenerateAll(false);
    setAutoQueueActive(false);
    autoGenerateRef.current = false;
    // Current block will finish, but no next block will be triggered
  }, []);

  const handleToggleAutoGenerate = useCallback(() => {
    setAutoGenerateAll(prev => {
      const next = !prev;
      if (next && !isGenerating && selectedQueueParts.length > 0) {
        setTimeout(() => handleAutoGenerateAll(), 50);
      }
      return next;
    });
  }, [isGenerating, selectedQueueParts, handleAutoGenerateAll]);

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
              onGenerateAudio={handleGenerateBlock}
            />

            <SpeechPartQueue
              chunks={chunks}
              selectedQueueParts={selectedQueueParts}
              setSelectedQueueParts={setSelectedQueueParts}
              generatingPartNum={generatingPartNum}
              isGenerating={isGenerating}
            />

            <ChunkQueue
              chunks={chunks}
              activeChunkIndex={activeChunkIndex}
              isPlaying={isSpeaking && !isPaused}
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

            <StudioMixer
              selectedBgm={selectedBgm}
              setSelectedBgm={setSelectedBgm}
              bgmVolume={bgmVolume}
              setBgmVolume={setBgmVolume}
              reverbPreset={reverbPreset}
              setReverbPreset={setReverbPreset}
            />

            <AudioVisualizer
              isSpeaking={isSpeaking || isPlayingSample}
              isGenerating={isGenerating}
            />
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
        onDownload={selectedQueueParts.length > 0 || autoGenerateAll ? handleAutoGenerateAll : handleGenerateBlock}
        onDismissError={handleDismissError}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        enableCompression={enableCompression}
        setEnableCompression={setEnableCompression}
        stats={{ charCount, wordCount, formattedDuration }}
        isComplete={lastGeneratedChunkIndex >= chunks.length && chunks.length > 0}
        nextChunkIndex={lastGeneratedChunkIndex}
        totalChunks={chunks.length}
        autoGenerateAll={autoGenerateAll}
        onToggleAutoGenerate={handleToggleAutoGenerate}
        autoQueueActive={autoQueueActive}
        onCancelAutoQueue={handleCancelAutoQueue}
        totalParts={selectedQueueParts.length > 0 ? (autoQueueActive ? (totalSelectedPartsRef.current || selectedQueueParts.length) : selectedQueueParts.length) : Math.ceil(chunks.length / 20)}
        currentPartNumber={autoQueueActive && totalSelectedPartsRef.current > 0 ? Math.max(1, totalSelectedPartsRef.current - remainingPartsRef.current.length) : 1}
        selectedQueuePartsCount={selectedQueueParts.length}
        compressionReport={compressionReport}
        onDismissCompressionReport={handleDismissCompressionReport}
      />
    </div>
  );
}

