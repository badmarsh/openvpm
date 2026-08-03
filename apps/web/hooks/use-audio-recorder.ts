import { useState, useRef, useCallback, useEffect } from "react";

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioBase64: string | null;
  error: Error | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioBlob: null,
    audioBase64: null,
    error: null,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: recorder.mimeType });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Extract just the base64 part, discarding the data URL prefix
          const base64 = base64String.split(',')[1];
          setState((s) => ({ ...s, audioBlob, audioBase64: base64, isRecording: false, isPaused: false }));
        };

        // Zastavenie streamu, aby mikrofón nesvietil
        stream.getTracks().forEach((track) => track.stop());
        clearInterval(timerInterval.current as NodeJS.Timeout);
      };

      recorder.start();
      setState((s) => ({
        ...s,
        isRecording: true,
        isPaused: false,
        error: null,
        recordingTime: 0,
        audioBlob: null,
        audioBase64: null,
      }));

      timerInterval.current = setInterval(() => {
        setState((s) => ({ ...s, recordingTime: s.recordingTime + 1 }));
      }, 1000);
    } catch (err) {
      setState((s) => ({ ...s, error: err as Error }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setState((s) => ({ ...s, isPaused: true }));
      clearInterval(timerInterval.current as NodeJS.Timeout);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setState((s) => ({ ...s, isPaused: false }));
      timerInterval.current = setInterval(() => {
        setState((s) => ({ ...s, recordingTime: s.recordingTime + 1 }));
      }, 1000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
