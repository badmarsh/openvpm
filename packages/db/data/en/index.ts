import type { controlledSubstanceLog, treatmentTemplates } from "../../schema/index";

type CsLogRow = typeof controlledSubstanceLog.$inferInsert;
type TemplateRow = typeof treatmentTemplates.$inferInsert;

const practiceId = "";
const samplePatients: any[] = [{ id: "" }, { id: "" }, { id: "" }, { id: "" }, { id: "" }];
const vetUsers: any[] = [{ id: "" }, { id: "" }, { id: "" }];
const techUsers: any[] = [{ id: "" }, { id: "" }, { id: "" }];
const daysAgo = (n: number) => new Date();

export const usersData = [
  {
    email: "admin@neighborhoodvet.example.com",
    name: "Practice Administrator",
    role: "admin" as const,
    licenseNumber: null,
    phone: "+421 2 5558 6700",
  },
  {
    email: "sarah.chen@neighborhoodvet.example.com",
    name: "Dr. Sarah Chen",
    role: "veterinarian" as const,
    licenseNumber: "KVL-SK-28491",
    phone: "+421 905 867 501",
  },
  {
    email: "marcus.rivera@neighborhoodvet.example.com",
    name: "Dr. Marcus Rivera",
    role: "veterinarian" as const,
    licenseNumber: "KVL-SK-31057",
    phone: "+421 905 867 502",
  },
  {
    email: "emily.walsh@neighborhoodvet.example.com",
    name: "Dr. Emily Walsh",
    role: "veterinarian" as const,
    licenseNumber: "KVL-SK-34219",
    phone: "+421 905 867 503",
  },
  {
    email: "jamie.torres@neighborhoodvet.example.com",
    name: "Jamie Torres",
    role: "technician" as const,
    licenseNumber: "VT-SK-7823",
    phone: "+421 905 867 521",
  },
  {
    email: "alex.kim@neighborhoodvet.example.com",
    name: "Alex Kim",
    role: "technician" as const,
    licenseNumber: "VT-SK-8104",
    phone: "+421 905 867 522",
  },
  {
    email: "morgan.bailey@neighborhoodvet.example.com",
    name: "Morgan Bailey",
    role: "front_desk" as const,
    licenseNumber: null,
    phone: "+421 905 867 531",
  },
  {
    email: "casey.reed@neighborhoodvet.example.com",
    name: "Casey Reed",
    role: "front_desk" as const,
    licenseNumber: null,
    phone: "+421 905 867 532",
  },
];

export const clientsData = [
  { firstName: "John", lastName: "Smith", address: "123 Main St", city: "Bratislava", state: "SK", zip: "821 01", phone: "+421 905 010 001", email: "john.smith@example.com" },
  { firstName: "Emily", lastName: "Johnson", address: "45 Oak Ave", city: "Bratislava", state: "SK", zip: "811 02", phone: "+421 905 010 002", email: "emily.johnson@example.com" },
  { firstName: "Michael", lastName: "Brown", address: "789 Pine Rd", city: "Košice", state: "SK", zip: "040 01", phone: "+421 905 010 003", email: "michael.brown@example.com" },
  { firstName: "Sarah", lastName: "Davis", address: "321 Elm St", city: "Trnava", state: "SK", zip: "917 01", phone: "+421 905 010 004", email: "sarah.davis@example.com" },
  { firstName: "David", lastName: "Wilson", address: "56 Maple Dr", city: "Žilina", state: "SK", zip: "010 01", phone: "+421 905 010 005", email: "david.wilson@example.com" },
  { firstName: "Jennifer", lastName: "Miller", address: "90 Cedar Ln", city: "Bratislava", state: "SK", zip: "811 06", phone: "+421 905 010 006", email: "jennifer.miller@example.com" },
  { firstName: "Robert", lastName: "Moore", address: "23 Birch Blvd", city: "Banská Bystrica", state: "SK", zip: "974 01", phone: "+421 905 010 007", email: "robert.moore@example.com" },
  { firstName: "Amanda", lastName: "Taylor", address: "47 Spruce Way", city: "Nitra", state: "SK", zip: "949 01", phone: "+421 905 010 008", email: "amanda.taylor@example.com" },
  { firstName: "William", lastName: "Anderson", address: "81 Willow Ct", city: "Žilina", state: "SK", zip: "010 08", phone: "+421 905 010 009", email: "william.anderson@example.com" },
  { firstName: "Jessica", lastName: "Thomas", address: "15 Poplar Pl", city: "Prešov", state: "SK", zip: "080 01", phone: "+421 905 010 010", email: "jessica.thomas@example.com" },
  { firstName: "Christopher", lastName: "Jackson", address: "67 Ash Rd", city: "Trnava", state: "SK", zip: "917 01", phone: "+421 905 010 011", email: "christopher.jackson@example.com" },
  { firstName: "Ashley", lastName: "White", address: "39 Sycamore Ave", city: "Piešťany", state: "SK", zip: "921 01", phone: "+421 905 010 012", email: "ashley.white@example.com" },
  { firstName: "Matthew", lastName: "Harris", address: "92 Redwood Dr", city: "Poprad", state: "SK", zip: "058 01", phone: "+421 905 010 013", email: "matthew.harris@example.com" },
  { firstName: "Nicole", lastName: "Martin", address: "54 Cypress St", city: "Martin", state: "SK", zip: "036 01", phone: "+421 905 010 014", email: "nicole.martin@example.com" },
  { firstName: "Ryan", lastName: "Thompson", address: "76 Palm Ln", city: "Zvolen", state: "SK", zip: "960 01", phone: "+421 905 010 015", email: "ryan.thompson@example.com" },
  { firstName: "Lauren", lastName: "Garcia", address: "28 Magnolia Blvd", city: "Trenčín", state: "SK", zip: "911 01", phone: "+421 905 010 016", email: "lauren.garcia@example.com" },
  { firstName: "Joshua", lastName: "Martinez", address: "41 Cherry Ave", city: "Nové Zámky", state: "SK", zip: "940 01", phone: "+421 905 010 017", email: "joshua.martinez@example.com" },
  { firstName: "Stephanie", lastName: "Robinson", address: "83 Dogwood Dr", city: "Žilina", state: "SK", zip: "010 08", phone: "+421 905 010 018", email: "stephanie.robinson@example.com" },
  { firstName: "Andrew", lastName: "Clark", address: "17 Fir St", city: "Košice", state: "SK", zip: "040 01", phone: "+421 905 010 019", email: "andrew.clark@example.com" },
  { firstName: "Rachel", lastName: "Rodriguez", address: "59 Juniper Pl", city: "Bratislava", state: "SK", zip: "831 01", phone: "+421 905 010 020", email: "rachel.rodriguez@example.com" },
  { firstName: "Justin", lastName: "Lewis", address: "72 Holly Rd", city: "Bratislava", state: "SK", zip: "811 08", phone: "+421 905 010 021", email: "justin.lewis@example.com" },
  { firstName: "Kimberly", lastName: "Lee", address: "34 Ivy Ave", city: "Banská Bystrica", state: "SK", zip: "974 05", phone: "+421 905 010 022", email: "kimberly.lee@example.com" },
  { firstName: "Brandon", lastName: "Walker", address: "96 Laurel Ln", city: "Bratislava", state: "SK", zip: "821 05", phone: "+421 905 010 023", email: "brandon.walker@example.com" },
  { firstName: "Heather", lastName: "Hall", address: "58 Pinecone Dr", city: "Košice", state: "SK", zip: "040 01", phone: "+421 905 010 024", email: "heather.hall@example.com" },
  { firstName: "Tyler", lastName: "Allen", address: "22 Sequoia Blvd", city: "Bratislava", state: "SK", zip: "841 02", phone: "+421 905 010 025", email: "tyler.allen@example.com" },
];

export const patientsData: {
  clientIdx: number;
  name: string;
  species: "canine" | "feline" | "avian" | "rabbit" | "reptile";
  breed: string;
  sex: "male" | "female" | "male_neutered" | "female_spayed";
  dob: string;
  color: string;
  weightKg: string;
}[] = [
    // Dogs (20)
    { clientIdx: 0, name: "Max", species: "canine", breed: "Golden Retriever", sex: "male_neutered", dob: "2020-03-15", color: "Golden", weightKg: "31.8" },
    { clientIdx: 1, name: "Luna", species: "canine", breed: "German Shepherd", sex: "female_spayed", dob: "2019-08-22", color: "Black with tan", weightKg: "28.6" },
    { clientIdx: 2, name: "Charlie", species: "canine", breed: "Labrador Retriever", sex: "male_neutered", dob: "2021-01-10", color: "Chocolate", weightKg: "33.2" },
    { clientIdx: 3, name: "Bella", species: "canine", breed: "French Bulldog", sex: "female_spayed", dob: "2022-05-18", color: "Cream", weightKg: "11.3" },
    { clientIdx: 4, name: "Cooper", species: "canine", breed: "Beagle", sex: "male_neutered", dob: "2020-11-03", color: "Tri-colored", weightKg: "10.9" },
    { clientIdx: 5, name: "Daisy", species: "canine", breed: "Poodle", sex: "female_spayed", dob: "2018-06-25", color: "White", weightKg: "6.8" },
    { clientIdx: 6, name: "Rocky", species: "canine", breed: "Rottweiler", sex: "male", dob: "2021-09-14", color: "Black with tan", weightKg: "45.4" },
    { clientIdx: 7, name: "Lola", species: "canine", breed: "Cavalier King Charles Spaniel", sex: "female_spayed", dob: "2022-02-28", color: "Blenheim", weightKg: "7.3" },
    { clientIdx: 8, name: "Buddy", species: "canine", breed: "Australian Shepherd", sex: "male_neutered", dob: "2020-07-12", color: "Blue Merle", weightKg: "25.0" },
    { clientIdx: 9, name: "Molly", species: "canine", breed: "Boxer", sex: "female_spayed", dob: "2019-04-05", color: "Brindle", weightKg: "27.2" },
    { clientIdx: 10, name: "Bear", species: "canine", breed: "Bernese Mountain Dog", sex: "male_neutered", dob: "2021-12-01", color: "Tri-colored", weightKg: "43.5" },
    { clientIdx: 11, name: "Ruby", species: "canine", breed: "Cocker Spaniel", sex: "female_spayed", dob: "2020-10-17", color: "Golden", weightKg: "12.7" },
    { clientIdx: 12, name: "Zeus", species: "canine", breed: "Great Dane", sex: "male", dob: "2022-08-09", color: "Blue", weightKg: "54.4" },
    { clientIdx: 13, name: "Zoe", species: "canine", breed: "Shih Tzu", sex: "female_spayed", dob: "2019-01-20", color: "Golden and white", weightKg: "5.9" },
    { clientIdx: 14, name: "Jack", species: "canine", breed: "Border Collie", sex: "male_neutered", dob: "2021-04-30", color: "Black and white", weightKg: "18.6" },
    { clientIdx: 15, name: "Lily", species: "canine", breed: "Yorkshire Terrier", sex: "female_spayed", dob: "2020-02-14", color: "Tan", weightKg: "5.4" },
    { clientIdx: 16, name: "Oscar", species: "canine", breed: "Wire Fox Terrier", sex: "male_neutered", dob: "2022-11-25", color: "Salt and pepper", weightKg: "7.7" },
    { clientIdx: 0, name: "Toby", species: "canine", breed: "Mixed Breed", sex: "male_neutered", dob: "2018-09-08", color: "Brown", weightKg: "22.7" },
    { clientIdx: 3, name: "Luna", species: "canine", breed: "Yorkshire Terrier", sex: "female", dob: "2023-03-12", color: "Blue and tan", weightKg: "3.2" },
    { clientIdx: 7, name: "Winston", species: "canine", breed: "English Bulldog", sex: "male_neutered", dob: "2021-06-15", color: "White and red", weightKg: "22.0" },
    // Cats (15)
    { clientIdx: 1, name: "Shadow", species: "feline", breed: "European Shorthair", sex: "male_neutered", dob: "2019-05-10", color: "Orange tabby", weightKg: "5.0" },
    { clientIdx: 4, name: "Whiskers", species: "feline", breed: "Siamese", sex: "female_spayed", dob: "2020-12-05", color: "Seal Point", weightKg: "3.9" },
    { clientIdx: 6, name: "Midnight", species: "feline", breed: "European Longhair", sex: "male_neutered", dob: "2018-03-18", color: "Black", weightKg: "5.9" },
    { clientIdx: 9, name: "Tiger", species: "feline", breed: "Maine Coon", sex: "male", dob: "2021-07-22", color: "Brown tabby", weightKg: "7.3" },
    { clientIdx: 11, name: "Cleo", species: "feline", breed: "Russian Blue", sex: "female_spayed", dob: "2020-09-30", color: "Blue", weightKg: "4.1" },
    { clientIdx: 14, name: "Oliver", species: "feline", breed: "British Shorthair", sex: "male_neutered", dob: "2022-01-14", color: "Blue", weightKg: "5.4" },
    { clientIdx: 17, name: "Nala", species: "feline", breed: "Abyssinian", sex: "female_spayed", dob: "2021-11-08", color: "Wild ticked", weightKg: "3.6" },
    { clientIdx: 18, name: "Simba", species: "feline", breed: "Persian", sex: "male_neutered", dob: "2019-06-17", color: "White", weightKg: "4.5" },
    { clientIdx: 19, name: "Lily", species: "feline", breed: "Ragdoll", sex: "female_spayed", dob: "2020-04-25", color: "Blue bicolor", weightKg: "4.8" },
    { clientIdx: 20, name: "Casper", species: "feline", breed: "Bengal", sex: "male_neutered", dob: "2022-06-03", color: "Brown spotted", weightKg: "5.0" },
    { clientIdx: 21, name: "Mochi", species: "feline", breed: "Scottish Fold", sex: "female_spayed", dob: "2021-02-20", color: "Gray", weightKg: "3.8" },
    { clientIdx: 22, name: "Felix", species: "feline", breed: "European Shorthair", sex: "male_neutered", dob: "2018-10-11", color: "Black and white", weightKg: "5.7" },
    { clientIdx: 23, name: "Smokey", species: "feline", breed: "Sphynx", sex: "female", dob: "2023-01-05", color: "Pink", weightKg: "3.4" },
    { clientIdx: 24, name: "Oreo", species: "feline", breed: "European Shorthair", sex: "male_neutered", dob: "2020-08-15", color: "Black and white", weightKg: "4.9" },
    { clientIdx: 5, name: "Calico", species: "feline", breed: "Calico Cat", sex: "female_spayed", dob: "2019-12-01", color: "Calico", weightKg: "4.0" },
    // Rabbits (2)
    { clientIdx: 10, name: "Coco", species: "rabbit", breed: "Holland Lop", sex: "male_neutered", dob: "2022-04-10", color: "Tortoiseshell", weightKg: "1.8" },
    { clientIdx: 16, name: "Snowball", species: "rabbit", breed: "Mini Rex", sex: "female_spayed", dob: "2023-02-14", color: "Castor", weightKg: "1.5" },
    // Birds (2)
    { clientIdx: 13, name: "Kiwi", species: "avian", breed: "Cockatiel", sex: "male", dob: "2021-08-05", color: "Grey-yellow", weightKg: "0.09" },
    { clientIdx: 19, name: "Sunny", species: "avian", breed: "Sun Conure", sex: "female", dob: "2022-03-20", color: "Yellow-orange", weightKg: "0.11" },
    // Reptile (1)
    { clientIdx: 20, name: "Rex", species: "reptile", breed: "Bearded Dragon", sex: "male", dob: "2021-05-15", color: "Brown-yellow", weightKg: "0.45" },
  ];

export const apptTypesData = [
  { name: "Preventive Exam", durationMinutes: 30, color: "#0d9488", requiresDoctor: 1, defaultRoomType: "exam" as const },
  { name: "Sick Pet Exam", durationMinutes: 30, color: "#dc2626", requiresDoctor: 1, defaultRoomType: "exam" as const },
  { name: "Vaccination", durationMinutes: 15, color: "#2563eb", requiresDoctor: 1, defaultRoomType: "exam" as const },
  { name: "Surgery", durationMinutes: 60, color: "#7c3aed", requiresDoctor: 1, defaultRoomType: "surgery" as const },
  { name: "Dental Cleaning", durationMinutes: 45, color: "#ea580c", requiresDoctor: 1, defaultRoomType: "exam" as const },
  { name: "Follow-up", durationMinutes: 15, color: "#16a34a", requiresDoctor: 1, defaultRoomType: "exam" as const },
];

export const soapTemplates = [
  {
    subjective: "Owner reports patient eating and drinking normally. No vomiting or diarrhea. Normal activity level. Current flea/tick prevention on schedule.",
    objective: "T: 38.4C, HR: 80/min, RR: 20. BCS: 5/9. Alert, responsive. Coat in good condition. Physical exam unremarkable. Mild dental tartar noted on incisors.",
    assessment: "Healthy patient, routine preventive exam. Mild tartar noted - recommend dental cleaning within 6 months.",
    plan: "Continue current diet and exercise. Schedule dental cleaning. Vaccinations per protocol. Annual checkup or as needed.",
  },
  {
    subjective: "Owner reports decreased appetite for 2 days. Patient seems lethargic. No vomiting, but loose stool noted. Drinks water normally.",
    objective: "T: 39.3C, HR: 110/min, RR: 28. BCS: 4/9. Mild dehydration. Abdomen slightly tense on palpation. No masses palpable. Mild discomfort in cranial abdomen.",
    assessment: "Suspected gastroenteritis. Differential includes dietary indiscretion, pancreatitis, foreign body. Recommend bloodwork and monitoring.",
    plan: "Submitted bloodwork/biochemistry. Bland diet (boiled chicken with rice) for 3-5 days. Administered Cerenia 1mg/kg SQ. Follow-up in 48 hours if no improvement. Emergency if vomiting or worsening lethargy.",
  },
  {
    subjective: "Annual vaccination. Owner reports no concerns. Patient takes monthly Heartgard and NexGard.",
    objective: "T: 38.2C, HR: 90/min, RR: 18. BCS: 6/9. Mild overweight. All systems on exam within normal limits. Heart and lungs clear on auscultation.",
    assessment: "Healthy patient, mild overweight. Vaccinated today.",
    plan: "Administered DHPP and Rabies vaccines. Recommended reducing daily food portion by 10% and increasing exercise. Weight check in 3 months. Next preventive exam in 1 year.",
  },
  {
    subjective: "Patient presented for limping on right forelimb, owner noticed after playing in park yesterday. No known trauma. No improvement overnight.",
    objective: "T: 38.6C, HR: 95/min, RR: 22. Lameness right forelimb 2/5. Pain on flexion of right elbow. Mild soft tissue swelling on lateral aspect of elbow. No crepitus. Good range of motion in shoulder and carpus.",
    assessment: "Forelimb lameness, likely soft tissue injury in elbow area. Radiographs showed no fracture or OCD lesion.",
    plan: "Rimadyl 2mg/kg BID with food for 7 days. Strict rest for 2 weeks - leash walks only. Cold compress 10 min 3x daily first 3 days. Follow-up in 2 weeks. Advanced imaging if no improvement.",
  },
  {
    subjective: "Routine dental cleaning under anesthesia. Pre-operative bloodwork performed last week with normal results. Food withheld since 22:00 last night.",
    objective: "Pre-operative vitals: T: 38.3C, HR: 88/min, RR: 16. ASA Class I. Moderate tartar grade 2. No tooth abscesses. All teeth intact and vital.",
    assessment: "Grade 2 dental disease. Moderate tartar accumulation. Radiographs showed no root abscesses.",
    plan: "Performed complete dental prophylaxis under general anesthesia (induction with propofol, maintenance with isoflurane). Tartar completely removed. Teeth polished. Fluoride treatment applied. Recovery uncomplicated. Discharge today evening with soft food recommendations.",
  },
];

export const vaccineData = [
  { name: "DHPP (Distemper/Hepatitis/Parainfluenza/Parvovirus)", manufacturer: "Zoetis", nextDueMonths: 12 },
  { name: "Rabies (3-year)", manufacturer: "Boehringer Ingelheim", nextDueMonths: 36 },
  { name: "Bordetella", manufacturer: "Zoetis", nextDueMonths: 12 },
  { name: "Lyme (Borrelia burgdorferi)", manufacturer: "Zoetis", nextDueMonths: 12 },
  { name: "Canine Influenza (H3N2/H3N8)", manufacturer: "Zoetis", nextDueMonths: 12 },
  { name: "Leptospirosis", manufacturer: "Nobivac", nextDueMonths: 12 },
  { name: "FVRCP (Feline Viral Rhinotracheitis/Calicivirus/Panleukopenia)", manufacturer: "Boehringer Ingelheim", nextDueMonths: 12 },
  { name: "FeLV (Feline Leukemia)", manufacturer: "Boehringer Ingelheim", nextDueMonths: 12 },
  { name: "Rabies (1-year, feline)", manufacturer: "Boehringer Ingelheim", nextDueMonths: 12 },
];

export const prescriptionData = [
  { medicationName: "Rimadyl (Carprofen)", dosage: "75mg", frequency: "BID with food", quantity: 60, instructions: "Give one tablet by mouth twice daily with food. Monitor for GI upset. Do not use with other NSAIDs or corticosteroids." },
  { medicationName: "Metacam (Meloxicam)", dosage: "0.1mg/kg", frequency: "SID", quantity: 30, instructions: "Administer orally once daily. Use provided syringe for accurate dosing. Give with food." },
  { medicationName: "Clavamox (Amoxicillin/Clavulanate)", dosage: "250mg", frequency: "BID", quantity: 28, instructions: "Give one tablet by mouth twice daily for 14 days. Complete full course of antibiotics even if symptoms improve." },
  { medicationName: "Apoquel (Oclacitinib)", dosage: "16mg", frequency: "BID x14d then SID", quantity: 42, instructions: "Give one tablet twice daily for 14 days, then once daily for maintenance. Monitor for infections." },
  { medicationName: "Gabapentin", dosage: "100mg", frequency: "BID", quantity: 60, instructions: "Give one capsule by mouth twice daily for pain management. May cause sedation initially." },
  { medicationName: "Cerenia (Maropitant)", dosage: "24mg", frequency: "SID x5d", quantity: 5, instructions: "Give one tablet once daily for up to 5 days for nausea/vomiting. Can be given with or without food." },
  { medicationName: "Trazodone", dosage: "50mg", frequency: "BID PRN", quantity: 30, instructions: "Give one tablet by mouth twice daily as needed for anxiety. May cause sedation." },
  { medicationName: "Prednisone", dosage: "10mg", frequency: "SID tapering", quantity: 21, instructions: "Day 1-7: 2 tablets daily. Day 8-14: 1 tablet daily. Day 15-21: 1 tablet every other day. Give with food." },
  { medicationName: "Vetmedin (Pimobendan)", dosage: "2.5mg", frequency: "BID", quantity: 60, instructions: "Give one tablet by mouth twice daily, 1 hour before food. Do not give with food. Essential for cardiac function." },
  { medicationName: "Convenia (Cefovecin)", dosage: "8mg/kg", frequency: "Single injection", quantity: 1, instructions: "Single subcutaneous injection administered in clinic. Provides 14 days of antibiotic coverage." },
  { medicationName: "Metronidazole", dosage: "250mg", frequency: "BID x10d", quantity: 20, instructions: "Give one tablet by mouth twice daily for 10 days. May cause decreased appetite. Complete full course." },
  { medicationName: "Fortiflora (Probiotic)", dosage: "1 sachet", frequency: "SID", quantity: 30, instructions: "Sprinkle one sachet on food once daily. Can be used long-term for GI health." },
];

export const labTestData = [
  { testName: "CBC (Complete Blood Count)", unit: "x10^9/L", low: "5.5", high: "16.9", normalValue: () => (5.5 + Math.random() * 11.4).toFixed(1) },
  { testName: "BUN (Blood Urea Nitrogen)", unit: "mg/dL", low: "7.0", high: "27.0", normalValue: () => (7 + Math.random() * 20).toFixed(1) },
  { testName: "Creatinine", unit: "mg/dL", low: "0.5", high: "1.8", normalValue: () => (0.5 + Math.random() * 1.3).toFixed(2) },
  { testName: "ALT (Alanine Aminotransferase)", unit: "U/L", low: "10.0", high: "125.0", normalValue: () => (10 + Math.random() * 115).toFixed(0) },
  { testName: "Glucose", unit: "mg/dL", low: "74.0", high: "143.0", normalValue: () => (74 + Math.random() * 69).toFixed(0) },
  { testName: "Total Protein", unit: "g/dL", low: "5.2", high: "8.2", normalValue: () => (5.2 + Math.random() * 3).toFixed(1) },
  { testName: "Urinalysis - Specific Gravity", unit: "", low: "1.015", high: "1.045", normalValue: () => (1.015 + Math.random() * 0.03).toFixed(3) },
  { testName: "T4 (Thyroid)", unit: "ug/dL", low: "1.0", high: "4.0", normalValue: () => (1 + Math.random() * 3).toFixed(1) },
  { testName: "Alkaline Phosphatase (ALP)", unit: "U/L", low: "23.0", high: "212.0", normalValue: () => (23 + Math.random() * 189).toFixed(0) },
  { testName: "Albumin", unit: "g/dL", low: "2.3", high: "4.0", normalValue: () => (2.3 + Math.random() * 1.7).toFixed(1) },
];

export const procedureData = [
  { name: "Dental Prophylaxis", description: "Complete cleaning of teeth with tartar removal and polishing under general anesthesia", anesthesiaUsed: "Isoflurane + propofol induction", durationMinutes: 60 },
  { name: "Mass Removal", description: "Surgical removal of subcutaneous mass on right flank, submitted for histopathology", anesthesiaUsed: "Isoflurane + local lidocaine block", durationMinutes: 45 },
  { name: "Wound Treatment", description: "Debridement and primary closure of 4cm laceration on left forelimb", anesthesiaUsed: "Sedation (Dexdomitor) + local lidocaine", durationMinutes: 30 },
  { name: "Foreign Body Removal", description: "Endoscopic removal of sock from stomach", anesthesiaUsed: "General isoflurane anesthesia", durationMinutes: 90 },
  { name: "Spay (Ovariohysterectomy)", description: "Routine ovariohysterectomy via midline approach", anesthesiaUsed: "Isoflurane + propofol induction + meloxicam", durationMinutes: 45 },
  { name: "Neuter (Orchiectomy)", description: "Routine castration, prescrotal approach, closed technique", anesthesiaUsed: "Isoflurane + propofol induction", durationMinutes: 25 },
  { name: "Cystotomy", description: "Surgical removal of urinary stones via ventral cystotomy", anesthesiaUsed: "General isoflurane anesthesia + epidural", durationMinutes: 75 },
];

export const servicesData = [
  { name: "Preventive Exam", code: "EXAM-WE", category: "Exam", defaultPrice: "65.00" },
  { name: "Sick Pet Exam", code: "EXAM-SV", category: "Exam", defaultPrice: "75.00" },
  { name: "Surgical Consult", code: "EXAM-SC", category: "Exam", defaultPrice: "85.00" },
  { name: "Dental Prophylaxis", code: "DENT-01", category: "Dental", defaultPrice: "350.00" },
  { name: "Tooth Extraction (Simple)", code: "DENT-02", category: "Dental", defaultPrice: "150.00" },
  { name: "Spay (under 22kg)", code: "SURG-01", category: "Surgery", defaultPrice: "450.00" },
];

// MARKETING TEMPLATES DATA
export const marketingTemplatesData = [
  {
    name: "Preventive Care Reminder",
    description: "Remind clients about annual exams and vaccinations",
    category: "Preventive Care & Wellness",
    platforms: ["facebook", "instagram", "gbp"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton: "A friendly veterinarian with a healthy pet, conveying trust and care for annual checkups",
    exampleCaption: "Don't forget your pet's annual checkup! Regular exams help catch problems early. Book your appointment today!",
    requiresConsent: false,
    isGlobal: true,
  },
  {
    name: "Educational Pet Care Tips",
    description: "Share helpful tips on pet nutrition, exercise, or grooming",
    category: "Educational",
    platforms: ["facebook", "instagram"],
    aspectRatios: ["1:1", "9:16"],
    mediaType: "image",
    promptSkeleton: "Visual guide showing proper pet care techniques, such as feeding portions or grooming tools",
    exampleCaption: "Did you know? Proper nutrition and regular exercise are key to your pet's wellbeing. Learn more about caring for your furry friend.",
    requiresConsent: false,
    isGlobal: true,
  },
  {
    name: "Meet Our Team",
    description: "Introduce veterinarians and staff to build trust",
    category: "Practice & Team",
    platforms: ["facebook", "instagram", "gbp"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton: "Professional photos of veterinarians and staff with their pets or in the clinic",
    exampleCaption: "Meet Dr. Sarah Chen, one of our experienced veterinarians. She's passionate about providing the best care for your pets.",
    requiresConsent: false,
    isGlobal: true,
  },
  {
    name: "Client Success Story",
    description: "Feature positive outcomes and happy pet owners",
    category: "Client & Patient Engagement",
    platforms: ["facebook", "instagram", "gbp"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton: "Happy pet owner with their healthy pet, showing gratitude and satisfaction",
    exampleCaption: "Thanks to early intervention, Max is back to his playful self! We love seeing our patients thrive.",
    requiresConsent: true,
    isGlobal: true,
  },
  {
    name: "Seasonal Promotion",
    description: "Special offers for holiday seasons or specific services",
    category: "Promotions & Announcements",
    platforms: ["facebook", "instagram", "gbp"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton: "Eye-catching promotional graphic with seasonal elements and special offer details",
    exampleCaption: "Spring into health! Book a dental cleaning this month and save 15%. Limited time offer!",
    requiresConsent: false,
    isGlobal: true,
  },
  {
    name: "Community Event Announcement",
    description: "Promote local pet events or adoption drives",
    category: "Community & Events",
    platforms: ["facebook", "instagram"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton: "Inviting graphics featuring community event details with pets and families",
    exampleCaption: "Join us for Pet Adoption Day this Saturday! Meet your new best friend and support local shelters.",
    requiresConsent: false,
    isGlobal: true,
  },
];

// CRM AUTOMATIONS DATA
export const crmAutomationsData = [
  {
    name: "Post-Visit Follow-up",
    triggerType: "APPOINTMENT_DISCHARGE",
    conditions: { delayDays: 1 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a friendly SMS to a client after a veterinary visit. Ask how their pet is doing and offer help. Max 160 chars.",
    },
    isActive: true,
  },
  {
    name: "Vaccination Reminder",
    triggerType: "ANNUAL_REMINDER",
    conditions: { delayDays: 365 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a short SMS reminder that a pet's annual vaccination is due. Max 160 chars.",
    },
    isActive: true,
  },
  {
    name: "Birthday Greeting",
    triggerType: "BIRTHDAY",
    conditions: { delayDays: 0 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a cute birthday SMS from the veterinary clinic to a client for their pet. Fun, Fear-Free tone. Max 160 chars.",
    },
    isActive: true,
  },
  {
    name: "Appointment Confirmation",
    triggerType: "WELLNESS_DUE",
    conditions: { delayDays: 30 },
    actionType: "email",
    actionPayload: {
      templatePrompt:
        "Write a friendly email confirming an upcoming appointment and explaining what the client should bring.",
    },
    isActive: false,
  },
  {
    name: "Missed Appointment Follow-up",
    triggerType: "REVIEW_REQUEST",
    conditions: { delayDays: 3 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a friendly SMS requesting a client to leave a Google review after a positive visit. Max 160 chars.",
    },
    isActive: true,
  },
];

// CANVAS MASTER DOCUMENTS DATA
export const canvasMasterDocumentsData = [
  {
    title: "Practice Strategic Plan",
    docType: "strategy",
    status: "published",
    tags: ["management", "strategic", "planning"],
    content: "<h1>Practice Strategic Plan</h1><p>This document outlines our clinic's strategic objectives for the upcoming year. Our mission is to provide exceptional veterinary care while fostering a supportive environment for both pets and their owners.</p><h2>Goals</h2><ul><li>Increase client retention by 15%</li><li>Implement new digital tools for enhanced patient care</li><li>Expand preventive care education programs</li><li>Improve team training and development</li></ul>",
    isRagSource: true,
  },
  {
    title: "Standard Operating Procedures",
    docType: "sop",
    status: "published",
    tags: ["operations", "protocol", "procedures"],
    content: "<h1>Standard Operating Procedures</h1><p>This document provides detailed protocols for common procedures in our clinic. These SOPs ensure consistent, high-quality care for all patients.</p><h2>Admission Process</h2><ol><li>Verify client information and contact details</li><li>Review pet's medical history</li><li>Assess urgency of visit</li><li>Direct to appropriate examination room</li></ol>",
    isRagSource: true,
  },
  {
    title: "Employee Training Manual",
    docType: "manual",
    status: "published",
    tags: ["training", "staff", "education"],
    content: "<h1>Employee Training Manual</h1><p>This manual serves as a comprehensive guide for all staff members. It covers our clinic policies, procedures, and expectations for delivering excellent service.</p><h2>Customer Service Standards</h2><ul><li>Greet clients warmly within 30 seconds</li><li>Listen actively to concerns</li><li>Provide clear, compassionate communication</li><li>Follow up on all interactions</li></ul>",
    isRagSource: true,
  },
  {
    title: "Client Communication Guidelines",
    docType: "policy",
    status: "published",
    tags: ["communication", "client", "relations"],
    content: "<h1>Client Communication Guidelines</h1><p>Effective communication is essential to building trust with our clients. This document outlines best practices for all client interactions.</p><h2>Key Principles</h2><ul><li>Use clear, jargon-free language</li><li>Empathize with client concerns</li><li>Provide realistic expectations</li><li>Offer educational resources</li></ul>",
    isRagSource: true,
  },
  {
    title: "Emergency Response Protocol",
    docType: "protocol",
    status: "published",
    tags: ["emergency", "response", "crisis"],
    content: "<h1>Emergency Response Protocol</h1><p>This protocol establishes procedures for handling emergency situations in our clinic. It ensures the safety of both patients and staff during critical incidents.</p><h2>Immediate Actions</h2><ol><li>Assess the situation and ensure safety</li><li>Notify the attending veterinarian</li><li>Initiate appropriate medical intervention</li><li>Contact emergency services if necessary</li></ol>",
    isRagSource: true,
  },
];