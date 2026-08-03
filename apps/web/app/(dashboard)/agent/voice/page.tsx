"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, FileText, Bot } from "lucide-react";
import { processVoiceScribe } from "@/actions/ai-actions";
import { cn } from "@/lib/utils";

export default function VoiceScribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [soapNote, setSoapNote] = useState("");

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "sk-SK";

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + " ";
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimTranscript(interim);
          if (final) {
            setFinalTranscript((prev) => prev + final);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const fullTranscript = finalTranscript + interimTranscript;

      // Process the final transcript
      if (fullTranscript.trim()) {
        setIsProcessing(true);
        setInterimTranscript("");
        try {
          const res = await processVoiceScribe(fullTranscript);
          if (res?.text) {
            setSoapNote(res.text);
          } else {
            alert("Processing failed or returned empty response.");
          }
        } catch (error) {
          console.error("Failed to process transcript:", error);
          alert("Failed to process voice scribe. Check server authentication and permissions.");
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      setFinalTranscript("");
      setInterimTranscript("");
      setSoapNote("");
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch(e) {
          console.error(e);
          setIsRecording(false);
        }
      } else {
        alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full p-2">
      <div className="flex flex-col items-center justify-center py-10 border border-border rounded-xl bg-card shadow-sm text-center shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <Mic className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold mb-2">AI Hlasový asistent</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-sm">
          Diktujte svoje klinické zistenia a naša AI ich automaticky naformátuje do štruktúrovanej SOAP správy.
        </p>
        
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={cn(
            "flex items-center justify-center w-20 h-20 rounded-full transition-all mb-4",
            isRecording 
              ? "bg-destructive text-destructive-foreground animate-pulse hover:bg-destructive/90 shadow-lg shadow-destructive/20" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
            isProcessing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8 ml-1" /> // Visual optical alignment
          )}
        </button>
        
        <p className="text-sm font-medium">
          {isProcessing 
            ? "Formátujem SOAP správu..." 
            : isRecording 
            ? "Nahrávam... Kliknite pre zastavenie" 
            : "Kliknite pre začatie nahrávania"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 flex-1 pb-4">
        <div className="flex flex-col border border-border rounded-xl bg-card p-4 shadow-sm min-h-0">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <FileText className="w-4 h-4" /> Surový prepis
          </h3>
          <div className="flex-1 overflow-y-auto p-4 bg-muted/40 rounded-lg text-sm whitespace-pre-wrap border border-border/50">
            {finalTranscript}
            <span className="text-muted-foreground italic">{interimTranscript}</span>
            {!finalTranscript && !interimTranscript && (
             <span className="text-muted-foreground/50">Prepis sa zobrazí tu...</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col border border-border rounded-xl bg-card p-4 shadow-sm min-h-0">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-primary shrink-0">
            <Bot className="w-4 h-4" /> AI SOAP správa
          </h3>
          <div className="flex-1 overflow-y-auto p-4 bg-primary/5 rounded-lg text-sm whitespace-pre-wrap border border-primary/10">
            {isProcessing ? (
              <div className="flex items-center gap-2 text-muted-foreground h-full justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Spracovávam pomocou AI...
              </div>
            ) : soapNote ? (
              soapNote
            ) : (
              <div className="text-muted-foreground/50 h-full flex items-center justify-center text-center">
                Naformátovaná SOAP správa sa zobrazí tu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
