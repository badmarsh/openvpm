import * as React from "react";
import { Section } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { Button } from "../components/Button";
import { InfoCard } from "../components/InfoCard";
import { Heading, Paragraph, Label, Stat } from "../components/Typography";
import type { Brand } from "../brand";

export interface TrialEndingEmailProps {
  brand: Brand;
  practiceName: string;
  daysLeft: number;
  trialEndDate: string; // e.g. "July 10, 2026"
  monthlyPrice: string; // e.g. "$79"
  billingUrl: string;
  unsubscribeUrl?: string;
}

export function TrialEndingEmail({
  brand,
  practiceName,
  daysLeft,
  trialEndDate,
  monthlyPrice,
  billingUrl,
  unsubscribeUrl,
}: TrialEndingEmailProps) {
  const whenLabel =
    daysLeft <= 1 ? "zajtra" : `o ${daysLeft} dní`;
  return (
    <EmailLayout
      brand={brand}
      preview={`Vaša skúšobná verzia OpenVPM končí ${whenLabel}. Pridajte kartu a nič sa nezmení.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading>Vaša skúšobná verzia končí {whenLabel}</Heading>
      <Paragraph>
        Dobrý deň {practiceName}, vaša skúšobná verzia OpenVPM končí{" "}
        <strong>{trialEndDate}</strong>. Pridajte kartu teraz a nič sa nezmení.
        Váš harmonogram, záznamy a všetko, čo ste nastavili, zostanú presne tak, ako sú.
      </Paragraph>

      <InfoCard tone="warning">
        <Label>Jednoduchá, pevná cena</Label>
        <Stat>{monthlyPrice}/pracovisko mesačne</Stat>
        <Paragraph muted>
          Neobmedzený personál, vrátane AI a SMS správ. Zrušte kedykoľvek.
        </Paragraph>
      </InfoCard>

      <Section style={{ margin: "8px 0" }}>
        <Button href={billingUrl}>Pridať fakturáciu</Button>
      </Section>

      <Paragraph muted>
        Ak vaša skúšobná verzia vyprší, váš pracovný priestor sa jednoducho stane iba na čítanie. Nič sa nevymaže a môžete ho kedykoľvek znova zapnúť pridaním karty.
      </Paragraph>
    </EmailLayout>
  );
}
