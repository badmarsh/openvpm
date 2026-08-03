"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Loader2, Bot, X } from "lucide-react";
import { analyzeMedicalImage } from "@/actions/ai-actions";
import { cn } from "@/lib/utils";

export default function ImagingPage() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(""); // Clear previous results on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsProcessing(true);
    try {
      // Extract base64 part
      const cleanBase64 = image.includes(',') ? image.split(',')[1] : image;

      const res = await analyzeMedicalImage(cleanBase64, prompt);
      if (res?.text) {
        setResult(res.text);
      } else {
        alert("Analysis failed or returned empty response.");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze image. Check server authentication and permissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-2">
      {/* Left side: Upload and config */}
      <div className="flex flex-col gap-4 w-full md:w-1/2 min-h-0">
        <div className="flex-1 flex flex-col border border-border rounded-xl bg-card shadow-sm p-4 relative min-h-0">
          {!image ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-1">Nahrať medicínsky obraz</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">
                Nahrajte röntgeny, MRI, ultrazvuky alebo klinické fotky na AI analýzu.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2 shadow-sm"
              >
                <Upload className="w-4 h-4" /> Vybrať súbor
              </button>
            </div>
          ) : (
            <div className="flex-1 relative flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden border border-border">
              <button 
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background text-foreground rounded-md shadow-sm z-10 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Uploaded medical image" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
        </div>

        <div className="flex flex-col gap-3 shrink-0 p-4 border border-border rounded-xl bg-card shadow-sm">
          <label className="text-sm font-medium text-foreground">Špecifické zameranie alebo otázka (Voliteľné)</label>
          <textarea
            placeholder="napr. Hľadajte známky osteoartrózy v bedrovom kĺbe..."
            className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={!image || isProcessing}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium transition-colors",
              image && !isProcessing
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Image...</>
            ) : (
              <><Bot className="w-4 h-4" /> Analyzovať obraz</>
            )}
          </button>
        </div>
      </div>

      {/* Right side: Results */}
      <div className="flex flex-col border border-border rounded-xl bg-card p-4 shadow-sm w-full md:w-1/2 min-h-0">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-primary shrink-0">
          <Bot className="w-4 h-4" /> Výsledky analýzy
        </h3>
        <div className="flex-1 overflow-y-auto p-4 bg-primary/5 rounded-lg text-sm whitespace-pre-wrap border border-primary/10">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Analyzing image structure and patterns...</p>
            </div>
          ) : result ? (
            result
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/50 text-center">
              Nahrajte snímok a kliknite na analyzovať, aby ste tu videli AI hodnotenie
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
