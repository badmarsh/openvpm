"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { isSafeCheckoutRedirectUrl } from "@/lib/checkout-redirect";
import { toast } from "sonner";
import type { StepHandle } from "../journey-types";

/**
 * Optional step: add a card to lock in the plan. Never forced — Continue always
 * skips. "Add a card" opens Stripe Checkout (off-site); before redirecting we
 * advance the durable journey cursor to the closing step, so when Stripe returns
 * to the app the wizard resumes at "You're all set" rather than back here.
 */
export function AddACardStep({
  register,
}: {
  register: (h: StepHandle) => void;
}) {
  const subscription = trpc.subscription.get.useQuery(undefined, {
    retry: false,
  });
  const setJourneyProgress = trpc.settings.setJourneyProgress.useMutation();
  const createCheckout = trpc.subscription.createCheckout.useMutation();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Skippable: Continue never blocks.
    register({ onContinue: async () => true });
  }, [register]);

  const unitPrice = subscription.data?.locationUnitPriceMonthlyUsd ?? 79;
  const alreadyHasCard = !!subscription.data?.hasBillingAccount;

  async function addCard() {
    if (redirecting) return;
    setRedirecting(true);
    try {
      // Resume at the closing step when Stripe sends the user back.
      await setJourneyProgress.mutateAsync({ stepId: "allSet" });
      const result = await createCheckout.mutateAsync({
        tier: "cloud",
        // Stripe sends the admin back into the guided setup, not billing.
        returnTo: "setup",
      });
      const url = result?.url;
      if (!url || !isSafeCheckoutRedirectUrl(url)) {
        toast.error("Pokladňa je momentálne nedostupná. Skúste to znova.");
        setRedirecting(false);
        return;
      }
      window.location.href = url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not start checkout."
      );
      setRedirecting(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        
        Toto je voliteľné. Vaša 14-dňová skúšobná verzia je plne vybavená a nepotrebuje žiadnu kartu.
        Pridajte jeden, kedykoľvek budete pripravení, a váš plán bude pokračovať bez prestávky
        súdny proces končí.
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-600">OpenVPM Cloud</span>
          <span className="font-heading text-lg font-bold text-slate-900">
            ${unitPrice}
            <span className="text-sm font-normal text-slate-500">
              
              /miesto / mesiac
            </span>
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          
          Vrátane neobmedzeného počtu zamestnancov. Fakturované až po bezplatnej skúšobnej verzii.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        
        Stripe spravuje platby bezpečne. Zrušiť kedykoľvek.
      </div>

      {alreadyHasCard ? (
        <p className="text-sm font-medium text-emerald-700">
          
          Karta je už uložená. Všetko je nastavené.
        </p>
      ) : (
        <Button type="button" variant="outline" onClick={addCard} disabled={redirecting}>
          {redirecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          
          Pridať kartu
        </Button>
      )}
    </div>
  );
}
