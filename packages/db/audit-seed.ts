import { usersData as enUsers, clientsData as enClients, patientsData as enPatients, servicesData as enServices, productsData as enProducts, apptTypesData as enApptTypes, soapTemplates as enSoap } from "./data/en/index";
import { usersData as skUsers, clientsData as skClients, patientsData as skPatients, servicesData as skServices, productsData as skProducts, apptTypesData as skApptTypes, soapTemplates as skSoap, miscTranslations as skMisc } from "./data/sk/index";

// Validation helpers per Master Prompt Appendix §6
export function isValidIco(ico: string): boolean {
  if (!/^\d{8}$/.test(ico)) return false;
  const d = ico.split("").map(Number);
  const weights = [8, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * d[i]!, 0) + d[7]!;
  return sum % 11 === 0;
}

export function isValidDic(dic: string): boolean {
  return /^\d{10}$/.test(dic);
}

export function isValidIcDph(icDph: string): boolean {
  return /^SK\d{10}$/.test(icDph);
}

export function isValidPsc(psc: string): boolean {
  return /^\d{3} \d{2}$/.test(psc);
}

export function isValidSkMobile(phone: string): boolean {
  return /^(\+421 9\d{2} \d{3} \d{3}|0\d{1,3}\/\d{3} \d{3,4}|09\d{8})$/.test(phone);
}

export function isValidIban(iban: string): boolean {
  const compact = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^SK\d{22}$/.test(compact)) return false;
  const rearranged = compact.slice(4) + compact.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((c) => (/[A-Z]/.test(c) ? String(c.charCodeAt(0) - 55) : c))
    .join("");
  return BigInt(numeric) % 97n === 1n;
}

export function runSeedAudit(): { passed: boolean; report: string[] } {
  const report: string[] = [];
  let passed = true;

  report.push("=== OpenVPM Slovak Seed Data Audit ===");

  // 1. Practice & Location format validation
  report.push("\n--- Practice & Location Formats ---");
  const testIco = "35815256"; // Valid Slovak IČO (modulo-11)
  const testDic = "2020293057";
  const testIcDph = "SK2020293057";
  const testIban = "SK89 7500 0000 0000 1234 5671";

  if (!isValidIco(testIco)) {
    report.push(`FAIL: Invalid sample IČO (${testIco})`);
    passed = false;
  } else {
    report.push(`PASS: IČO modulo-11 validation (${testIco})`);
  }

  if (!isValidDic(testDic)) {
    report.push(`FAIL: Invalid sample DIČ (${testDic})`);
    passed = false;
  } else {
    report.push(`PASS: DIČ 10-digit format validation (${testDic})`);
  }

  if (!isValidIcDph(testIcDph)) {
    report.push(`FAIL: Invalid sample IČ DPH (${testIcDph})`);
    passed = false;
  } else {
    report.push(`PASS: IČ DPH format validation (${testIcDph})`);
  }

  if (!isValidIban(testIban)) {
    report.push(`FAIL: Invalid sample IBAN (${testIban})`);
    passed = false;
  } else {
    report.push(`PASS: IBAN ISO 7064 MOD 97-10 check (${testIban})`);
  }

  // 2. Client & Address Validations
  report.push("\n--- Client Data & Format Audits ---");
  let clientPscFailures = 0;
  let clientPhoneFailures = 0;
  let clientEmailFailures = 0;

  for (const client of skClients) {
    if (!isValidPsc(client.zip)) clientPscFailures++;
    if (!isValidSkMobile(client.phone)) clientPhoneFailures++;
    if (
      !client.email.endsWith("@example.com") &&
      !client.email.endsWith("@example.net") &&
      !client.email.endsWith("@example.org") &&
      !client.email.endsWith(".example.com")
    )
      clientEmailFailures++;
  }

  if (clientPscFailures === 0) {
    report.push(`PASS: All ${skClients.length} clients have valid PSČ (NNN NN format)`);
  } else {
    report.push(`FAIL: ${clientPscFailures} clients have invalid PSČ`);
    passed = false;
  }

  if (clientPhoneFailures === 0) {
    report.push(`PASS: All ${skClients.length} clients have valid SK phone numbers`);
  } else {
    report.push(`FAIL: ${clientPhoneFailures} clients have invalid phone numbers`);
    passed = false;
  }

  if (clientEmailFailures === 0) {
    report.push(`PASS: All ${skClients.length} clients use reserved .example.com/.net emails`);
  } else {
    report.push(`FAIL: ${clientEmailFailures} clients use non-compliant email domains`);
    passed = false;
  }

  // 3. Row Count Parity Check with English Seed
  report.push("\n--- Row Count Parity Audit (EN vs SK) ---");
  const parityChecks = [
    { label: "Users", en: enUsers.length, sk: skUsers.length },
    { label: "Clients", en: enClients.length, sk: skClients.length },
    { label: "Patients", en: enPatients.length, sk: skPatients.length },
    { label: "Appointment Types", en: enApptTypes.length, sk: skApptTypes.length },
    { label: "SOAP Templates", en: enSoap.length, sk: skSoap.length },
    { label: "Services", en: enServices.length, sk: skServices.length },
    { label: "Products", en: enProducts.length, sk: skProducts.length },
  ];

  for (const check of parityChecks) {
    if (check.en === check.sk) {
      report.push(`PASS: ${check.label} parity: EN=${check.en}, SK=${check.sk}`);
    } else {
      report.push(`FAIL: ${check.label} count mismatch: EN=${check.en}, SK=${check.sk}`);
      passed = false;
    }
  }

  // 4. Edge Case Comprehensiveness Check
  report.push("\n--- Edge Case Comprehensiveness Audit ---");
  
  // Multi-pet household check
  const clientCounts: Record<number, number> = {};
  skPatients.forEach((p) => {
    clientCounts[p.clientIdx] = (clientCounts[p.clientIdx] || 0) + 1;
  });
  const multiPetClients = Object.values(clientCounts).filter((c) => c > 1).length;
  if (multiPetClients > 0) {
    report.push(`PASS: Multi-pet households represented (${multiPetClients} clients own 2+ pets)`);
  } else {
    report.push(`FAIL: No multi-pet households found`);
    passed = false;
  }

  // Allergy alerts check
  if (skMisc.allergies && skMisc.allergies.length > 0) {
    report.push(`PASS: Patient allergy alerts populated (${skMisc.allergies.length} sample allergies)`);
  } else {
    report.push(`FAIL: No patient allergy alerts found`);
    passed = false;
  }

  // Vet MVDr. titles check
  const vets = skUsers.filter((u) => u.role === "veterinarian");
  const validVets = vets.filter((v) => v.name.startsWith("MVDr."));
  if (vets.length > 0 && validVets.length === vets.length) {
    report.push(`PASS: All ${vets.length} veterinarians have correct MVDr. title`);
  } else {
    report.push(`FAIL: Veterinarians missing MVDr. title`);
    passed = false;
  }

  report.push(`\nOVERALL SEED AUDIT RESULT: ${passed ? "PASSED" : "FAILED"}`);
  return { passed, report };
}

const result = runSeedAudit();
result.report.forEach((line) => console.log(line));
if (!result.passed) {
  process.exit(1);
}
