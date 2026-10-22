"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Upload, Download, Play, Pause, Scissors, Volume2, Gauge, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function SoundboardStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [volume, setVolume] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [duration, setDuration] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const resetState = () => {
    setAudioBuffer(null);
    setErrorMessage(null);
    setProcessedUrl(null);
    setProcessedBlob(null);
    setIsPlaying(false);
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {}
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    resetState();

    try {
      const arrayBuffer = await selected.arrayBuffer();

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      
      const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
        ctx.decodeAudioData(arrayBuffer, resolve, reject);
      });

      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(Math.min(5, decoded.duration));
    } catch (err) {
      setErrorMessage(
        "Unable to process audio format. The file may be corrupt, DRM-protected, or using an unsupported codec. Try converting it to MP3 or WAV."
      );
    }
  };

  const playPreview = () => {
    if (!audioBuffer) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    if (isPlaying && activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {}
      setIsPlaying(false);
      return;
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    const playDuration = (endTime - startTime) / playbackRate;
    source.start(0, startTime, endTime - startTime);
    setIsPlaying(true);

    activeSourceRef.current = source;

    source.onended = () => {
      setIsPlaying(false);
    };

    setTimeout(() => {
      setIsPlaying(false);
    }, playDuration * 1000);
  };

  const processAudio = async () => {
    if (!audioBuffer) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const sampleRate = audioBuffer.sampleRate;
      const clipDuration = (endTime - startTime) / playbackRate;
      const frameCount = Math.floor(clipDuration * sampleRate);

      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
      );

      const source = offlineCtx.createBufferSource();
      const gainNode = offlineCtx.createGain();

      source.buffer = audioBuffer;
      source.playbackRate.value = playbackRate;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);

      source.start(0, startTime, endTime - startTime);

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWav(renderedBuffer);

      setProcessedBlob(wavBlob);
      setProcessedUrl(URL.createObjectURL(wavBlob));
    } catch (err) {
      setErrorMessage("An error occurred while rendering the audio clip. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    let channels = [], i, sample;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    setUint32(0x46464952); 
    setUint32(length - 8);
    setUint32(0x45564157); 
    setUint32(0x20746d66); 
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); 
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: "audio/wav" });
  };

  const downloadFile = () => {
    if (!processedUrl || !file) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `soundboard_${file.name.split(".")[0] || "audio"}.wav`;
    a.click();
  };

  const selectedDuration = (endTime - startTime) / playbackRate;
  const isOverLimit = selectedDuration > 5.05;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#111214", color: "#f2f3f5", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.025em", color: "#ffffff", marginBottom: "6px" }}>
            Soundboard Studio
          </h1>
          <p style={{ color: "#949ba4", fontSize: "14px", lineHeight: "1.5" }}>
            Trim, adjust playback speed, boost volume, and export optimized clips for a Discord Soundboard.
          </p>
        </div>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type="file"
            accept="audio/mp3, audio/wav, audio/ogg, audio/aac, audio/m4a, audio/flac"
            onChange={handleFileChange}
            id="audio-upload"
            style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer", zIndex: 10 }}
          />
          <label
            htmlFor="audio-upload"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 16px",
              border: "1px dashed #2b2d31",
              borderRadius: "8px",
              backgroundColor: "#1e1f22",
              cursor: "pointer",
              transition: "border-color 0.15s ease",
            }}
          >
            <Upload style={{ width: "22px", height: "22px", color: "#949ba4", marginBottom: "10px" }} />
            <span style={{ fontSize: "14px", fontWeight: "500", color: "#dbdee1" }}>
              {file ? file.name : "Choose an audio file or drop it here"}
            </span>
            <span style={{ fontSize: "12px", color: "#80848e", marginTop: "4px" }}>
              Supports MP3, WAV, OGG, M4A, FLAC
            </span>
          </label>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: "rgba(242, 63, 67, 0.1)", border: "1px solid #f23f43", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", color: "#f23f43", fontSize: "13px" }}>
            <AlertCircle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {audioBuffer && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <button
                onClick={playPreview}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 18px",
                  backgroundColor: isPlaying ? "#f23f43" : "#acf6c8",
                  color: isPlaying ? "#ffffff" : "#000000",
                  fontWeight: "600",
                  fontSize: "13px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                {isPlaying ? <Pause style={{ width: "15px", height: "15px" }} /> : <Play style={{ width: "15px", height: "15px" }} />}
                {isPlaying ? "Pause Preview" : "Play Selection"}
              </button>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: "700", color: isOverLimit ? "#f23f43" : "#acf6c8" }}>
                  {selectedDuration.toFixed(2)}s / 5.00s max {isOverLimit && "(Exceeds Limit)"}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Scissors style={{ width: "14px", height: "14px" }} /> Start Trim</span>
                  <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{startTime.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.05"
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < endTime) setStartTime(val);
                  }}
                  style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Scissors style={{ width: "14px", height: "14px" }} /> End Trim</span>
                  <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{endTime.toFixed(2)}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.05"
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > startTime) setEndTime(val);
                  }}
                  style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Gauge style={{ width: "14px", height: "14px" }} /> Speed Multiplier</span>
                  <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{playbackRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#b5bac1", marginBottom: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Volume2 style={{ width: "14px", height: "14px" }} /> Volume Boost</span>
                  <span style={{ fontFamily: "monospace", color: "#ffffff" }}>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "#acf6c8", cursor: "pointer" }}
                />
              </div>

            </div>

            <button
              onClick={processAudio}
              disabled={isProcessing || isOverLimit}
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 16px",
                backgroundColor: "#acf6c8",
                color: "#000000",
                fontWeight: "600",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                cursor: isProcessing || isOverLimit ? "not-allowed" : "pointer",
                opacity: isProcessing || isOverLimit ? 0.5 : 1,
                transition: "opacity 0.15s ease",
              }}
            >
              {isProcessing ? <RefreshCw style={{ width: "16px", height: "16px" }} /> : ""}
              {isProcessing ? "Exporting Audio..." : "Get Audio File"}
            </button>

          </div>
        )}

        {processedUrl && (
          <div style={{ marginTop: "20px", backgroundColor: "#1e1f22", border: "1px solid #2b2d31", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#ffffff" }}>Audio Clip Ready</div>
              <div style={{ fontSize: "12px", color: "#80848e", marginTop: "2px" }}>
                Optimized WAV clip ({(processedBlob ? processedBlob.size / 1024 : 0).toFixed(1)} KB)
              </div>
            </div>
            <button
              onClick={downloadFile}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                backgroundColor: "#acf6c8",
                color: "#000000",
                fontSize: "13px",
                fontWeight: "600",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <Download style={{ width: "14px", height: "14px" }} />
              Download WAV
            </button>
          </div>
        )}

        <canvas style={{ display: "none" }} />
      </div>
    </div>
  );
}