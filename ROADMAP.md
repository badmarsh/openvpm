# OpenVPM Roadmap

OpenVPM is building the modern, open, API-first foundation for veterinary software — the system AI agents and integrators can actually build on, and that clinics fully own.

This roadmap is a living document. The fastest way to influence it: [open an issue](https://github.com/evangauer/openvpm/issues), [start a discussion](https://github.com/evangauer/openvpm/discussions), or 👍 the ones that matter to you. ⭐ the repo to follow along.

## ✅ Shipped

- Core PIMS: patients, clients, scheduling, medical records (SOAP, labs, vaccinations, prescriptions), billing & invoicing, inventory, controlled substances, reporting, client portal, real-time whiteboard
- **Public REST API** (`/api/v1`) with scoped, per-practice API keys
- **AI text drafting** — authenticated server-configured text drafts and structured dashboard queries. No practice-aware chat/tool agent or `/api/v1/agent` route. Image/audio processing is unavailable pending validation.
- **Scheduling engine** — strict conflict detection (doctor *and* room), reschedule, open-slot availability
- **Clinical depth** — weight-based drug dosing calculator, vital signs, treatment plans linked to the problem list
- **Wellness plans / recurring billing**
- **Self-service online booking** via the client portal
- **CSV import** for migrating clients & patients (pairs with full JSON export)

## 🔜 Next (readiness work; provider validation may need external access)

- Practice-aware agent: explicit read-only retrieval, source attribution, ambiguity handling, authorization and durable action trace; not currently shipped
- Complete the local verification queue in [docs/pilot](docs/pilot/README.md) before a live-data pilot

- Staff calendar UX: drag-to-reschedule on the live calendar (the API already supports it)
- Appointment waitlist
- Reminder scheduling (queue + due-list; delivery pluggable)
- Deeper agent tools and an audit trail for agent actions
- Embeddable online-booking widget for clinic websites

## 🌅 Later (needs integrations or larger design)

- Stripe payments exist behind configuration; validate invoice checkout, Connect settlement and wellness charge capture separately before rollout
- SMS/email delivery adapters exist (Telnyx/Twilio/Resend); provisioning, consent, callbacks and delivery need target-environment validation
- Lab integrations (IDEXX, Antech, Zoetis) — order + auto-result matching
- **PIMS-compatibility connectors** — mirror an incumbent's public API so existing integrations work against OpenVPM, and so a clinic can keep a live, owned copy of their data
- Imaging / DICOM, multi-location, FHIR-inspired veterinary data standard, mobile companion app

## How we prioritize

1. Does it help a real clinic do real work faster? (reduce staff hours)
2. Does it strengthen the open API / agent platform others build on?
3. Can the community own a piece of it? (we label [`good first issue`](https://github.com/evangauer/openvpm/labels/good%20first%20issue))

If something you need isn't here, tell us — that's how it gets prioritized.
