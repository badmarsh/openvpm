import type { Metadata } from "next";
import { WEBHOOK_EVENT_DEFINITIONS } from "@/lib/webhook-events";

export const metadata: Metadata = {
  title: "OpenVPM API Reference",
  description: "Dokumentácia API pre riadenie veterinárnej praxe OpenVPM",
};

// ── Endpoint definitions ─────────────────────────────────────

interface Endpoint {
  name: string;
  method: "GET" | "POST";
  description: string;
  input?: string;
  response?: string;
  auth?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  endpoints: Endpoint[];
}

const sections: Section[] = [
  {
    id: "auth",
    title: "Autentifikácia",
    description:
      "Zaregistrujte postupy a získajte aktuálnu reláciu používateľa. Postupy riadiacej dosky používajú súbory cookie relácie; portál a koncové body REST používajú svoje vlastné toky tokenov/kľúčov.",
    endpoints: [
      {
        name: "auth.register",
        method: "POST",
        description: "Zaregistrujte si novú prax pomocou používateľského účtu správcu.",
        input: `{
  practiceName: string,
  name: string,
  email: string,
  password: string   // min 8 characters
}`,
        response: `{ success: true }`,
        auth: "None (public)",
      },
      {
        name: "auth.me",
        method: "GET",
        description: "Získajte aktuálne overeného používateľa a podrobnosti o praxi.",
        response: `{
  id: string,
  email: string,
  name: string,
  role: "admin" | "veterinarian" | "technician" | "front_desk",
  practiceId: string,
  practiceName: string
}`,
        auth: "Session cookie",
      },
    ],
  },
  {
    id: "clients",
    title: "Klienti",
    description: "Manual lab entry only",
    endpoints: [
      {
        name: "clients.list",
        method: "GET",
        description: "Zoznam klientov s voliteľným vyhľadávaním a stránkovaním.",
        input: `{
  search?: string,
  limit?: number,    // 1-100, default 25
  offset?: number    // default 0
}`,
        response: `{
  items: Client[],
  total: number
}`,
      },
      {
        name: "clients.search",
        method: "GET",
        description: "Rýchle vyhľadávanie klientov podľa mena, e-mailu alebo telefónu. Vráti až 10 výsledkov.",
        input: `{ query: string }`,
        response: `Client[]`,
      },
      {
        name: "clients.getById",
        method: "GET",
        description: "Získajte jedného klienta so svojimi pacientmi.",
        input: `{ id: string }`,
        response: `{
  ...Client,
  patients: Patient[]
}`,
      },
      {
        name: "clients.create",
        method: "POST",
        description:
          "Vytvorte nový záznam klienta a vydajte prístupový token súkromného portálu.",
        input: `{
  firstName: string,
  lastName: string,
  email?: string,
  phone?: string,
  address?: string,
  city?: string,
  state?: string,
  zip?: string
}`,
        response: `Client`,
      },
      {
        name: "clients.rotatePortalAccessToken",
        method: "POST",
        description:
          "Vytvorte alebo otočte prepojenie na súkromný portál klienta. Existujúce adresy URL portálu prestanú fungovať ihneď po otočení.",
        input: `{ id: string }`,
        response: `{
  id: string,
  accessToken: string
}`,
      },
      {
        name: "clients.update",
        method: "POST",
        description: "Aktualizujte existujúceho klienta.",
        input: `{
  id: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  address?: string,
  city?: string,
  state?: string,
  zip?: string
}`,
        response: `Client`,
      },
      {
        name: "clients.delete",
        method: "POST",
        description: "Soft-vymazať záznam klienta.",
        input: `{ id: string }`,
        response: `{ success: true }`,
      },
    ],
  },
  {
    id: "patients",
    title: "Pacienti",
    description: "Manage billing",
    endpoints: [
      {
        name: "patients.list",
        method: "GET",
        description: "Uveďte pacientov s voliteľnými filtrami.",
        input: `{
  search?: string,
  species?: string,
  status?: string,
  limit?: number,    // 1-100, default 25
  offset?: number    // default 0
}`,
        response: `{
  items: Patient[],
  total: number
}`,
      },
      {
        name: "patients.search",
        method: "GET",
        description: "Rýchle vyhľadávanie pacientov podľa mena. Vráti až 10 výsledkov.",
        input: `{ query: string }`,
        response: `Patient[]`,
      },
      {
        name: "patients.getById",
        method: "GET",
        description: "Získajte úplné podrobnosti o pacientovi vrátane hmotnosti, alergií a informácií o majiteľovi.",
        input: `{ id: string }`,
        response: `{
  ...Patient,
  weights: Weight[],
  allergies: Allergy[],
  ownerName: string
}`,
      },
      {
        name: "patients.create",
        method: "POST",
        description: "Vytvorte nový záznam pacienta.",
        input: `{
  clientId: string,
  name: string,
  species: string,
  breed?: string,
  color?: string,
  sex: "male" | "female" | "male_neutered" | "female_spayed" | "unknown",
  dateOfBirth?: string,
  microchipId?: string
}`,
        response: `Patient`,
      },
      {
        name: "patients.update",
        method: "POST",
        description: "Aktualizujte existujúci záznam pacienta.",
        input: `{
  id: string,
  name?: string,
  species?: string,
  breed?: string,
  color?: string,
  sex?: string,
  dateOfBirth?: string,
  microchipId?: string,
  status?: string
}`,
        response: `Patient`,
      },
      {
        name: "patients.delete",
        method: "POST",
        description: "Jemné vymazanie záznamu pacienta.",
        input: `{ id: string }`,
        response: `{ success: true }`,
      },
      {
        name: "patients.addWeight",
        method: "POST",
        description: "Zaznamenajte meranie hmotnosti.",
        input: `{
  patientId: string,
  weight: number,
  unit: string
}`,
        response: `Weight`,
      },
      {
        name: "patients.addAllergy",
        method: "POST",
        description: "Zaznamenajte známu alergiu.",
        input: `{
  patientId: string,
  allergen: string,
  severity?: string,
  notes?: string
}`,
        response: `Allergy`,
      },
    ],
  },
  {
    id: "appointments",
    title: "Stretnutia",
    description: "Plánujte a spravujte stretnutia.",
    endpoints: [
      {
        name: "appointments.list",
        method: "GET",
        description: "Zoznam schôdzok v rámci rozsahu dátumov.",
        input: `{
  startDate: string,  // ISO date
  endDate: string,    // ISO date
  doctorId?: string
}`,
        response: `Appointment[]`,
      },
      {
        name: "appointments.getById",
        method: "GET",
        description: "Získajte úplné podrobnosti o stretnutí.",
        input: `{ id: string }`,
        response: `Appointment`,
      },
      {
        name: "appointments.create",
        method: "POST",
        description: "Naplánujte si nový termín.",
        input: `{
  patientId: string,
  clientId: string,
  typeId: string,
  doctorId: string,
  roomId?: string,
  startTime: string,    // ISO datetime
  endTime: string,      // ISO datetime
  notes?: string,
  reason?: string
}`,
        response: `Appointment`,
      },
      {
        name: "appointments.updateStatus",
        method: "POST",
        description:
          "Aktualizácia stavu stretnutia (napr. potvrdenie, nahlásenie, skúška, odhlásenie, zrušenie).",
        input: `{
  id: string,
  status: "scheduled" | "confirmed" | "checked_in" | "in_exam" | "checked_out" | "no_show" | "cancelled"
}`,
        response: `Appointment`,
      },
      {
        name: "appointments.listTypes",
        method: "GET",
        description: "Uveďte dostupné typy stretnutí pre prax.",
        response: `AppointmentType[]`,
      },
      {
        name: "appointments.listDoctors",
        method: "GET",
        description: "Uveďte zoznam veterinárnych lekárov, ktorí sú k dispozícii na plánovanie.",
        response: `Doctor[]`,
      },
      {
        name: "appointments.listRooms",
        method: "GET",
        description: "Uveďte skúšobné miestnosti.",
        response: `Room[]`,
      },
    ],
  },
  {
    id: "records",
    title: "Medical Records",
    description:
      "SOAP poznámky, očkovania, laboratórne výsledky, postupy, problémy a predpisy.",
    endpoints: [
      {
        name: "records.listSoapNotes",
        method: "GET",
        description: "Zoznam poznámok SOAP pre pacienta.",
        input: `{ patientId: string }`,
        response: `SoapNote[]`,
      },
      {
        name: "records.createSoapNote",
        method: "POST",
        description: "Vytvorte poznámku SOAP.",
        input: `{
  patientId: string,
  subjective: string,
  objective: string,
  assessment: string,
  plan: string
}`,
        response: `SoapNote`,
      },
      {
        name: "records.listVaccinations",
        method: "GET",
        description: "Uveďte záznamy o očkovaní pacienta.",
        input: `{ patientId: string }`,
        response: `Vaccination[]`,
      },
      {
        name: "records.createVaccination",
        method: "POST",
        description: "Zaznamenajte očkovanie.",
        input: `{
  patientId: string,
  vaccineName: string,
  manufacturer?: string,
  lotNumber?: string,
  expirationDate?: string,
  nextDueDate?: string,
  notes?: string
}`,
        response: `Vaccination`,
      },
      {
        name: "records.listLabResults",
        method: "GET",
        description: "Uveďte laboratórne výsledky pre pacienta.",
        input: `{ patientId: string }`,
        response: `LabResult[]`,
      },
      {
        name: "records.createLabResult",
        method: "POST",
        description: "Vytvorte záznam laboratórneho výsledku.",
        input: `{
  patientId: string,
  testName: string,
  category?: string,
  results?: object,
  notes?: string
}`,
        response: `LabResult`,
      },
      {
        name: "records.updateLabResultStatus",
        method: "POST",
        description: "Aktualizujte stav laboratórneho výsledku.",
        input: `{
  id: string,
  status: "pending" | "completed" | "reviewed"
}`,
        response: `LabResult`,
      },
      {
        name: "records.listProcedures",
        method: "GET",
        description: "Uveďte postupy vykonávané na pacientovi.",
        input: `{ patientId: string }`,
        response: `Procedure[]`,
      },
      {
        name: "records.createProcedure",
        method: "POST",
        description: "Zaznamenajte postup.",
        input: `{
  patientId: string,
  name: string,
  description?: string,
  notes?: string
}`,
        response: `Procedure`,
      },
      {
        name: "records.listProblems",
        method: "GET",
        description: "Uveďte aktívne a vyriešené problémy pacienta.",
        input: `{ patientId: string }`,
        response: `Problem[]`,
      },
      {
        name: "records.createProblem",
        method: "POST",
        description: "Pridajte problém do zoznamu problémov pacienta.",
        input: `{
  patientId: string,
  description: string,
  severity?: string,
  notes?: string
}`,
        response: `Problem`,
      },
      {
        name: "records.updateProblemStatus",
        method: "POST",
        description: "Mark as Paid",
        input: `{
  id: string,
  status: "active" | "resolved"
}`,
        response: `Problem`,
      },
      {
        name: "records.listPrescriptions",
        method: "GET",
        description: "Zoznam receptov pre pacienta.",
        input: `{ patientId: string }`,
        response: `Prescription[]`,
      },
      {
        name: "records.createPrescription",
        method: "POST",
        description: "Vytvorte recept.",
        input: `{
  patientId: string,
  medicationName: string,
  dosage: string,
  frequency: string,
  startDate: string,
  endDate?: string,
  quantity?: number,
  productId?: string,
  refillsRemaining?: number,
  instructions?: string,
  acknowledgeSafetyWarnings?: boolean
}`,
        response: `Prescription`,
      },
    ],
  },
  {
    id: "billing",
    title: "Fakturácia",
    description: "Faktúry, platby, služby a odhady.",
    endpoints: [
      {
        name: "billing.listInvoices",
        method: "GET",
        description: "Zoznam faktúr s voliteľnými filtrami.",
        input: `{
  status?: string,
  isEstimate?: boolean,
  limit?: number,
  offset?: number
}`,
        response: `{
  items: Invoice[],
  total: number
}`,
      },
      {
        name: "billing.getInvoice",
        method: "GET",
        description: "Získajte úplnú faktúru s riadkovými položkami a platbami.",
        input: `{ id: string }`,
        response: `{
  ...Invoice,
  items: InvoiceItem[],
  payments: Payment[]
}`,
      },
      {
        name: "billing.createInvoice",
        method: "POST",
        description: "Vytvorte faktúru alebo odhad.",
        input: `{
  clientId: string,
  patientId?: string,
  isEstimate?: boolean,
  items: {
    serviceId?: string,
    productId?: string,
    description: string,
    quantity: number,
    unitPrice: number
  }[],
  notes?: string
}`,
        response: `Invoice`,
      },
      {
        name: "billing.updateInvoiceStatus",
        method: "POST",
        description: "Aktualizujte stav faktúry.",
        input: `{
  id: string,
  status: "draft" | "sent" | "paid" | "overdue" | "void"
}`,
        response: `Invoice`,
      },
      {
        name: "billing.convertEstimateToInvoice",
        method: "POST",
        description: "Preveďte schválený odhad na fakturovateľnú faktúru.",
        input: `{ id: string }`,
        response: `Invoice`,
      },
      {
        name: "billing.recordPayment",
        method: "POST",
        description: "Zaznamenajte platbu na faktúru.",
        input: `{
  invoiceId: string,
  amount: number,
  method: "cash" | "credit_card" | "debit_card" | "check" | "online" | "other",
  notes?: string
}`,
        response: `Payment`,
      },
      {
        name: "billing.createCardPaymentCheckout",
        method: "POST",
        description: "Vytvorte prepojenie Stripe Checkout pre zostávajúci upravený zostatok faktúry.",
        input: `{ invoiceId: string }`,
        response: `{ url: string }`,
      },
      {
        name: "billing.listPayments",
        method: "GET",
        description: "Uveďte platby na faktúru.",
        input: `{ invoiceId: string }`,
        response: `Payment[]`,
      },
      {
        name: "billing.listAdjustments",
        method: "GET",
        description: "K faktúre uveďte dobropisy a odpisy.",
        input: `{ invoiceId: string }`,
        response: `InvoiceAdjustment[]`,
      },
      {
        name: "billing.applyInvoiceAdjustment",
        method: "POST",
        description: "Použiť dobropis alebo odpis na zostatok faktúry.",
        input: `{
  invoiceId: string,
  type: "credit" | "write_off",
  amount: number,
  reason?: string
}`,
        response: `InvoiceAdjustment`,
      },
      {
        name: "billing.voidInvoice",
        method: "POST",
        description: "Zrušenie faktúry bez histórie platieb alebo úprav.",
        input: `{ id: string }`,
        response: `Invoice`,
      },
      {
        name: "billing.listServices",
        method: "GET",
        description: "Uveďte všetky služby, ktoré ordinácia ponúka.",
        response: `Service[]`,
      },
      {
        name: "billing.listProducts",
        method: "GET",
        description: "Zoznam produktov dostupných na fakturáciu.",
        response: `Product[]`,
      },
    ],
  },
  {
    id: "portal",
    title: "Klientsky portál",
    description:
      "Verejný prístup založený na tokenoch pre majiteľov domácich zvierat. Nevyžaduje sa žiadna relácia – používa jedinečný prístupový token na klienta.",
    endpoints: [
      {
        name: "portal.getClient",
        method: "GET",
        description: "Získajte profil klienta a domáce zvieratá prostredníctvom tokenu portálu.",
        input: `{ token: string }`,
        response: `{
  client: Client,
  pets: Patient[]
}`,
        auth: "Portal token",
      },
      {
        name: "portal.getPetDetail",
        method: "GET",
        description: "Získajte úplné podrobnosti o zvierati vrátane anamnézy.",
        input: `{
  token: string,
  patientId: string
}`,
        response: `{
  ...Patient,
  vaccinations: Vaccination[],
  prescriptions: Prescription[],
  weights: Weight[],
  allergies: Allergy[]
}`,
        auth: "Portal token",
      },
      {
        name: "portal.getAppointments",
        method: "GET",
        description: "Uveďte nadchádzajúce stretnutia pre klienta.",
        input: `{ token: string }`,
        response: `Appointment[]`,
        auth: "Portal token",
      },
      {
        name: "portal.getInvoices",
        method: "GET",
        description: "Vypisujte faktúry pre klienta.",
        input: `{ token: string }`,
        response: `Invoice[]`,
        auth: "Portal token",
      },
      {
        name: "portal.getMessages",
        method: "GET",
        description: "Vypísať správy portálu pre klienta.",
        input: `{ token: string }`,
        response: `{
  timezone: string | null,
  items: Array<{
    id: string,
    direction: "inbound" | "outbound",
    subject: string | null,
    content: string | null,
    status: string,
    readAt: Date | null,
    createdAt: Date | null
  }>
}`,
        auth: "Portal token",
      },
      {
        name: "portal.createMessage",
        method: "POST",
        description: "Odošlite správu portálu od klienta do zdieľanej doručenej pošty.",
        input: `{
  token: string,
  content: string
}`,
        response: `{ success: true, message: Communication }`,
        auth: "Portal token",
      },
      {
        name: "portal.markMessagesRead",
        method: "POST",
        description: ". Zdravotné záznamy",
        input: `{ token: string }`,
        response: `{ success: true, updated: number }`,
        auth: "Portal token",
      },
      {
        name: "portal.getAppointmentTypes",
        method: "GET",
        description: "Uveďte typy stretnutí, ktoré sú k dispozícii na rezerváciu na portáli.",
        input: `{ token: string }`,
        response: `Array<{ id: string, name: string, durationMinutes: number }>`,
        auth: "Portal token",
      },
      {
        name: "portal.availableSlots",
        method: "GET",
        description: "Uveďte navrhované otváracie časy pre dátum rezervácie portálu.",
        input: `{
  token: string,
  date: string, // YYYY-MM-DD
  durationMinutes?: number // 5-480 minutes, defaults to 30
}`,
        response: `Array<{ time: string, iso: string }>`,
        auth: "Portal token",
      },
      {
        name: "portal.requestAppointment",
        method: "POST",
        description: "Odošlite žiadosť o stretnutie z portálu pomocou presného požadovaného času.",
        input: `{
  token: string,
  patientId: string,
  typeId?: string,
  reason: string,
  preferredDate: string, // YYYY-MM-DD
  preferredTime: string // 24-hour HH:MM
}`,
        response: `{ success: true, appointmentId: string, message: string }`,
        auth: "Portal token",
      },
    ],
  },
  {
    id: "apiKeys",
    title: "Kľúče API",
    description:
      "Správa kľúčov API iba pre správcu pre integrácie server-to-server. Nespracované kľúče sa vrátia raz pri vytváraní.",
    endpoints: [
      {
        name: "apiKeys.list",
        method: "GET",
        description: "Uveďte aktívne kľúče API pre cvičenie.",
        response: `Array<{
  id: string,
  name: string,
  keyPrefix: string,
  scopes: ApiScope[],
  lastUsedAt: string | null,
  createdAt: string
}>`,
        auth: "Admin only",
      },
      {
        name: "apiKeys.create",
        method: "POST",
        description:
          "Vytvorte kľúč API pre integrácie REST. Surový kľúč sa vráti raz a nikdy sa neuloží ako čistý text. Rozsah agent:write musí byť spárovaný s agentom:run alebo *.",
        input: `{
  name: string,
  scopes: Array<"clients:read" | "patients:read" | "appointments:read" | "appointments:write" | "records:write" | "agent:run" | "agent:write" | "*">
}`,
        response: `{ ...ApiKey, key: string }`,
        auth: "Admin only",
      },
      {
        name: "apiKeys.revoke",
        method: "POST",
        description: "Odvolať kľúč API.",
        input: `{ id: string }`,
        response: `{ success: true }`,
        auth: "Admin only",
      },
    ],
  },
  {
    id: "restApi",
    title: "REST API",
    description:
      "Koncové body /api/v1 overené kľúčom API pre externé integrácie. Odoslať autorizáciu: Nositeľ <api-key>.",
    endpoints: [
      {
        name: "GET /api/v1/clients",
        method: "GET",
        description: "Uveďte klientov pre overenú prax.",
        input: `?limit=25&offset=0`,
        response: `{ data: Client[], pagination: Pagination }`,
        auth: "API key: clients:read",
      },
      {
        name: "GET /api/v1/clients/:id",
        method: "GET",
        description: "Získajte jedného klienta.",
        response: `{ data: Client }`,
        auth: "API key: clients:read",
      },
      {
        name: "GET /api/v1/patients",
        method: "GET",
        description: "Zoznam pacientov, voliteľne filtrovaný podľa klienta.",
        input: `?client_id=uuid&limit=25&offset=0`,
        response: `{ data: Patient[], pagination: Pagination }`,
        auth: "API key: patients:read",
      },
      {
        name: "GET /api/v1/patients/:id",
        method: "GET",
        description: "Priveďte jedného pacienta.",
        response: `{ data: Patient }`,
        auth: "API key: patients:read",
      },
      {
        name: "GET /api/v1/appointments",
        method: "GET",
        description:
          "Zoznam schôdzok, voliteľne filtrovaných podľa klienta, pacienta, stavu alebo počiatočného okna. Filtre iba na základe dátumu používajú ohraničenie dňa UTC.",
        input: `?client_id=uuid&patient_id=uuid&status=scheduled&from=YYYY-MM-DD-or-ISO-timestamp&to=YYYY-MM-DD-or-ISO-timestamp&limit=25&offset=0`,
        response: `{ data: Appointment[], pagination: Pagination }`,
        auth: "API key: appointments:read",
      },
      {
        name: "GET /api/v1/appointments/:id",
        method: "GET",
        description: "Získajte jednu schôdzku.",
        response: `{ data: Appointment }`,
        auth: "API key: appointments:read",
      },
      {
        name: "POST /api/v1/appointments",
        method: "POST",
        description:
          "Vytvorte schôdzku a vygenerujte webhook vymenovanie.vytvorený s poľami schôdzky camelCase.",
        input: `{
  client_id?: string,
  patient_id?: string,
  doctor_id?: string,
  type_id?: string,
  room_id?: string,
  start_time: string, // timezone-qualified ISO timestamp
  end_time: string,   // timezone-qualified ISO timestamp
  notes?: string
}`,
        response: `{ data: Appointment }`,
        auth: "API key: appointments:write",
      },
      {
        name: "POST /api/v1/soap-notes",
        method: "POST",
        description:
          "Vytvorte poznámku SOAP pre externého zapisovateľa AI a vygenerujte webhook soap_note.created.",
        input: `{
  patient_id: string,
  appointment_id?: string,
  author_id?: string,
  subjective?: string,
  objective?: string,
  assessment?: string,
  plan?: string,
  source: string
}`,
        response: `{ data: SoapNote }`,
        auth: "API key: records:write",
      },
      {
        name: "POST /api/v1/agent",
        method: "POST",
        description:
          "Spustite OpenVPM Agenta z externej automatizácie. Text pokynov je orezaný a nesmie byť prázdny. Spustenia s povoleným zápisom vyžadujú agent:write plus rozsah prostriedkov každého nástroja na zápis.",
        input: `{
  instruction: string,
  allow_writes?: boolean
}`,
        response: `{ data: AgentRunResult }`,
        auth: "API key: agent:run; agent:write plus resource write scopes when allow_writes=true",
      },
    ],
  },
  {
    id: "webhooks",
    title: "Webhooky",
    description:
      "Prihláste sa na odber udalostí v reálnom čase. Užitočné zaťaženia webhooku sú podpísané pomocou HMAC-SHA256 pomocou tajomstva poskytnutého pri vytváraní.",
    endpoints: [
      {
        name: "webhooks.list",
        method: "GET",
        description: "Uveďte všetky webhooky pre cvičenie.",
        response: `Webhook[]`,
        auth: "Admin only",
      },
      {
        name: "webhooks.create",
        method: "POST",
        description:
          "Vytvorte si predplatné webhooku. Tajomstvo sa raz vráti a nie je možné ho znova získať.",
        input: `{
  url: string,
  events: WebhookEvent[]
}`,
        response: `{
  ...Webhook,
  secret: string   // shown once
}`,
        auth: "Admin only",
      },
      {
        name: "webhooks.toggle",
        method: "POST",
        description: "Povoliť alebo zakázať webhook.",
        input: `{ id: string }`,
        response: `Webhook`,
        auth: "Admin only",
      },
      {
        name: "webhooks.delete",
        method: "POST",
        description: "Odstráňte predplatné webhooku.",
        input: `{ id: string }`,
        response: `{ success: true }`,
        auth: "Admin only",
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventár",
    description: "Sledujte produkty, stav zásob a dodávateľov.",
    endpoints: [
      {
        name: "inventory.list",
        method: "GET",
        description: "Zoznam položiek inventára pomocou voliteľných filtrov.",
        input: `{
  search?: string,
  category?: string,
  alert?: "all" | "attention" | "low_stock" | "expired" | "expiring_soon",
  limit?: number,
  offset?: number
}`,
        response: `{
  items: Array<InventoryItem & {
    stockStatus: "ok" | "low" | "out",
    expirationStatus: "ok" | "expired" | "expiring_soon"
  }>,
  total: number,
  alertCounts: {
    attention: number,
    lowStock: number,
    expired: number,
    expiringSoon: number
  }
}`,
      },
      {
        name: "inventory.create",
        method: "POST",
        description: "Pridajte novú položku inventára.",
        input: `{
  name: string,
  sku?: string,
  category?: string,
  unitPrice: string,
  costPrice?: string,
  stockQuantity?: number,
  reorderPoint?: number,
  lotNumber?: string,
  expirationDate?: "YYYY-MM-DD"
}`,
        response: `InventoryItem`,
      },
      {
        name: "inventory.update",
        method: "POST",
        description:
          "Aktualizujte metadáta inventárnej položky. Použite inventar.adjustStock na zmeny množstva zásob, takže každý pohyb má svoj dôvod.",
        input: `{
  id: string,
  name?: string,
  sku?: string,
  category?: string,
  unitPrice?: string,
  costPrice?: string,
  reorderPoint?: number,
  lotNumber?: string,
  expirationDate?: "YYYY-MM-DD" | null
}`,
        response: `InventoryItem`,
      },
      {
        name: "inventory.adjustStock",
        method: "POST",
        description: "Upravte množstvo zásob (kladné alebo záporné).",
        input: `{
  id: string,
  adjustment: number,
  reason: string
}`,
        response: `InventoryItem`,
      },
      {
        name: "inventory.listSuppliers",
        method: "GET",
        description: "Uveďte všetkých dodávateľov.",
        response: `Supplier[]`,
      },
      {
        name: "inventory.createSupplier",
        method: "POST",
        description: "Pridajte nového dodávateľa.",
        input: `{
  name: string,
  contactEmail?: string,
  phone?: string,
  address?: string,
  notes?: string
}`,
        response: `Supplier`,
      },
      {
        name: "inventory.updateSupplier",
        method: "POST",
        description: "Aktualizujte kontaktné údaje dodávateľa.",
        input: `{
  id: string,
  name?: string,
  contactEmail?: string | null,
  phone?: string | null,
  address?: string | null,
  notes?: string | null
}`,
        response: `Supplier`,
      },
    ],
  },
  {
    id: "reports",
    title: "Správy",
    description: "Spustite praktickú analýzu počas konfigurovateľných rozsahov dátumov.",
    endpoints: [
      {
        name: "reports.revenue",
        method: "GET",
        description:
          "Celkové výnosy, porovnanie za predchádzajúce obdobie a denné výnosy pre vybratý rozsah.",
        input: `{
  startDate?: "YYYY-MM-DD",
  endDate?: "YYYY-MM-DD"
}`,
        response: `{
  range: ReportDateRange,
  total: number,
  previousTotal: number,
  daily: Array<{ date: string, amount: number }>
}`,
      },
      {
        name: "reports.appointments",
        method: "GET",
        description:
          "KPI vymenovania a rozpis lekárov pre vybraný rozsah.",
        input: `{
  startDate?: "YYYY-MM-DD",
  endDate?: "YYYY-MM-DD"
}`,
        response: `{
  range: ReportDateRange,
  total: number,
  completed: number,
  noShows: number,
  cancelled: number,
  fillRate: number,
  byDoctor: Array<{ doctorName: string, total: number, completed: number }>
}`,
      },
      {
        name: "reports.topServices",
        method: "GET",
        description:
          "Najlepšie fakturované položky služieb podľa počtu a výnosov pre vybratý rozsah.",
        input: `{
  startDate?: "YYYY-MM-DD",
  endDate?: "YYYY-MM-DD"
}`,
        response: `{
  range: ReportDateRange,
  items: Array<{ name: string, count: number, revenue: number }>
}`,
      },
      {
        name: "reports.inventoryAlerts",
        method: "GET",
        description: "Aktuálne upozornenia na nízke zásoby, expiráciu a expiráciu produktov.",
        response: `{
  lowStock: Product[],
  expired: Product[],
  expiringSoon: Product[]
}`,
      },
    ],
  },
  {
    id: "settings",
    title: "Nastavenia",
    description: "Cvičenie koncových bodov konfigurácie iba pre správcov.",
    endpoints: [
      {
        name: "settings.listLocations",
        method: "GET",
        description: "Uveďte miesta aktívneho cvičenia.",
        response: `Array<{
  id: string,
  name: string,
  address: string | null,
  phone: string | null,
  isPrimary: boolean
}>`,
        auth: "Admin only",
      },
      {
        name: "settings.createLocation",
        method: "POST",
        description:
          "Vytvorte miesto na cvičenie a synchronizujte hostované fakturačné množstvá.",
        input: `{
  name: string,
  address?: string,
  phone?: string,
  isPrimary?: boolean
}`,
        response: `Location`,
        auth: "Admin only",
      },
      {
        name: "settings.updateLocation",
        method: "POST",
        description: "Aktualizujte umiestnenie v rozsahu nájomníka.",
        input: `{
  id: string,
  name?: string,
  address?: string,
  phone?: string
}`,
        response: `Location`,
        auth: "Admin only",
      },
      {
        name: "settings.setPrimaryLocation",
        method: "POST",
        description: "Uveďte jedno aktívne miesto nájomníka ako primárne miesto.",
        input: `{ id: string }`,
        response: `Location`,
        auth: "Admin only",
      },
      {
        name: "settings.deleteLocation",
        method: "POST",
        description:
          "Zrušte umiestnenie, zakážte nastavenie odosielania správ, zachovajte aspoň jedno aktívne miesto a synchronizujte hostované fakturačné množstvá.",
        input: `{ id: string }`,
        response: `{ success: true }`,
        auth: "Admin only",
      },
    ],
  },
  {
    id: "communications",
    title: "Komunikácia",
    description: "Sledujte komunikáciu klientov naprieč kanálmi.",
    endpoints: [
      {
        name: "communications.list",
        method: "GET",
        description:
          "Zobrazte komunikáciu pomocou voliteľných filtrov. Filter odoslaných prijatých správ zahŕňa odoslané, doručené a prečítané odchádzajúce správy.",
        input: `{
  clientId?: string,
  status?: string,
  inboxFilter?: "all" | "unread" | "sent",
  limit?: number,
  offset?: number
}`,
        response: `{
  items: Array<Communication & {
    readAt: Date | null,
    providerMessageId: string | null,
    assignedToName: string | null
  }>,
  total: number
}`,
      },
      {
        name: "communications.listConversations",
        method: "GET",
        description:
          "Uveďte jednu najnovšiu správu pre každú konverzáciu v zdieľanej schránke s neprečítanými počtami odvodenými na strane servera. Filter odoslanej doručenej pošty zahŕňa odoslané, doručené a prečítané odchádzajúce konverzácie.",
        input: `{
  inboxFilter?: "all" | "unread" | "sent",
  limit?: number,
  offset?: number
}`,
        response: `{
  items: Array<Communication & {
    readAt: Date | null,
    providerMessageId: string | null,
    assignedToName: string | null,
    unreadCount: number
  }>,
  total: number
}`,
      },
      {
        name: "communications.getByClient",
        method: "GET",
        description: "Získajte všetku komunikáciu pre konkrétneho klienta.",
        input: `{ clientId: string }`,
        response: `Array<Communication & {
  readAt: Date | null,
  providerMessageId: string | null,
  assignedToName: string | null
}>`,
      },
      {
        name: "communications.markClientRead",
        method: "POST",
        description: ". Lekárska anamnéza bola stiahnutá",
        input: `{ clientId: string }`,
        response: `{ ok: true, updated: number }`,
      },
      {
        name: "communications.assignClient",
        method: "POST",
        description:
          "Priraďte alebo zrušte priradenie konverzácie klienta v zdieľanej doručenej pošte.",
        input: `{
  clientId: string,
  action: "assign_to_me" | "unassign",
  expectedAssignedTo: string | null
}`,
        response: `{
  ok: true,
  assignedTo: string | null,
  assignedToName: string | null,
  updated: number
}`,
      },
      {
        name: "communications.linkCommunicationToClient",
        method: "POST",
        description:
          "Prepojte nezhodnú prichádzajúcu správu doručenej pošty s klientom nájomníka.",
        input: `{
  communicationId: string,
  clientId: string
}`,
        response: `{
  ok: true,
  communicationId: string,
  clientId: string,
  assignedTo: string | null,
  assignedToName: string | null
}`,
      },
      {
        name: "communications.create",
        method: "POST",
        description:
          "Odosielajte odchádzajúce SMS/e-maily z doručenej pošty alebo odosielajte/zapisujte internú komunikáciu portálu viditeľnú na klientskom portáli.",
        input: `{
  clientId: string,
  channel: "phone" | "sms" | "email" | "portal",
  direction: "inbound" | "outbound",
  subject?: string,
  content: string,
  status?: "pending" | "sent" | "delivered" | "read" | "failed"
}`,
        response: `Communication`,
      },
      {
        name: "communications.updateStatus",
        method: "POST",
        description:
          "Označiť odchádzajúce správy na portáli ako prečítané po otvorení vlákna klienta",
        input: `{
  id: string,
  status: "read"
}`,
        response: `Communication`,
      },
    ],
  },
];

// ── Components ───────────────────────────────────────────────

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
        method === "GET"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      }`}
    >
      {method}
    </span>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <MethodBadge method={endpoint.method} />
        <code className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {endpoint.name}
        </code>
        {endpoint.auth && endpoint.auth !== "Session cookie" && (
          <span className="ml-auto rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {endpoint.auth}
          </span>
        )}
      </div>
      <div className="space-y-3 px-4 py-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {endpoint.description}
        </p>
        {endpoint.input && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              
              Vstup
            </p>
            <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {endpoint.input}
            </pre>
          </div>
        )}
        {endpoint.response && (
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
              
              Odpoveď
            </p>
            <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {endpoint.response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <nav className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-teal-600 dark:text-teal-400">
            OpenVPM API
          </h2>
          <p className="text-xs text-slate-500">v1.0 Referencia</p>
        </div>
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {s.title}
                <span className="ml-1 text-xs text-slate-400">
                  ({s.endpoints.length})
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="#webhook-events"
              className="block rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              
              Webhook Udalosti
            </a>
          </li>
        </ul>

        <div className="mt-8 border-t border-slate-200 pt-4 dark:border-slate-700">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            
            Základná adresa URL
          </h3>
          <code className="block rounded bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            /api/trpc/ + /api/v1/
          </code>
          <p className="mt-3 text-xs text-slate-500">
            
            Postupy palubnej dosky používajú tRPC pod <code>/api/trpc</code>. Vonkajšie
            integrácie používajú koncové body REST s kľúčom API pod <code>/api/v1</code>.
          </p>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              OpenVPM API Reference
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
              
              Kompletná dokumentácia API pre veterinárnu prax OpenVPM
              systém riadenia. Rozhranie dashboard API používa tRPC, klientsky portál
              toky používajú tokeny portálu a externé integrácie používajú kľúče API
              s koncovými bodmi REST pod <code>/api/v1</code>.
            </p>

            {/* Quick info cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  
                  Autentifikácia
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  
                  Volania ovládacieho panela používajú súbory cookie relácie NextAuth, využívajú toky portálu
                  klientske tokeny a integrácie REST používajú kľúče API.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  
                  Viacnásobný nájom
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  
                  Všetky údaje sa vzťahujú na prax overeného používateľa.
                  Nie je možný žiadny krížový prístup k údajom.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  
                  Udalosti v reálnom čase
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  
                  Prihláste sa na odber živého katalógu webhookov. Udalosti sú podpísané HMAC
                  s každým predplatiteľským tajomstvom.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-12">
              <div className="mb-4 border-b border-slate-200 pb-2 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {section.description}
                </p>
              </div>
              <div className="space-y-4">
                {section.endpoints.map((ep) => (
                  <EndpointCard key={ep.name} endpoint={ep} />
                ))}
              </div>
            </section>
          ))}

          {/* Webhook Events Reference */}
          <section id="webhook-events" className="mb-12">
            <div className="mb-4 border-b border-slate-200 pb-2 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                
                Webhook Udalosti
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                
                Dostupné typy udalostí pre predplatné webhooku. Užitočné zaťaženia sú
                podpísané pomocou HMAC-SHA256 pomocou tajomstva webhooku.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      
                      Udalosť
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      
                      Popis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-700 dark:bg-slate-800/50">
                  {WEBHOOK_EVENT_DEFINITIONS.map((ev) => (
                    <tr key={ev.event}>
                      <td className="px-4 py-2">
                        <code className="text-sm font-medium text-teal-600 dark:text-teal-400">
                          {ev.event}
                        </code>
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                        {ev.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payload example */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                
                Formát užitočného zaťaženia webhooku
              </h3>
              <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {`POST https://your-server.com/webhook
Content-Type: application/json
X-Webhook-Event: appointment.created
X-Webhook-Signature: <hmac-sha256-hex>

{
  "event": "appointment.created",
  "timestamp": "2026-03-17T14:30:00Z",
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "clientId": "uuid",
    "startTime": "2026-03-18T09:00:00Z",
    "status": "scheduled"
  }
}`}
              </pre>
            </div>

            {/* Signature verification */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                
                Overovanie podpisov
              </h3>
              <pre className="overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {`import crypto from "crypto";

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
              </pre>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 dark:border-slate-700">
            <p>
              
              OpenVPM Agent nie je nakonfigurovaný.
            </p>
            <p className="mt-1">
              
              Otázky týkajúce sa API? Skontrolujte{" "}
              <a
                href="https://github.com/evangauer/openvpm"
                className="text-teal-600 hover:underline dark:text-teal-400"
              >
                
                Úložisko GitHub
              </a>{" "}
              
              alebo otvorte problém.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
