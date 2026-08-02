"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  defaultMessagingSetupMode,
  setupModeTitle,
  type MessagingSetupMode,
} from "@/lib/messaging/setup-wizard";
import {
  isMessagingAreaCodeInputValid,
  MESSAGING_AREA_CODE_LENGTH,
} from "@/lib/messaging/policy";
import { toast } from "sonner";

export type MessagingSetupLocation = {
  locationId: string;
  name: string;
  isPrimary: boolean;
  existingPhone: string | null;
  messaging: {
    senderE164: string | null;
    messagingProfileId: string | null;
    numberSource: "hosted" | "purchased" | "toll_free" | null;
    registrationStatus:
      | "not_started"
      | "pending"
      | "active"
      | "action_required"
      | "failed"
      | "suspended";
    registrationDetail: string | null;
    enabled: boolean;
  } | null;
};

type Step = "choose" | "confirm" | "registration" | "done";
type SearchNumber = { phoneNumber: string; monthlyCost: string | null };

/** Format a provider's raw monthly cost (e.g. "1.00000") as "$1.00". */
function formatMonthlyCost(cost: string | null): string | null {
  if (!cost) return null;
  const value = Number(cost);
  if (!Number.isFinite(value)) return null;
  return `$${value.toFixed(2)}`;
}

const STEPS: { id: Step; title: string }[] = [
  { id: "choose", title: "Vyberte si číslo pre SMS" },
  { id: "confirm", title: "Potvrďte číslo" },
  { id: "registration", title: "Registrácia dopravcu" },
  { id: "done", title: "Čaká sa na registráciu" },
];

export function MessagingWizard({
  location,
  open,
  onOpenChange,
  onChanged,
}: {
  location: MessagingSetupLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const utils = trpc.useUtils();
  const defaultMode = useMemo(
    () => defaultMessagingSetupMode(location?.existingPhone),
    [location?.existingPhone]
  );
  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<MessagingSetupMode>(defaultMode);
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    detail?: string;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [numbers, setNumbers] = useState<SearchNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [provisionedSender, setProvisionedSender] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !location) return;
    setStep("choose");
    setMode(defaultMessagingSetupMode(location.existingPhone));
    setEligibility(null);
    setChecking(false);
    setAreaCode("");
    setNumbers([]);
    setSelectedNumber(null);
    setProvisionedSender(null);
  }, [open, location]);

  const provision = trpc.messaging.provisionNumber.useMutation({
    onSuccess: (result) => {
      setProvisionedSender(result.senderE164);
      setStep("done");
      toast.success("Online");
      onChanged();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!open || !location) return null;
  const activeLocation = location;

  const currentIndex = STEPS.findIndex((s) => s.id === step);
  const canContinue =
    step === "choose" ||
    step === "registration" ||
    step === "done" ||
    (mode === "host" && eligibility?.eligible === true) ||
    (mode === "buy" && Boolean(selectedNumber));

  async function checkExisting() {
    if (!location) return;
    setChecking(true);
    try {
      const result = await utils.messaging.checkEligibility.fetch({
        locationId: location.locationId,
      });
      setEligibility(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eligibility check failed");
    } finally {
      setChecking(false);
    }
  }

  async function searchNumbers() {
    if (!isMessagingAreaCodeInputValid(areaCode)) return;
    setChecking(true);
    try {
      const result = await utils.messaging.searchNumbers.fetch(
        areaCode ? { areaCode } : {}
      );
      setNumbers(result);
      setSelectedNumber(result[0]?.phoneNumber ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Number search failed");
    } finally {
      setChecking(false);
    }
  }

  function handleContinue() {
    if (step === "choose") {
      setStep("confirm");
      return;
    }
    if (step === "confirm") {
      if (mode === "host" && eligibility === null) {
        void checkExisting();
        return;
      }
      if (mode === "buy" && numbers.length === 0) {
        void searchNumbers();
        return;
      }
      setStep("registration");
      return;
    }
    if (step === "registration") {
      provision.mutate({
        locationId: activeLocation.locationId,
        mode,
        phoneNumber: mode === "buy" ? selectedNumber ?? undefined : undefined,
      });
      return;
    }
    onOpenChange(false);
  }

  function handleBack() {
    if (step === "choose" || provision.isPending) return;
    const previous = STEPS[Math.max(0, currentIndex - 1)]?.id ?? "choose";
    setStep(previous);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set up texting"
      className="fixed inset-0 z-[90] overflow-y-auto bg-[linear-gradient(135deg,#f8fafc_0%,#ecfdf5_52%,#f0fdfa_100%)] p-4 text-slate-950 sm:p-6"
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-white/80 bg-white p-6 shadow-xl shadow-emerald-200/30 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                <MessageSquare className="h-4 w-4" />
                
                To je celý váš deň
              </div>
              <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-slate-950">
                {STEPS[currentIndex]?.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {location.name}
                {location.isPrimary ? " primary location" : ""}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close texting setup"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= currentIndex ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            ))}
          </div>

          <div className="mt-6 min-h-[18rem]">
            {step === "choose" ? (
              <ChooseStep
                mode={mode}
                setMode={setMode}
                existingPhone={location.existingPhone}
              />
            ) : null}
            {step === "confirm" ? (
              <ConfirmStep
                mode={mode}
                location={location}
                eligibility={eligibility}
                checking={checking}
                checkExisting={checkExisting}
                areaCode={areaCode}
                setAreaCode={setAreaCode}
                numbers={numbers}
                selectedNumber={selectedNumber}
                setSelectedNumber={setSelectedNumber}
                searchNumbers={searchNumbers}
              />
            ) : null}
            {step === "registration" ? (
              <RegistrationStep
                mode={mode}
                location={location}
                selectedNumber={selectedNumber}
              />
            ) : null}
            {step === "done" ? (
              <DoneStep sender={provisionedSender} />
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={step === "choose" || provision.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              
              Späť
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                
                Krok {currentIndex + 1}  z {STEPS.length}
              </span>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue || checking || provision.isPending}
              >
                {checking || provision.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {continueLabel({ step, mode, eligibility, numbers })}
                {step !== "done" && !checking && !provision.isPending ? (
                  <ArrowRight className="ml-2 h-4 w-4" />
                ) : null}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChooseStep({
  mode,
  setMode,
  existingPhone,
}: {
  mode: MessagingSetupMode;
  setMode: (mode: MessagingSetupMode) => void;
  existingPhone: string | null;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">
        
        Väčšina kliník už začína tým, že klientom povolí textové telefónne číslo
        vedieť. Môžete tiež získať nové miestne číslo iba na odosielanie textových správ.
      </p>
      <button
        type="button"
        onClick={() => setMode("host")}
        disabled={!existingPhone}
        className={cn(
          "w-full rounded-xl border p-4 text-left transition-colors",
          mode === "host"
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-200 hover:border-emerald-300",
          !existingPhone && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-medium text-slate-950">
              
              Nastavenie textových správ
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {existingPhone
                ? `Keep ${existingPhone} for calls while OpenVPM adds texting.`
                : "Add a phone number in Practice Info to use this option."}
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setMode("buy")}
        className={cn(
          "w-full rounded-xl border p-4 text-left transition-colors",
          mode === "buy"
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-200 hover:border-emerald-300"
        )}
      >
        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-medium text-slate-950">
              
              Získajte nové miestne číslo na odosielanie SMS
            </p>
            <p className="mt-1 text-sm text-slate-600">
              
              Vyberte miestne číslo pre odchádzajúce textové správy a odpovede klientov.
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

function ConfirmStep({
  mode,
  location,
  eligibility,
  checking,
  checkExisting,
  areaCode,
  setAreaCode,
  numbers,
  selectedNumber,
  setSelectedNumber,
  searchNumbers,
}: {
  mode: MessagingSetupMode;
  location: MessagingSetupLocation;
  eligibility: { eligible: boolean; detail?: string } | null;
  checking: boolean;
  checkExisting: () => void;
  areaCode: string;
  setAreaCode: (areaCode: string) => void;
  numbers: SearchNumber[];
  selectedNumber: string | null;
  setSelectedNumber: (phoneNumber: string) => void;
  searchNumbers: () => void;
}) {
  if (mode === "host") {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-6 text-slate-600">
          
          Skontrolujeme, či {location.existingPhone ?? "this number"}  môže byť
          s povoleným textom bez prenosu hlasovej služby.
        </p>
        {eligibility === null ? (
          <Button variant="outline" onClick={checkExisting} disabled={checking}>
            {checking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            
            Skontrolujte oprávnenosť
          </Button>
        ) : eligibility.eligible ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <Check className="h-4 w-4" />
              
              Vhodné na povolenie textu
            </p>
            <p className="mt-2 text-sm text-emerald-700">
              
              Pokračujte v kontrole kroku registrácie operátora.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              
              Toto číslo zatiaľ nie je vhodné.
            </p>
            <p className="mt-2 text-sm text-amber-800">
              {eligibility.detail ??
                "Choose a new local number instead, or update the location phone."}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        
        Vyhľadajte miestne číslo. Tomu bude priradené vybrané číslo
        umiestnenie a registrácia operátora sa spustí po nastavení.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-slate-600">
            
            Kód oblasti
          </span>
          <Input
            value={areaCode}
            onChange={(e) =>
              setAreaCode(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, MESSAGING_AREA_CODE_LENGTH)
              )
            }
            maxLength={MESSAGING_AREA_CODE_LENGTH}
            inputMode="numeric"
            pattern={`\\d{${MESSAGING_AREA_CODE_LENGTH}}`}
            placeholder="415"
            className="w-28 border-slate-300"
          />
        </label>
        <Button
          variant="outline"
          onClick={searchNumbers}
          disabled={checking || !isMessagingAreaCodeInputValid(areaCode)}
        >
          {checking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          
          Hľadať čísla
        </Button>
      </div>
      {numbers.length > 0 ? (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
          {numbers.map((n) => (
            <button
              type="button"
              key={n.phoneNumber}
              onClick={() => setSelectedNumber(n.phoneNumber)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors",
                selectedNumber === n.phoneNumber
                  ? "bg-emerald-50"
                  : "hover:bg-slate-50"
              )}
            >
              <span className="font-medium text-slate-950">{n.phoneNumber}</span>
              <span className="flex items-center gap-2">
                {formatMonthlyCost(n.monthlyCost) ? (
                  <span className="text-xs text-slate-500">
                    {formatMonthlyCost(n.monthlyCost)}/mes.
                  </span>
                ) : null}
                {selectedNumber === n.phoneNumber ? (
                  <Badge variant="success">Vybrané</Badge>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RegistrationStep({
  mode,
  location,
  selectedNumber,
}: {
  mode: MessagingSetupMode;
  location: MessagingSetupLocation;
  selectedNumber: string | null;
}) {
  const number =
    mode === "host" ? location.existingPhone ?? "your number" : selectedNumber;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-950">
          {setupModeTitle(mode)}
        </p>
        <p className="mt-1 text-sm text-slate-600">{number}</p>
      </div>
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-sm font-medium text-teal-950">
          
          Pred odoslaním živých textových správ v USA sa vyžaduje schválenie operátora.
        </p>
        <p className="mt-2 text-sm leading-6 text-teal-800">
          
          OpenVPM nastaví číslo a označí registráciu ako čakajúcu.
          Právne overenie firmy a schválenie kampane sú externé
          kroky operátora a ešte nie sú odoslané z tejto obrazovky.
        </p>
      </div>
    </div>
  );
}

function DoneStep({ sender }: { sender: string | null }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-900">
          <Check className="h-4 w-4" />
          
          Online platby nie sú pre túto kliniku nakonfigurované.
        </p>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          {sender ?? "Your number"}  sa uloží a čaká sa na registráciu. SMS
          odosielanie zostane vypnuté, kým nie je aktívne schválenie operátorom a kým sa neobráti správca
          posielanie ďalej.
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-950">
          
          Ďalej: schválenie dopravcu
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          
          Keď je registrácia aktívna, zapnite odosielanie v nastaveniach správ
          a odošlite test z karty aktívnej polohy.
        </p>
      </div>
    </div>
  );
}

function continueLabel({
  step,
  mode,
  eligibility,
  numbers,
}: {
  step: Step;
  mode: MessagingSetupMode;
  eligibility: { eligible: boolean; detail?: string } | null;
  numbers: SearchNumber[];
}) {
  if (step === "choose") return "Continue";
  if (step === "confirm" && mode === "host" && eligibility === null) {
    return "Check eligibility";
  }
  if (step === "confirm" && mode === "buy" && numbers.length === 0) {
    return "Search numbers";
  }
  if (step === "registration") return "Start setup";
  if (step === "done") return "Done";
  return "Continue";
}
