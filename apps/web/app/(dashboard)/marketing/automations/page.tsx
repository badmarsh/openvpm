"use client";

import { useEffect } from "react";
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
  Info,
  Loader2
} from "lucide-react";
import { trpc } from '@/lib/trpc';

export default function AutomationsPage() {
  const utils = trpc.useUtils();
  
  const { data: automations, isLoading, isSuccess } = trpc.automations.getAutomations.useQuery();
  
  const seedDefaultAutomations = trpc.automations.seedDefaultAutomations.useMutation({
    onSuccess: () => {
      utils.automations.getAutomations.invalidate();
    }
  });

  const toggleAutomationMutation = trpc.automations.toggleAutomation.useMutation({
    onSuccess: () => {
      utils.automations.getAutomations.invalidate();
    }
  });

  const createAutomation = trpc.automations.createAutomation.useMutation({
    onSuccess: () => {
      utils.automations.getAutomations.invalidate();
      toast.success("Automatizácia bola vytvorená.");
    }
  });

  useEffect(() => {
    if (isSuccess && automations && automations.length === 0 && !seedDefaultAutomations.isPending) {
      seedDefaultAutomations.mutate();
    }
  }, [isSuccess, automations, seedDefaultAutomations]);

  const toggleAutomation = (id: string) => {
    toggleAutomationMutation.mutate({ automationId: id });
  };

  const handleTestTrigger = () => {
    toast.success("Trigger bol úspešne otestovaný.");
  };

  const handleComingSoon = () => {
    toast.info("Táto funkcia bude čoskoro dostupná.");
  };

  const handleCreateAutomation = () => {
    createAutomation.mutate({
      name: 'Nová automatizácia',
      triggerType: 'appointment_created',
      conditions: { delayDays: 1 },
      actionType: 'email',
      actionPayload: { templatePrompt: 'Ďakujeme za návštevu...' },
      isActive: false,
    });
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
          onClick={handleCreateAutomation}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          automations?.map((automation) => {
            const delayDays = (automation.conditions as { delayDays?: number })?.delayDays;
            const delayText = delayDays ? `Po ${delayDays} dňoch` : 'Okamžite';
            const templatePrompt = (automation.actionPayload as { templatePrompt?: string })?.templatePrompt ?? '';

            return (
              <div 
                key={automation.id} 
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-colors hover:bg-accent/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => toggleAutomation(automation.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      aria-label={automation.isActive ? "Vypnúť automatizáciu" : "Zapnúť automatizáciu"}
                    >
                      {automation.isActive ? (
                        <ToggleRight className="h-8 w-8 text-primary" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{automation.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[500px]">
                        "{templatePrompt}"
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
                    {automation.actionType.toUpperCase() === "EMAIL" ? (
                      <Mail className="h-3.5 w-3.5" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5" />
                    )}
                    {automation.actionType.toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                    {delayText}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
