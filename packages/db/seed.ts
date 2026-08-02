import { config } from "dotenv";
config({ path: "../../.env" });
import crypto from "crypto";
import { db } from "./client";
import {
  practices,
  locations,
  users,
  clients,
  patients,
  patientWeights,
  patientAllergies,
  appointmentTypes,
  rooms,
  appointments,
  soapNotes,
  vaccinationRecords,
  prescriptions,
  labResults,
  procedures,
  invoices,
  invoiceItems,
  products,
  services,
  payments,
  communications,
  auditLog,
  controlledSubstanceLog,
  treatmentTemplates,
  treatmentTemplateItems,
} from "./schema/index";

// Pre-hashed bcrypt value for "password123"
const PASSWORD_HASH =
  "$2a$10$1Ui3ssO.fTXmUiyu4B7n0.EWb/M9fGHlZ5mjCXaq.Xqf1OdXwLs/K";

// ---------------------------------------------------------------------------
// Helper: date math
// ---------------------------------------------------------------------------
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function setTime(d: Date, hours: number, minutes: number): Date {
  const copy = new Date(d);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
}

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

import { reset } from "./reset.js";

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seed() {
  await reset();
  const locale = process.env.SEED_LOCALE || "en";

  const localeData = await import(`./data/${locale}/index.js`);

  const {
    usersData,
    clientsData,
    patientsData,
    apptTypesData,
    soapTemplates,
    vaccineData,
    prescriptionData,
    labTestData,
    procedureData,
    servicesData,
    productsData,
    emailSubjects,
    portalMessages,
    callLogs,
    getCsEntries,
    getTemplatesData,
    miscTranslations,
  } = localeData;

  console.log("Seeding database...\n");

  // =========================================================================
  // 1. Practice
  // =========================================================================
  const [practice] = await db
    .insert(practices)
    .values({
      name: miscTranslations.practice.name,
      address: miscTranslations.practice.address,
      phone: "(555) 867-5309",
      email: "hello@neighborhoodvet.example.com",
      website: "https://neighborhoodvet.example.com",
      timezone: locale === "sk" ? "Europe/Bratislava" : "America/New_York",
      country: locale === "sk" ? "SK" : "US",
      subscriptionTier: "cloud",
      // The demo practice is a fully set-up clinic; the first-run wizard
      // must not greet it like a new signup.
      settings: { onboardingCompletedAt: new Date().toISOString() },
    })
    .returning();
  console.log(`Practice: ${practice!.name} (${practice!.id})`);
  const practiceId = practice!.id;

  // =========================================================================
  // 2. Location
  // =========================================================================
  const [location] = await db
    .insert(locations)
    .values({
      practiceId,
      name: miscTranslations.location.name,
      address: miscTranslations.location.address,
      phone: "(555) 867-5309",
      isPrimary: true,
    })
    .returning();
  console.log(`Location: ${location!.name}`);
  const locationId = location!.id;

  // =========================================================================
  // 3. Users (7 staff)
  // =========================================================================
  const insertedUsers = await db
    .insert(users)
    .values(
      usersData.map((u) => ({
        ...u,
        passwordHash: PASSWORD_HASH,
        practiceId,
        locationId,
        locale: locale === "sk" ? "sk" : null,
      }))
    )
    .returning();
  console.log(`Users: ${insertedUsers.length} created`);

  const vets = insertedUsers.filter((u) => u.role === "veterinarian");
  const techs = insertedUsers.filter((u) => u.role === "technician");

  // =========================================================================
  // 4. Clients (25)
  // =========================================================================
  const insertedClients = await db
    .insert(clients)
    .values(clientsData.map((c) => ({ ...c, practiceId, preferredContactMethod: "phone" as const, accessToken: crypto.randomUUID().replace(/-/g, "") })))
    .returning();
  console.log(`Clients: ${insertedClients.length} created`);

  // =========================================================================
  // 5. Patients (40) — dogs ~20, cats ~15, rabbits 2, birds 2, reptile 1
  // =========================================================================
  const insertedPatients = await db
    .insert(patients)
    .values(
      patientsData.map((p) => ({
        practiceId,
        clientId: insertedClients[p.clientIdx]!.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        sex: p.sex,
        dob: p.dob,
        color: p.color,
        status: "active" as const,
      }))
    )
    .returning();
  console.log(`Patients: ${insertedPatients.length} created`);

  // Patient weights
  await db.insert(patientWeights).values(
    patientsData.map((p, i) => ({
      patientId: insertedPatients[i]!.id,
      weightKg: p.weightKg,
      recordedAt: daysAgo(Math.floor(Math.random() * 30)),
      recordedBy: pickRandom(techs).id,
    }))
  );
  console.log("Patient weights recorded");

  // Patient allergies (a few)
  await db.insert(patientAllergies).values(
    miscTranslations.allergies.map((a, i) => ({
      patientId: insertedPatients[i * 3]!.id,
      allergen: a.allergen,
      reaction: a.reaction,
      severity: (i === 0 || i === 2 ? "severe" : i === 1 ? "moderate" : "mild") as const,
      notedBy: vets[i % vets.length]!.id,
    }))
  );
  console.log("Patient allergies recorded");

  // =========================================================================
  // 6. Appointment Types
  // =========================================================================
  const insertedApptTypes = await db
    .insert(appointmentTypes)
    .values(apptTypesData.map((t) => ({ ...t, practiceId })))
    .returning();
  console.log(`Appointment types: ${insertedApptTypes.length} created`);

  // =========================================================================
  // 7. Exam Rooms (3)
  // =========================================================================
  const insertedRooms = await db
    .insert(rooms)
    .values(
      miscTranslations.rooms.map((rName) => ({
        practiceId,
        locationId,
        name: rName,
        type: "exam" as const,
      }))
    )
    .returning();
  console.log(`Rooms: ${insertedRooms.length} created`);

  // =========================================================================
  // 8. Appointments — 2 weeks (past week + current week)
  //    ~5-8 per day per vet, Mon-Fri, 9am-5pm
  // =========================================================================
  const appointmentValues: {
    practiceId: string;
    startTime: Date;
    endTime: Date;
    typeId: string;
    patientId: string;
    clientId: string;
    doctorId: string;
    roomId: string;
    status: "scheduled" | "confirmed" | "checked_in" | "in_exam" | "checked_out" | "no_show" | "cancelled";
    notes: string | null;
  }[] = [];

  const today = new Date();
  const currentDow = today.getDay(); // 0=Sun

  // Generate 10 weekdays: 5 from last week (Mon-Fri) + 5 from this week
  const weekdays: Date[] = [];
  // Last Monday = today - currentDow - 6 (if currentDow is e.g. 3/Wed, last Mon = -8)
  // More robust: last week Mon = this week Mon - 7
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - (currentDow === 0 ? 6 : currentDow - 1));
  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);

  for (let w = 0; w < 2; w++) {
    const weekStart = w === 0 ? lastMonday : thisMonday;
    for (let d = 0; d < 5; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      weekdays.push(day);
    }
  }

  const timeSlots = [
    { hour: 9, min: 0 },
    { hour: 9, min: 30 },
    { hour: 10, min: 0 },
    { hour: 10, min: 30 },
    { hour: 11, min: 0 },
    { hour: 11, min: 30 },
    { hour: 13, min: 0 },
    { hour: 13, min: 30 },
    { hour: 14, min: 0 },
    { hour: 14, min: 30 },
    { hour: 15, min: 0 },
    { hour: 15, min: 30 },
    { hour: 16, min: 0 },
    { hour: 16, min: 30 },
  ];

  const pastStatuses: ("checked_out" | "no_show" | "cancelled")[] = [
    "checked_out", "checked_out", "checked_out", "checked_out",
    "checked_out", "checked_out", "checked_out", "checked_out",
    "no_show", "cancelled",
  ];

  const futureStatuses: ("scheduled" | "confirmed")[] = ["scheduled", "confirmed", "confirmed"];

  for (const day of weekdays) {
    const isPast = day < today && day.toDateString() !== today.toDateString();
    const isToday = day.toDateString() === today.toDateString();

    for (const vet of vets) {
      // 5-8 appointments per day per vet
      const numAppts = 5 + Math.floor(Math.random() * 4);
      const daySlots = pickN(timeSlots, numAppts);
      daySlots.sort((a, b) => a.hour * 60 + a.min - (b.hour * 60 + b.min));

      for (const slot of daySlots) {
        const apptType = pickRandom(insertedApptTypes);
        const patient = pickRandom(insertedPatients);
        // The appointment's client MUST be the patient's actual owner. The
        // schedule/dashboard patient-name join requires
        // patient.clientId === appointment.clientId, so a mismatched client
        // makes the name resolve to null and render as "Unknown Patient".
        // Map by the patient's own clientIdx, not its position in the array.
        const patientIdx = insertedPatients.indexOf(patient);
        const clientForPatient = insertedClients[patientsData[patientIdx]!.clientIdx];
        const startTime = setTime(day, slot.hour, slot.min);
        const endTime = addMinutes(startTime, apptType.durationMinutes);

        let status: typeof appointmentValues[0]["status"];
        if (isPast) {
          status = pickRandom(pastStatuses);
        } else if (isToday) {
          const nowHour = today.getHours();
          if (slot.hour < nowHour) {
            status = pickRandom(["checked_out", "checked_out", "checked_out", "no_show"] as const);
          } else if (slot.hour === nowHour) {
            status = pickRandom(["in_exam", "checked_in"] as const);
          } else {
            status = pickRandom(["scheduled", "confirmed", "confirmed"] as const);
          }
        } else {
          status = pickRandom(futureStatuses);
        }

        appointmentValues.push({
          practiceId,
          startTime,
          endTime,
          typeId: apptType.id,
          patientId: patient.id,
          clientId: clientForPatient
            ? clientForPatient.id
            : insertedClients[0]!.id,
          doctorId: vet.id,
          roomId: pickRandom(insertedRooms).id,
          status,
          notes: Math.random() > 0.7 ? miscTranslations.appointment.notes : null,
        });
      }
    }
  }

  const insertedAppointments = await db
    .insert(appointments)
    .values(appointmentValues)
    .returning();
  console.log(`Appointments: ${insertedAppointments.length} created`);

  // =========================================================================
  // 9. SOAP Notes for past checked_out appointments (sample)
  // =========================================================================
  const pastCheckedOut = insertedAppointments.filter(
    (a) => a.status === "checked_out"
  );
  const soapNotesCount = Math.min(pastCheckedOut.length, 40);
  const soapNotesToCreate = pastCheckedOut.slice(0, soapNotesCount);
  await db.insert(soapNotes).values(
    soapNotesToCreate.map((appt) => {
      const template = pickRandom(soapTemplates);
      return {
        practiceId,
        patientId: appt.patientId!,
        appointmentId: appt.id,
        authorId: appt.doctorId!,
        subjective: template.subjective,
        objective: template.objective,
        assessment: template.assessment,
        plan: template.plan,
      };
    })
  );
  console.log(`SOAP notes: ${soapNotesCount} created`);

  // =========================================================================
  // 10. Vaccination Records
  // =========================================================================
  const vaccinationValues: {
    practiceId: string;
    patientId: string;
    vaccineName: string;
    lotNumber: string;
    manufacturer: string;
    administeredBy: string;
    administeredAt: Date;
    nextDueDate: string;
  }[] = [];

  // Dogs get DHPP, Rabies, Bordetella; Cats get FVRCP, Rabies, FeLV
  for (const patient of insertedPatients) {
    const pData = patientsData[insertedPatients.indexOf(patient)]!;
    let applicableVaccines: typeof vaccineData;
    if (pData.species === "canine") {
      applicableVaccines = vaccineData.filter((v) =>
        ["DHPP", "Rabies (3-year)", "Bordetella", "Lyme", "Leptospirosis"].some((n) => v.name.startsWith(n))
      );
    } else if (pData.species === "feline") {
      applicableVaccines = vaccineData.filter((v) =>
        ["FVRCP", "FeLV", "Rabies (1-year"].some((n) => v.name.startsWith(n))
      );
    } else if (pData.species === "rabbit") {
      // Rabbits: RHDV2
      applicableVaccines = [{ name: "RHDV2 (Rabbit Hemorrhagic Disease)", manufacturer: "Medgene", nextDueMonths: 12 }];
    } else {
      continue; // Birds/reptiles — skip vaccines
    }

    // Give 1-3 vaccines per patient
    const numVax = 1 + Math.floor(Math.random() * Math.min(3, applicableVaccines.length));
    const selectedVax = pickN(applicableVaccines, numVax);

    for (const vax of selectedVax) {
      const adminDate = daysAgo(Math.floor(Math.random() * 180) + 30);
      const nextDue = new Date(adminDate);
      nextDue.setMonth(nextDue.getMonth() + vax.nextDueMonths);

      vaccinationValues.push({
        practiceId,
        patientId: patient.id,
        vaccineName: vax.name,
        lotNumber: `LOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        manufacturer: vax.manufacturer,
        administeredBy: pickRandom(vets).id,
        administeredAt: adminDate,
        nextDueDate: dateStr(nextDue),
      });
    }
  }

  await db.insert(vaccinationRecords).values(vaccinationValues);
  console.log(`Vaccination records: ${vaccinationValues.length} created`);

  // =========================================================================
  // 11. Prescriptions
  // =========================================================================
  const prescriptionValues = [];
  // Create ~15 prescriptions for various patients
  for (let i = 0; i < 15; i++) {
    const rx = prescriptionData[i % prescriptionData.length]!;
    const patient = pickRandom(insertedPatients.slice(0, 20)); // mostly dogs/cats
    const startDate = daysAgo(Math.floor(Math.random() * 60));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (rx.quantity / (rx.frequency.includes("BID") ? 2 : 1)));

    const isCompleted = endDate < new Date();
    prescriptionValues.push({
      practiceId,
      patientId: patient.id,
      medicationName: rx.medicationName,
      dosage: rx.dosage,
      frequency: rx.frequency,
      quantity: rx.quantity,
      refillsRemaining: isCompleted ? 0 : Math.floor(Math.random() * 3),
      prescribedBy: pickRandom(vets).id,
      startDate: dateStr(startDate),
      endDate: dateStr(endDate),
      status: isCompleted ? ("completed" as const) : ("active" as const),
      instructions: rx.instructions,
    });
  }

  await db.insert(prescriptions).values(prescriptionValues);
  console.log(`Prescriptions: ${prescriptionValues.length} created`);

  // =========================================================================
  // 11b. Lab Results
  // =========================================================================
  const labResultValues: {
    practiceId: string;
    patientId: string;
    testName: string;
    resultValue: string;
    unit: string;
    referenceRangeLow: string;
    referenceRangeHigh: string;
    status: "pending" | "completed" | "reviewed";
    orderedBy: string;
    reviewedBy?: string;
  }[] = [];

  // Create 12 lab results across different patients
  const labPatients = pickN(insertedPatients.slice(0, 20), 8);
  for (let i = 0; i < 12; i++) {
    const patient = labPatients[i % labPatients.length]!;
    const test = labTestData[i % labTestData.length]!;
    const vet = pickRandom(vets);

    // Make some results out of range (elevated BUN for seniors, high ALT, etc.)
    let resultValue: string;
    if (i === 1) {
      // Elevated BUN
      resultValue = "42.5";
    } else if (i === 3) {
      // High ALT
      resultValue = "198";
    } else if (i === 7) {
      // Low T4
      resultValue = "0.6";
    } else {
      resultValue = test.normalValue();
    }

    const statusOptions: ("pending" | "completed" | "reviewed")[] = ["pending", "completed", "reviewed"];
    const status = i < 3 ? "pending" : i < 7 ? "completed" : "reviewed";

    labResultValues.push({
      practiceId,
      patientId: patient.id,
      testName: test.testName,
      resultValue,
      unit: test.unit,
      referenceRangeLow: test.low,
      referenceRangeHigh: test.high,
      status,
      orderedBy: vet.id,
      ...(status === "reviewed" ? { reviewedBy: vet.id } : {}),
    });
  }

  await db.insert(labResults).values(labResultValues);
  console.log(`Lab results: ${labResultValues.length} created`);

  // =========================================================================
  // 11c. Procedures
  // =========================================================================
  const procedureValues: {
    practiceId: string;
    patientId: string;
    name: string;
    description: string;
    performedBy: string;
    anesthesiaUsed: string;
    durationMinutes: number;
    notes: string;
  }[] = [];

  const procPatients = pickN(insertedPatients.slice(0, 20), 7);
  for (let i = 0; i < 7; i++) {
    const patient = procPatients[i % procPatients.length]!;
    const proc = procedureData[i]!;
    const vet = pickRandom(vets);

    procedureValues.push({
      practiceId,
      patientId: patient.id,
      name: proc.name,
      description: proc.description,
      performedBy: vet.id,
      anesthesiaUsed: proc.anesthesiaUsed,
      durationMinutes: proc.durationMinutes,
      notes: miscTranslations.procedure.notesTemplate(Math.floor(proc.durationMinutes / 2)),
    });
  }

  await db.insert(procedures).values(procedureValues);
  console.log(`Procedures: ${procedureValues.length} created`);

  // =========================================================================
  // 12. Services
  // =========================================================================
  const insertedServices = await db
    .insert(services)
    .values(servicesData.map((s) => ({ ...s, practiceId, taxable: true })))
    .returning();
  console.log(`Services: ${insertedServices.length} created`);

  // =========================================================================
  // 13. Invoices (various states)
  // =========================================================================
  const invoiceStatuses: ("draft" | "sent" | "paid" | "overdue")[] = [
    "paid", "paid", "paid", "paid", "paid",
    "paid", "paid", "sent", "sent", "sent",
    "draft", "draft", "overdue", "overdue",
  ];

  const invoiceValues: {
    practiceId: string;
    clientId: string;
    patientId: string;
    appointmentId: string | null;
    status: "draft" | "sent" | "paid" | "overdue";
    subtotal: string;
    tax: string;
    total: string;
    paidAmount: string;
    dueDate: string;
    createdAt: Date;
  }[] = [];

  for (let i = 0; i < invoiceStatuses.length; i++) {
    const status = invoiceStatuses[i]!;
    const client = insertedClients[i % insertedClients.length]!;
    const patientIdx = patientsData.findIndex(
      (p) => insertedClients[p.clientIdx]?.id === client.id
    );
    const patient = patientIdx >= 0 ? insertedPatients[patientIdx]! : insertedPatients[0]!;
    const appt = i < insertedAppointments.length ? insertedAppointments[i]! : null;

    const subtotal = (50 + Math.floor(Math.random() * 400)).toFixed(2);
    const tax = (parseFloat(subtotal) * 0.08).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);
    const paidAmount = status === "paid" ? total : status === "overdue" ? "0.00" : "0.00";

    // Issue every invoice before its due date so no invoice reads as "due
    // before it was created" in the UI.
    let dueDate: string;
    let createdAt: Date;
    if (status === "paid") {
      const dueDaysAgo = Math.floor(Math.random() * 30);
      createdAt = daysAgo(dueDaysAgo + 14);
      dueDate = dateStr(daysAgo(dueDaysAgo));
    } else if (status === "overdue") {
      const dueDaysAgo = Math.floor(Math.random() * 14) + 1;
      createdAt = daysAgo(dueDaysAgo + 14);
      dueDate = dateStr(daysAgo(dueDaysAgo));
    } else {
      createdAt = daysAgo(Math.floor(Math.random() * 5));
      dueDate = dateStr(daysFromNow(30));
    }

    invoiceValues.push({
      practiceId,
      clientId: client.id,
      patientId: patient.id,
      appointmentId: appt?.id ?? null,
      status,
      subtotal,
      tax,
      total,
      paidAmount,
      dueDate,
      createdAt,
    });
  }

  const insertedInvoices = await db
    .insert(invoices)
    .values(invoiceValues)
    .returning();
  console.log(`Invoices: ${insertedInvoices.length} created`);

  // Invoice items
  const invoiceItemValues: {
    invoiceId: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
    itemType: "service" | "product";
  }[] = [];

  for (const inv of insertedInvoices) {
    const numItems = 1 + Math.floor(Math.random() * 4);
    let runningTotal = 0;

    for (let j = 0; j < numItems; j++) {
      const svc = pickRandom(insertedServices);
      const qty = 1;
      const unitPrice = svc.defaultPrice;
      const itemTotal = (parseFloat(unitPrice) * qty).toFixed(2);
      runningTotal += parseFloat(itemTotal);

      invoiceItemValues.push({
        invoiceId: inv.id,
        description: svc.name,
        quantity: qty,
        unitPrice,
        total: itemTotal,
        itemType: "service",
      });
    }
  }

  await db.insert(invoiceItems).values(invoiceItemValues);
  console.log(`Invoice items: ${invoiceItemValues.length} created`);

  // =========================================================================
  // 14. Products (50)
  // =========================================================================
  const insertedProducts = await db
    .insert(products)
    .values(
      productsData.map((p) => ({
        practiceId,
        locationId,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unitPrice: p.unitPrice,
        costPrice: p.costPrice,
        stockQuantity: p.stockQuantity,
        reorderPoint: p.reorderPoint,
      }))
    )
    .returning();
  console.log(`Products: ${insertedProducts.length} created`);

  // =========================================================================
  // 16. Payments — one per paid invoice
  // =========================================================================
  const frontDeskUsers = insertedUsers.filter((u) => u.role === "front_desk");
  const vetUsers = insertedUsers.filter((u) => u.role === "veterinarian");
  const techUsers = insertedUsers.filter((u) => u.role === "technician");
  const adminUser = insertedUsers.find((u) => u.role === "admin")!;
  const paidInvoices = insertedInvoices.filter((i) => i.status === "paid");
  const paymentMethods = ["credit_card", "credit_card", "debit_card", "cash", "check", "credit_card", "online"] as const;

  const paymentValues = paidInvoices.map((inv, i) => ({
    invoiceId: inv.id,
    amount: inv.total,
    method: paymentMethods[i % paymentMethods.length]!,
    receivedBy: frontDeskUsers[i % frontDeskUsers.length]!.id,
    receivedAt: daysAgo(Math.floor(Math.random() * 14)),
    notes: null,
  }));
  const insertedPayments = await db.insert(payments).values(paymentValues).returning();
  console.log(`Payments: ${insertedPayments.length} created`);

  // =========================================================================
  // 17. Communications — messages, calls, emails, portal
  // =========================================================================
  type CommRow = typeof communications.$inferInsert;
  const commValues: CommRow[] = [];
  const someClients = insertedClients.slice(0, 12);

  // SMS appointment reminders (outbound, delivered)
  for (let i = 0; i < 5; i++) {
    commValues.push({
      practiceId,
      clientId: someClients[i]!.id,
      channel: "sms",
      direction: "outbound",
      subject: null,
      content: miscTranslations.communication.smsReminderTemplate(someClients[i]!.firstName),
      status: "delivered",
      assignedTo: frontDeskUsers[i % frontDeskUsers.length]!.id,
      createdAt: daysAgo(Math.floor(Math.random() * 7)),
    });
  }

  // Emails — wellness reminders + Rx refill reply + invoice copy
  emailSubjects.forEach((e, i) => {
    commValues.push({
      practiceId,
      clientId: someClients[5 + i]!.id,
      channel: "email",
      direction: "outbound",
      subject: e.subject,
      content: e.content,
      status: "sent",
      assignedTo: frontDeskUsers[i % frontDeskUsers.length]!.id,
      createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
    });
  });

  // Portal messages — inbound from clients
  portalMessages.forEach((m, i) => {
    commValues.push({
      practiceId,
      clientId: someClients[9 + i]!.id,
      channel: "portal",
      direction: "inbound",
      subject: m.subject,
      content: m.content,
      status: "delivered",
      assignedTo: i === 0 ? vetUsers[0]!.id : frontDeskUsers[0]!.id,
      createdAt: daysAgo(Math.floor(Math.random() * 5)),
    });
  });

  // Phone call logs
  callLogs.forEach((c, i) => {
    commValues.push({
      practiceId,
      clientId: someClients[i]!.id,
      channel: "phone",
      direction: c.direction,
      subject: null,
      content: c.content,
      status: "delivered",
      assignedTo: frontDeskUsers[i % frontDeskUsers.length]!.id,
      createdAt: daysAgo(Math.floor(Math.random() * 5)),
    });
  });

  const insertedComms = await db.insert(communications).values(commValues).returning();
  console.log(`Communications: ${insertedComms.length} created`);

  // =========================================================================
  // 18. Audit log — recent practice activity
  // =========================================================================
  type AuditRow = typeof auditLog.$inferInsert;
  const auditValues: AuditRow[] = [];

  const samplePatients = insertedPatients.slice(0, 15);
  const sampleAppts = insertedAppointments.slice(0, 20);
  const sampleInvoicesForAudit = insertedInvoices.slice(0, 10);
  const auditIp = () => `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

  // Appointment lifecycle events
  sampleAppts.slice(0, 12).forEach((appt, i) => {
    auditValues.push({
      practiceId,
      userId: frontDeskUsers[i % frontDeskUsers.length]!.id,
      action: "appointment.created",
      entityType: "appointment",
      entityId: appt.id,
      changes: { status: "scheduled" },
      ipAddress: auditIp(),
      createdAt: daysAgo(Math.floor(Math.random() * 7)),
    });
  });
  sampleAppts.slice(0, 6).forEach((appt, i) => {
    auditValues.push({
      practiceId,
      userId: frontDeskUsers[i % frontDeskUsers.length]!.id,
      action: "appointment.checked_in",
      entityType: "appointment",
      entityId: appt.id,
      changes: { status: "checked_in" },
      ipAddress: auditIp(),
      createdAt: daysAgo(Math.floor(Math.random() * 3)),
    });
  });

  // Invoice lifecycle
  sampleInvoicesForAudit.slice(0, 6).forEach((inv, i) => {
    auditValues.push({
      practiceId,
      userId: frontDeskUsers[i % frontDeskUsers.length]!.id,
      action: "invoice.created",
      entityType: "invoice",
      entityId: inv.id,
      changes: { total: inv.total },
      ipAddress: auditIp(),
      createdAt: daysAgo(Math.floor(Math.random() * 14)),
    });
  });
  paidInvoices.slice(0, 4).forEach((inv, i) => {
    auditValues.push({
      practiceId,
      userId: frontDeskUsers[i % frontDeskUsers.length]!.id,
      action: "invoice.paid",
      entityType: "invoice",
      entityId: inv.id,
      changes: { status: "paid", paidAmount: inv.total },
      ipAddress: auditIp(),
      createdAt: daysAgo(Math.floor(Math.random() * 10)),
    });
  });

  // Patient record edits by vets
  samplePatients.slice(0, 5).forEach((patient, i) => {
    auditValues.push({
      practiceId,
      userId: vetUsers[i % vetUsers.length]!.id,
      action: "patient.updated",
      entityType: "patient",
      entityId: patient.id,
      changes: { weight: "updated" },
      ipAddress: auditIp(),
      createdAt: daysAgo(Math.floor(Math.random() * 5)),
    });
  });

  // Login events (practice-level, not tied to an entity)
  [adminUser, ...vetUsers, ...frontDeskUsers].forEach((user, i) => {
    auditValues.push({
      practiceId,
      userId: user.id,
      action: "user.login",
      entityType: "user",
      entityId: user.id,
      changes: null,
      ipAddress: auditIp(),
      createdAt: daysAgo(Math.floor(Math.random() * 2)),
    });
  });

  const insertedAudit = await db.insert(auditLog).values(auditValues).returning();
  console.log(`Audit log entries: ${insertedAudit.length} created`);

  // =========================================================================
  // 19. Controlled substance log — DEA-compliant dispense trail
  // =========================================================================
  type CsLogRow = typeof controlledSubstanceLog.$inferInsert;
  const insertedCs = await db.insert(controlledSubstanceLog).values(getCsEntries(practiceId, samplePatients, vetUsers, techUsers, daysAgo)).returning();
  console.log(`Controlled substance log: ${insertedCs.length} created`);

  // =========================================================================
  // 20. Treatment templates — common procedure bundles
  // =========================================================================
  type TemplateRow = typeof treatmentTemplates.$inferInsert;
  const templatesData = getTemplatesData(practiceId);
  for (const tpl of templatesData) {
    const { items, ...tplFields } = tpl;
    const [inserted] = await db.insert(treatmentTemplates).values(tplFields).returning();
    await db.insert(treatmentTemplateItems).values(
      items.map((item, idx) => ({
        templateId: inserted!.id,
        itemType: "service" as const,
        itemId: null,
        description: item.description,
        defaultQuantity: item.defaultQuantity,
        defaultUnitPrice: item.defaultUnitPrice,
        sortOrder: idx,
      }))
    );
  }
  console.log(`Treatment templates: ${templatesData.length} created`);

  // =========================================================================
  // Done!
  // =========================================================================
  console.log("\nSeed completed successfully!");
  console.log(`
Summary:
  - 1 practice
  - 1 location
  - ${insertedUsers.length} users (3 vets, 2 techs, 2 front desk)
  - ${insertedClients.length} clients
  - ${insertedPatients.length} patients
  - ${insertedApptTypes.length} appointment types
  - ${insertedRooms.length} exam rooms
  - ${insertedAppointments.length} appointments
  - ${soapNotesCount} SOAP notes
  - ${vaccinationValues.length} vaccination records
  - ${prescriptionValues.length} prescriptions
  - ${labResultValues.length} lab results
  - ${procedureValues.length} procedures
  - ${insertedInvoices.length} invoices with ${invoiceItemValues.length} line items
  - ${insertedPayments.length} payments
  - ${insertedComms.length} communications (SMS/email/portal/phone)
  - ${insertedAudit.length} audit log entries
  - ${insertedCs.length} controlled substance log entries
  - ${templatesData.length} treatment templates
  - ${insertedServices.length} services
  - ${insertedProducts.length} products
  `);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
