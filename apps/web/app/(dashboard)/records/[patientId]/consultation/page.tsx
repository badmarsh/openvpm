import Link from "next/link";

export default function ClinicalConsultationWorkspace({ params }: { params: { patientId: string } }) {
  return (
    <section className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">AI konzultácia — nedostupná</h1>
      <p role="status">Nahrávanie a AI spracovanie audia sú vypnuté. Táto stránka nepoužíva mikrofón, neposiela audio poskytovateľovi a nevytvára klinický záznam.</p>
      <p>Použite SOAP editor a skontrolujte každý návrh pred uložením. Audio workflow potrebuje samostatné overenie súhlasu, bezpečných limitov, tenant izolácie a presnosti prepisu.</p>
      <Link className="underline" href={`/records/${encodeURIComponent(params.patientId)}`}>Späť na záznam pacienta</Link>
    </section>
  );
}
