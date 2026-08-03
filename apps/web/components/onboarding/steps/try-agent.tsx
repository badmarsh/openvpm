"use client";

import { useEffect } from "react";
import { Bot, Sparkles } from "lucide-react";
import type { StepHandle } from "../journey-types";

const EXAMPLE_QUESTION = "Which pets are overdue for vaccines?";
const EXAMPLE_ANSWER =
  "Two of your sample pets look overdue. Biscuit is past due for the DHPP shot, and Luna is coming up soon. Want me to draft a friendly reminder you can send to each owner?";

/** A short, clearly-labeled sample so users see the value even with no AI key. */
function ExampleChat() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
        Príklad
      </div>
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">
            {EXAMPLE_QUESTION}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <div className="max-w-[85%] rounded-lg bg-emerald-50/70 px-3 py-2 text-sm leading-relaxed text-slate-700">
            {EXAMPLE_ANSWER}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 5: let the user try the built-in AI helper. Since the old interactive agent was removed, we just show a friendly note and example.
 */
export function TryAgentStep({
  register,
}: {
  register: (h: StepHandle) => void;
}) {
  useEffect(() => {
    register({ onContinue: async () => true });
  }, [register]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">
        AI je zabudovaná priamo do OpenVPM. Môže odpovedať na vaše otázky
        klinika jednoduchými slovami.
      </p>
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Váš pomocník AI sa zapne po nastavení kľúča AI. Môžete to skúsiť akokoľvek
          čas zo stránky Agent.
        </p>
      </div>
      <ExampleChat />
    </div>
  );
}

