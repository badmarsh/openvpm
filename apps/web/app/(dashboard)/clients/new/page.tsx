"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/common/empty-state";
import { toast } from "sonner";
import {
  CLIENT_ADDRESS_MAX_LENGTH,
  CLIENT_CITY_MAX_LENGTH,
  CLIENT_EMAIL_MAX_LENGTH,
  CLIENT_NAME_MAX_LENGTH,
  CLIENT_PHONE_MAX_LENGTH,
  CLIENT_STATE_MAX_LENGTH,
  CLIENT_ZIP_MAX_LENGTH,
  isOptionalClientTextValid,
  isRequiredClientTextValid,
} from "@/lib/clients/policy";

function canManageClientFormRole(role?: string | null): boolean {
  return (
    role === "admin" ||
    role === "veterinarian" ||
    role === "technician" ||
    role === "front_desk"
  );
}

export default function NewClientPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        
        Prebieha kontrola prístupu klienta...
      </div>
    );
  }

  if (!canManageClientFormRole(session?.user?.role)) {
    return (
      <div className="max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/clients")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          
          Späť na klientov
        </Button>
        <EmptyState
          icon={AlertCircle}
          title="Akcie klienta sú len na čítanie"
          description="Dátum nástupu"
          action={{
            label: "Späť na klientov",
            onClick: () => router.push("/clients"),
          }}
        />
      </div>
    );
  }

  return <NewClientForm />;
}

function NewClientForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Klient vytvoril");
      router.push("/clients");
    },
    onError: (err) => {
      toast.error(err.message);
      setError(err.message);
    },
  });

  const canSubmit =
    isRequiredClientTextValid(form.firstName, CLIENT_NAME_MAX_LENGTH) &&
    isRequiredClientTextValid(form.lastName, CLIENT_NAME_MAX_LENGTH) &&
    isOptionalClientTextValid(form.email, CLIENT_EMAIL_MAX_LENGTH) &&
    isOptionalClientTextValid(form.phone, CLIENT_PHONE_MAX_LENGTH) &&
    isOptionalClientTextValid(form.address, CLIENT_ADDRESS_MAX_LENGTH) &&
    isOptionalClientTextValid(form.city, CLIENT_CITY_MAX_LENGTH) &&
    isOptionalClientTextValid(form.state, CLIENT_STATE_MAX_LENGTH) &&
    isOptionalClientTextValid(form.zip, CLIENT_ZIP_MAX_LENGTH);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Check required fields and field lengths.");
      return;
    }

    createClient.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      zip: form.zip.trim() || undefined,
      smsConsent,
    });
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/clients")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        
        Späť na klientov
      </Button>

      <h2 className="font-heading text-xl font-semibold">Nový klient</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        
        Pridajte do svojej praxe nového klienta
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="firstName">
              
              Krstné meno *
            </label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Krstné meno"
              className="mt-1"
              maxLength={CLIENT_NAME_MAX_LENGTH}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="lastName">
              
              Priezvisko *
            </label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Priezvisko"
              className="mt-1"
              maxLength={CLIENT_NAME_MAX_LENGTH}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="email@example.com"
              className="mt-1"
              maxLength={CLIENT_EMAIL_MAX_LENGTH}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="phone">
              
              Telefón
            </label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="mt-1"
              maxLength={CLIENT_PHONE_MAX_LENGTH}
            />
          </div>
        </div>

        <label className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
          <Checkbox
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">
              
              Klient súhlasí s prijímaním textových správ
            </span>
            <span className="block text-xs text-muted-foreground">
              
              Pripomenutie termínu a starostlivosti prostredníctvom SMS. Ak sa chcete odhlásiť, môžu odpovedať STOP
              kedykoľvek.
            </span>
          </span>
        </label>

        <div>
          <label className="text-sm font-medium" htmlFor="address">
            
            Adresa
          </label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Adresa"
            className="mt-1"
            maxLength={CLIENT_ADDRESS_MAX_LENGTH}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium" htmlFor="city">
              
              Mesto
            </label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Mesto"
              className="mt-1"
              maxLength={CLIENT_CITY_MAX_LENGTH}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="state">
              
              Štát
            </label>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
              placeholder="Štát"
              className="mt-1"
              maxLength={CLIENT_STATE_MAX_LENGTH}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="zip">
              
              Zips
            </label>
            <Input
              id="zip"
              value={form.zip}
              onChange={(e) => updateField("zip", e.target.value)}
              placeholder="PSČ"
              className="mt-1"
              maxLength={CLIENT_ZIP_MAX_LENGTH}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={!canSubmit || createClient.isPending}>
            {createClient.isPending ? "Creating..." : "Create Client"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/clients")}
          >
            
            Zrušiť
          </Button>
        </div>
      </form>
    </div>
  );
}
