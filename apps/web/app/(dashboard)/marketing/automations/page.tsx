"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Zap, 
  ToggleLeft, 
  ToggleRight, 
  Mail, 
  MessageSquare, 
  Play, 
  Edit2, 
  Plus, 
  Info 
} from "lucide-react";

const MOCK_AUTOMATIONS = [
  {
    id: "1",
    trigger: "Návšteva dokončená",
    snippet: "Ďakujeme za návštevu. Ako ste boli spokojní s našimi službami?",
    channel: "Email",
    delay: "Po 1 hodine",
    active: true,
  },
  {
    id: "2",
    trigger: "Nestihnutá schôdzka",
    snippet: "Zabudli ste na schôdzku. Prosím, dohodnite si nový termín v našom kalendári.",
    channel: "SMS",
    delay: "Po 24 hodinách",
    active: false,
  },
  {
    id: "3",
    trigger: "Platba zlyhala",
    snippet: "Problém s platbou faktúry. Prosím, skontrolujte si zadané údaje.",
    channel: "Email",
    delay: "Okamžite",
    active: true,
  },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, active: !auto.active } : auto
      )
    );
  };

  const handleTestTrigger = () => {
    toast.success("Trigger bol úspešne otestovaný.");
  };

  const handleComingSoon = () => {
    toast.info("Táto funkcia bude čoskoro dostupná.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Automatizácie</h1>
            <p className="text-sm text-muted-foreground">
              Spravujte automatické správy a triggery pre vašich klientov
            </p>
          </div>
        </div>
        <button
          onClick={handleComingSoon}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nová automatizácia
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="text-sm">
          Automatizácie sú momentálne v beta verzii. Pre aktiváciu kontaktujte podporu.
        </p>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <div 
            key={automation.id} 
            className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-colors hover:bg-accent/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => toggleAutomation(automation.id)}
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                  aria-label={automation.active ? "Vypnúť automatizáciu" : "Zapnúť automatizáciu"}
                >
                  {automation.active ? (
                    <ToggleRight className="h-8 w-8 text-primary" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </button>
                <div className="space-y-1">
                  <h3 className="font-semibold">{automation.trigger}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 max-w-[500px]">
                    "{automation.snippet}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTestTrigger}
                  className="hidden sm:flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-xs font-medium hover:bg-accent transition-colors"
                  title="Test trigger"
                >
                  <Play className="h-3.5 w-3.5" />
                  Test
                </button>
                <button
                  onClick={handleComingSoon}
                  className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent transition-colors"
                  title="Upraviť"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-12 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                {automation.channel === "Email" ? (
                  <Mail className="h-3.5 w-3.5" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                {automation.channel}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                {automation.delay}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
