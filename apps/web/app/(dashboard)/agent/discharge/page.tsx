"use client";

import { useState } from "react";
import { FileText, Loader2, Bot, Send } from "lucide-react";
import { generateDischargeReport } from "@/actions/ai-actions";
import { cn } from "@/lib/utils";

export default function DischargePage() {
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [followUp, setFollowUp] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!petName || !diagnosis) {
      alert("Please enter at least the Pet Name and Diagnosis.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await generateDischargeReport({ petName, species, diagnosis, treatment, followUp });
      if (res?.text) {
        setResult(res.text);
      } else {
        alert("Generation failed or returned empty response.");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate discharge report.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full p-2">
      {/* Left side: Inputs */}
      <div className="flex flex-col gap-4 w-full md:w-1/2 min-h-0 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        
        <div className="flex flex-col gap-4 p-5 border border-border rounded-xl bg-card shadow-sm">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            Detaily prepúšťacej správy
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Meno pacienta *</label>
              <input
                type="text"
                placeholder="napr. Bella"
                className="w-full bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Druh/Plemeno</label>
              <input
                type="text"
                placeholder="napr. Mačka domáca krátkosrstá"
                className="w-full bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Diagnóza *</label>
            <textarea
              placeholder="napr. Gastroenteritída sekundárne k diétnej chybe"
              className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Liečba a lieky</label>
            <textarea
              placeholder="napr. S.c. tekutiny, injekcia Cerenia. Domov s Metronidazolom."
              className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={2}
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Pokyny pre následnú starostlivosť</label>
            <textarea
              placeholder="napr. Kontrola o 3 dni, ak zvracanie pretrváva. Ľahká strava na 5 dní."
              className="w-full resize-none bg-background rounded-lg border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!petName || !diagnosis || isProcessing}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-colors shadow-sm shrink-0",
            petName && diagnosis && !isProcessing
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating Report...</>
          ) : (
            <><Send className="w-5 h-5" /> Vygenerovať správu pre klienta</>
          )}
        </button>
      </div>

      {/* Right side: Results */}
      <div className="flex flex-col border border-border rounded-xl bg-card p-4 shadow-sm w-full md:w-1/2 min-h-0">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-primary shrink-0">
          <Bot className="w-4 h-4" /> Záverečná prepúšťacia správa
        </h3>
        <div className="flex-1 overflow-y-auto p-6 bg-primary/5 rounded-xl text-sm whitespace-pre-wrap border border-primary/10 leading-relaxed font-serif">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-sans">Translating medical jargon for pet owners...</p>
            </div>
          ) : result ? (
            result
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/50 text-center px-8 font-sans">
              Vyplňte klinické detaily a kliknite na vygenerovať pre vytvorenie profesionálnej, ľahko čitateľnej prepúšťacej správy pre majiteľa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
