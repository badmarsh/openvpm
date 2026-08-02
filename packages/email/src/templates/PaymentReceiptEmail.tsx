import * as React from "react";
import { Section, Row, Column } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { Button } from "../components/Button";
import { InfoCard } from "../components/InfoCard";
import { Heading, Paragraph, Label, Stat } from "../components/Typography";
import type { Brand } from "../brand";

export interface PaymentReceiptEmailProps {
  brand: Brand;
  practiceName: string;
  amount: string; // e.g. "$79.00"
  periodLabel: string; // e.g. "Jun 10 – Jul 10, 2026"
  invoiceUrl?: string;
}

export function PaymentReceiptEmail({
  brand,
  practiceName,
  amount,
  periodLabel,
  invoiceUrl,
}: PaymentReceiptEmailProps) {
  return (
    <EmailLayout
      brand={brand}
      preview={`Vaše potvrdenie OpenVPM — ${amount}`}
    >
      <Heading>Platba bola prijatá</Heading>
      <Paragraph>
        Ďakujeme, {practiceName}. Prijali sme vašu platbu — tu sú podrobnosti pre vaše záznamy.
      </Paragraph>

      <InfoCard tone="success">
        <Row>
          <Column>
            <Label>Uhradená suma</Label>
            <Stat>{amount}</Stat>
          </Column>
          <Column style={{ textAlign: "right", verticalAlign: "top" }}>
            <Label>Fakturačné obdobie</Label>
            <Paragraph>{periodLabel}</Paragraph>
          </Column>
        </Row>
      </InfoCard>

      {invoiceUrl ? (
        <Section style={{ margin: "8px 0" }}>
          <Button href={invoiceUrl}>Zobraziť faktúru</Button>
        </Section>
      ) : null}

      <Paragraph muted>
        Všetky faktúry a spôsob platby môžete kedykoľvek skontrolovať v nastaveniach fakturácie. Otázky? Stačí odpovedať na tento e-mail.
      </Paragraph>
    </EmailLayout>
  );
}
