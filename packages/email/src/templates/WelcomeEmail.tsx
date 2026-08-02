import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailLayout } from "../components/EmailLayout";
import { Button } from "../components/Button";
import { InfoCard } from "../components/InfoCard";
import { Heading, Paragraph, Label } from "../components/Typography";
import { theme } from "../theme";
import type { Brand } from "../brand";

export interface WelcomeEmailProps {
  brand: Brand;
  practiceName: string;
  trialDays: number;
}

const STEPS = [
  "Absolvujte 60-sekundovú prehliadku harmonogramu, záznamov a fakturácie.",
  "Prispôsobte si ho: pridajte logo, farbu akcentu a pozvite svoj tím.",
  "Opýtajte sa asistenta AI na cokoľvek, napr. „ktoré zvieratá majú skontrolovať vakcíny?“",
];

export function WelcomeEmail({
  brand,
  practiceName,
  trialDays,
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      brand={brand}
      preview={`Vitajte v OpenVPM — vaša ${trialDays}-dňová skúšobná verzia je pripravená`}
    >
      <Heading>Vitajte v OpenVPM 🎉</Heading>
      <Paragraph>
        Dobrý deň {practiceName}, váš pracovný priestor je pripravený. Nastavili sme ho so vzorovou praxou — reálnymi klientmi, zvieratami a termínmi — aby aplikácia žila od prvej minúty.
      </Paragraph>
      <Paragraph muted>
        Vaša {trialDays}-dňová skúšobná verzia má všetky funkcie bez nutnosti kreditnej karty a vaše údaje sú vždy vaše na export.
      </Paragraph>

      <Section style={{ margin: "28px 0 8px" }}>
        <Button href={brand.appUrl}>Otvoriť nástenku</Button>
      </Section>

      <InfoCard tone="brand">
        <Label>Začnite</Label>
        {STEPS.map((s, i) => (
          <Text
            key={i}
            style={{
              fontFamily: theme.fontBody,
              fontSize: "14px",
              lineHeight: "1.6",
              color: theme.text,
              margin: i === 0 ? "6px 0 0" : "10px 0 0",
            }}
          >
            <span style={{ color: theme.brand, fontWeight: 700 }}>→</span> {s}
          </Text>
        ))}
      </InfoCard>

      <Paragraph muted>
        Máte otázky? Stačí odpovedať na tento e-mail — odpovie vám skutočný človek.
      </Paragraph>
    </EmailLayout>
  );
}
