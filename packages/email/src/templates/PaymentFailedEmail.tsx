import * as React from "react";
import { Section } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { Button } from "../components/Button";
import { InfoCard } from "../components/InfoCard";
import { Heading, Paragraph, Label, Stat } from "../components/Typography";
import type { Brand } from "../brand";

export interface PaymentFailedEmailProps {
  brand: Brand;
  practiceName: string;
  amount: string; // e.g. "$79.00"
  nextRetryDate?: string; // e.g. "July 3, 2026"
  billingUrl: string;
}

export function PaymentFailedEmail({
  brand,
  practiceName,
  amount,
  nextRetryDate,
  billingUrl,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout
      brand={brand}
      preview="Vaša platba OpenVPM neprebehla — aktualizujte svoje fakturačné údaje"
    >
      <Heading>Vaša platba neprebehla</Heading>
      <Paragraph>
        Dobrý deň {practiceName}, nepodarilo sa nám spracovať vašu poslednú platbu OpenVPM vo výške <strong>{amount}</strong>. Obvykle to znamená, že platobná karta expirovala alebo bola vymenená — ide o rýchlu opravu.
      </Paragraph>

      <InfoCard tone="danger">
        <Label>Čo bude nasledovať</Label>
        <Paragraph>
          {nextRetryDate
            ? `Automaticky sa pokúsime znova ${nextRetryDate}. Aktualizujte kartu dovtedy, aby ste predišli prerušeniu.`
            : "Aktualizujte svoju kartu, aby váš pracovný priestor zostal aktívny a predišli ste prerušeniu."}
        </Paragraph>
      </InfoCard>

      <Section style={{ margin: "8px 0" }}>
        <Button href={billingUrl}>Aktualizovať fakturáciu</Button>
      </Section>

      <Paragraph muted>
        Vaše údaje sú v bezpečí. Ak sa platba nakoniec nespracuje, váš pracovný priestor sa prepne do režimu len na čítanie — nič sa nevymaže a opätovná aktivácia je na jedno kliknutie. Potrebujete pomoc? Stačí odpovedať na tento e-mail.
      </Paragraph>
    </EmailLayout>
  );
}
