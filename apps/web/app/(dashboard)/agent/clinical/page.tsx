"use client";

import { useState } from "react";
import { Stethoscope, Loader2, Bot, AlertTriangle, Activity } from "lucide-react";
import { analyzeClinicalCase } from "@/actions/ai-actions";
import { cn } from "@/lib/utils";

export default function ClinicalPage() {
  const [info, setInfo] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medications, setMedications] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");

  const handleAnalyze = async () => {
    if (!symptoms && !medications) {
      alert("Please enter either symptoms or medications to analyze.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await analyzeClinicalCase({ symptoms, medications, info });
      if (res?.text) {
        setResult(res.text);
      } else {
        alert("Analysis failed or returned empty response.");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze clinical case.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-2">
      {/* Left side: Inputs */}
      <div className="flex flex-col gap-4 w-full md:w-1/2 min-h-0 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        
        <div className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-foreground">Informácie o pacientovi</h3>
          </div>
          <label className="text-xs font-medium text-muted-foreground">Druh, plemeno, vek, váha, pohlavie, atď.</label>
          <textarea
            placeholder="napr. 8-ročný kastrovaný samec Zlatý retríver, 32kg"
            className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={2}
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-foreground">Prezentované príznaky</h3>
          </div>
          <label className="text-xs font-medium text-muted-foreground">Klinické príznaky, trvanie, závažnosť</label>
          <textarea
            placeholder="napr. Letargia a zvracanie 2 dni. Bolesť brucha pri palpácii."
            className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Stethoscope className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-foreground">Súčasné lieky</h3>
          </div>
          <label className="text-xs font-medium text-muted-foreground">Aktuálne podávané lieky (pre kontrolu interakcií)</label>
          <textarea
            placeholder="napr. Carprofen 75mg BID, Rimadyl"
            className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={2}
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={(!symptoms && !medications) || isProcessing}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-colors shadow-sm shrink-0",
            (symptoms || medications) && !isProcessing
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Case...</>
          ) : (
            <><Bot className="w-5 h-5" /> Analyzovať klinický prípad</>
          )}
        </button>
      </div>

      {/* Right side: Results */}
      <div className="flex flex-col border border-border rounded-xl bg-card p-4 shadow-sm w-full md:w-1/2 min-h-0">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-primary shrink-0">
          <Bot className="w-4 h-4" /> Klinické zhodnotenie
        </h3>
        <div className="flex-1 overflow-y-auto p-5 bg-primary/5 rounded-xl text-sm whitespace-pre-wrap border border-primary/10 leading-relaxed">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Cross-referencing veterinary literature...</p>
            </div>
          ) : result ? (
            result
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/50 text-center px-8">
              Zadajte detaily pacienta a kliknite na analyzovať pre vygenerovanie diferenciálnych diagnóz a kontrolu liekových interakcií.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
