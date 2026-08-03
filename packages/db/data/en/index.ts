import type { controlledSubstanceLog, treatmentTemplates } from "../../schema/index";

type CsLogRow = typeof controlledSubstanceLog.$inferInsert;
type TemplateRow = typeof treatmentTemplates.$inferInsert;

export const usersData = [
    {
      email: "admin@neighborhoodvet.example.com",
      name: "Practice Admin",
      role: "admin" as const,
      licenseNumber: null,
      phone: "(555) 867-5309 x100",
    },
    {
      email: "sarah.chen@neighborhoodvet.example.com",
      name: "Dr. Sarah Chen",
      role: "veterinarian" as const,
      licenseNumber: "VET-NJ-28491",
      phone: "(555) 867-5309 x101",
    },
    {
      email: "marcus.rivera@neighborhoodvet.example.com",
      name: "Dr. Marcus Rivera",
      role: "veterinarian" as const,
      licenseNumber: "VET-NJ-31057",
      phone: "(555) 867-5309 x102",
    },
    {
      email: "emily.walsh@neighborhoodvet.example.com",
      name: "Dr. Emily Walsh",
      role: "veterinarian" as const,
      licenseNumber: "VET-NJ-34219",
      phone: "(555) 867-5309 x103",
    },
    {
      email: "jamie.torres@neighborhoodvet.example.com",
      name: "Jamie Torres",
      role: "technician" as const,
      licenseNumber: "LVT-NJ-7823",
      phone: "(555) 867-5309 x201",
    },
    {
      email: "alex.kim@neighborhoodvet.example.com",
      name: "Alex Kim",
      role: "technician" as const,
      licenseNumber: "LVT-NJ-8104",
      phone: "(555) 867-5309 x202",
    },
    {
      email: "morgan.bailey@neighborhoodvet.example.com",
      name: "Morgan Bailey",
      role: "front_desk" as const,
      licenseNumber: null,
      phone: "(555) 867-5309 x301",
    },
    {
      email: "casey.reed@neighborhoodvet.example.com",
      name: "Casey Reed",
      role: "front_desk" as const,
      licenseNumber: null,
      phone: "(555) 867-5309 x302",
    },
  ];

export const clientsData = [
    { firstName: "John", lastName: "Smith", address: "124 Maple Street", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0001", email: "john.smith@example.com" },
    { firstName: "Mary", lastName: "Johnson", address: "45 Oak Lane", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0002", email: "mary.johnson@example.com" },
    { firstName: "Robert", lastName: "Williams", address: "78 Pine Avenue", city: "Springfield", state: "NJ", zip: "07081", phone: "(555) 010-0003", email: "robert.williams@example.com" },
    { firstName: "Patricia", lastName: "Brown", address: "234 Elm Boulevard", city: "Trenton", state: "NJ", zip: "08601", phone: "(555) 010-0004", email: "patricia.brown@example.com" },
    { firstName: "Michael", lastName: "Jones", address: "56 Cedar Road", city: "Edison", state: "NJ", zip: "08817", phone: "(555) 010-0005", email: "michael.jones@example.com" },
    { firstName: "Linda", lastName: "Garcia", address: "89 Walnut Drive", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0006", email: "linda.garcia@example.com" },
    { firstName: "David", lastName: "Miller", address: "123 Chestnut Street", city: "Princeton", state: "NJ", zip: "08540", phone: "(555) 010-0007", email: "david.miller@example.com" },
    { firstName: "Elizabeth", lastName: "Davis", address: "456 Birch Way", city: "New Brunswick", state: "NJ", zip: "08901", phone: "(555) 010-0008", email: "elizabeth.davis@example.com" },
    { firstName: "James", lastName: "Rodriguez", address: "22 Ash Court", city: "Edison", state: "NJ", zip: "08817", phone: "(555) 010-0009", email: "james.rodriguez@example.com" },
    { firstName: "Jennifer", lastName: "Martinez", address: "67 Willow Pass", city: "Cherry Hill", state: "NJ", zip: "08002", phone: "(555) 010-0010", email: "jennifer.martinez@example.com" },
    { firstName: "William", lastName: "Hernandez", address: "301 Poplar Street", city: "Trenton", state: "NJ", zip: "08601", phone: "(555) 010-0011", email: "william.hernandez@example.com" },
    { firstName: "Barbara", lastName: "Lopez", address: "15 Cypress Lane", city: "Clifton", state: "NJ", zip: "07011", phone: "(555) 010-0012", email: "barbara.lopez@example.com" },
    { firstName: "Thomas", lastName: "Gonzalez", address: "88 Spruce Hill", city: "Paterson", state: "NJ", zip: "07501", phone: "(555) 010-0013", email: "thomas.gonzalez@example.com" },
    { firstName: "Jessica", lastName: "Wilson", address: "42 Magnolia Drive", city: "Hoboken", state: "NJ", zip: "07030", phone: "(555) 010-0014", email: "jessica.wilson@example.com" },
    { firstName: "Charles", lastName: "Anderson", address: "19 Redwood Terrace", city: "Jersey City", state: "NJ", zip: "07302", phone: "(555) 010-0015", email: "charles.anderson@example.com" },
    { firstName: "Karen", lastName: "Thomas", address: "200 Sycamore Street", city: "Morristown", state: "NJ", zip: "07960", phone: "(555) 010-0016", email: "karen.thomas@example.com" },
    { firstName: "Christopher", lastName: "Taylor", address: "77 Beech Avenue", city: "Hackensack", state: "NJ", zip: "07601", phone: "(555) 010-0017", email: "christopher.taylor@example.com" },
    { firstName: "Nancy", lastName: "Moore", address: "33 Alder Road", city: "Edison", state: "NJ", zip: "08817", phone: "(555) 010-0018", email: "nancy.moore@example.com" },
    { firstName: "Daniel", lastName: "Jackson", address: "55 Hickory Court", city: "Springfield", state: "NJ", zip: "07081", phone: "(555) 010-0019", email: "daniel.jackson@example.com" },
    { firstName: "Margaret", lastName: "Martin", address: "99 Laurel Lane", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0020", email: "margaret.martin@example.com" },
    { firstName: "Steven", lastName: "Lee", address: "144 Linden Street", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0021", email: "steven.lee@example.com" },
    { firstName: "Dorothy", lastName: "Perez", address: "28 Maplewood Drive", city: "Princeton", state: "NJ", zip: "08540", phone: "(555) 010-0022", email: "dorothy.perez@example.com" },
    { firstName: "Andrew", lastName: "Thompson", address: "61 Forest Way", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0023", email: "andrew.thompson@example.com" },
    { firstName: "Sandra", lastName: "White", address: "73 Orchard Street", city: "Springfield", state: "NJ", zip: "07081", phone: "(555) 010-0024", email: "sandra.white@example.com" },
    { firstName: "Kevin", lastName: "Harris", address: "180 River Road", city: "Anytown", state: "NJ", zip: "07001", phone: "(555) 010-0025", email: "kevin.harris@example.com" },
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
    { clientIdx: 1, name: "Luna", species: "canine", breed: "German Shepherd", sex: "female_spayed", dob: "2019-08-22", color: "Black & Tan", weightKg: "28.6" },
    { clientIdx: 2, name: "Charlie", species: "canine", breed: "Labrador Retriever", sex: "male_neutered", dob: "2021-01-10", color: "Chocolate", weightKg: "33.2" },
    { clientIdx: 3, name: "Bella", species: "canine", breed: "French Bulldog", sex: "female_spayed", dob: "2022-05-18", color: "Fawn", weightKg: "11.3" },
    { clientIdx: 4, name: "Cooper", species: "canine", breed: "Beagle", sex: "male_neutered", dob: "2020-11-03", color: "Tricolor", weightKg: "10.9" },
    { clientIdx: 5, name: "Daisy", species: "canine", breed: "Poodle", sex: "female_spayed", dob: "2018-06-25", color: "White", weightKg: "6.8" },
    { clientIdx: 6, name: "Rocky", species: "canine", breed: "Rottweiler", sex: "male", dob: "2021-09-14", color: "Black & Rust", weightKg: "45.4" },
    { clientIdx: 7, name: "Sadie", species: "canine", breed: "Cavalier King Charles Spaniel", sex: "female_spayed", dob: "2022-02-28", color: "Blenheim", weightKg: "7.3" },
    { clientIdx: 8, name: "Bear", species: "canine", breed: "Australian Shepherd", sex: "male_neutered", dob: "2020-07-12", color: "Blue Merle", weightKg: "25.0" },
    { clientIdx: 9, name: "Molly", species: "canine", breed: "Boxer", sex: "female_spayed", dob: "2019-04-05", color: "Brindle", weightKg: "27.2" },
    { clientIdx: 10, name: "Duke", species: "canine", breed: "Bernese Mountain Dog", sex: "male_neutered", dob: "2021-12-01", color: "Tricolor", weightKg: "43.5" },
    { clientIdx: 11, name: "Rosie", species: "canine", breed: "Cocker Spaniel", sex: "female_spayed", dob: "2020-10-17", color: "Buff", weightKg: "12.7" },
    { clientIdx: 12, name: "Zeus", species: "canine", breed: "Great Dane", sex: "male", dob: "2022-08-09", color: "Blue", weightKg: "54.4" },
    { clientIdx: 13, name: "Penny", species: "canine", breed: "Shih Tzu", sex: "female_spayed", dob: "2019-01-20", color: "Gold & White", weightKg: "5.9" },
    { clientIdx: 14, name: "Buddy", species: "canine", breed: "Border Collie", sex: "male_neutered", dob: "2021-04-30", color: "Black & White", weightKg: "18.6" },
    { clientIdx: 15, name: "Zoe", species: "canine", breed: "Dachshund", sex: "female_spayed", dob: "2020-02-14", color: "Red", weightKg: "5.4" },
    { clientIdx: 16, name: "Buster", species: "canine", breed: "Miniature Schnauzer", sex: "male_neutered", dob: "2022-11-25", color: "Salt & Pepper", weightKg: "7.7" },
    { clientIdx: 0, name: "Rusty", species: "canine", breed: "Mixed Breed", sex: "male_neutered", dob: "2018-09-08", color: "Brown", weightKg: "22.7" },
    { clientIdx: 3, name: "Chloe", species: "canine", breed: "Yorkshire Terrier", sex: "female", dob: "2023-03-12", color: "Blue & Tan", weightKg: "3.2" },
    { clientIdx: 7, name: "Winston", species: "canine", breed: "English Bulldog", sex: "male_neutered", dob: "2021-06-15", color: "White & Red", weightKg: "22.0" },
    // Cats (15)
    { clientIdx: 1, name: "Oliver", species: "feline", breed: "Domestic Shorthair", sex: "male_neutered", dob: "2019-05-10", color: "Orange Tabby", weightKg: "5.0" },
    { clientIdx: 4, name: "Cleo", species: "feline", breed: "Siamese", sex: "female_spayed", dob: "2020-12-05", color: "Seal Point", weightKg: "3.9" },
    { clientIdx: 6, name: "Shadow", species: "feline", breed: "Domestic Longhair", sex: "male_neutered", dob: "2018-03-18", color: "Black", weightKg: "5.9" },
    { clientIdx: 9, name: "Leo", species: "feline", breed: "Maine Coon", sex: "male", dob: "2021-07-22", color: "Brown Tabby", weightKg: "7.3" },
    { clientIdx: 11, name: "Nala", species: "feline", breed: "Russian Blue", sex: "female_spayed", dob: "2020-09-30", color: "Blue", weightKg: "4.1" },
    { clientIdx: 14, name: "Milo", species: "feline", breed: "British Shorthair", sex: "male_neutered", dob: "2022-01-14", color: "Blue", weightKg: "5.4" },
    { clientIdx: 17, name: "Mia", species: "feline", breed: "Abyssinian", sex: "female_spayed", dob: "2021-11-08", color: "Ruddy", weightKg: "3.6" },
    { clientIdx: 18, name: "Simba", species: "feline", breed: "Persian", sex: "male_neutered", dob: "2019-06-17", color: "White", weightKg: "4.5" },
    { clientIdx: 19, name: "Lily", species: "feline", breed: "Ragdoll", sex: "female_spayed", dob: "2020-04-25", color: "Seal Bicolor", weightKg: "4.8" },
    { clientIdx: 20, name: "Jasper", species: "feline", breed: "Bengal", sex: "male_neutered", dob: "2022-06-03", color: "Brown Spotted", weightKg: "5.0" },
    { clientIdx: 21, name: "Mochi", species: "feline", breed: "Scottish Fold", sex: "female_spayed", dob: "2021-02-20", color: "Silver", weightKg: "3.8" },
    { clientIdx: 22, name: "Felix", species: "feline", breed: "Domestic Shorthair", sex: "male_neutered", dob: "2018-10-11", color: "Tuxedo", weightKg: "5.7" },
    { clientIdx: 23, name: "Sasha", species: "feline", breed: "Sphynx", sex: "female", dob: "2023-01-05", color: "Pink", weightKg: "3.4" },
    { clientIdx: 24, name: "Oreo", species: "feline", breed: "Domestic Shorthair", sex: "male_neutered", dob: "2020-08-15", color: "Black & White", weightKg: "4.9" },
    { clientIdx: 5, name: "Callie", species: "feline", breed: "Calico", sex: "female_spayed", dob: "2019-12-01", color: "Calico", weightKg: "4.0" },
    // Rabbits (2)
    { clientIdx: 10, name: "Thumper", species: "rabbit", breed: "Holland Lop", sex: "male_neutered", dob: "2022-04-10", color: "Tortoiseshell", weightKg: "1.8" },
    { clientIdx: 16, name: "Clover", species: "rabbit", breed: "Mini Rex", sex: "female_spayed", dob: "2023-02-14", color: "Castor", weightKg: "1.5" },
    // Birds (2)
    { clientIdx: 13, name: "Kiwi", species: "avian", breed: "Cockatiel", sex: "male", dob: "2021-08-05", color: "Grey & Yellow", weightKg: "0.09" },
    { clientIdx: 19, name: "Sunny", species: "avian", breed: "Sun Conure", sex: "female", dob: "2022-03-20", color: "Yellow & Orange", weightKg: "0.11" },
    // Reptile (1)
    { clientIdx: 20, name: "Rex", species: "reptile", breed: "Bearded Dragon", sex: "male", dob: "2021-05-15", color: "Tan & Yellow", weightKg: "0.45" },
  ];

export const apptTypesData = [
    { name: "Wellness Exam", durationMinutes: 30, color: "#0d9488", requiresDoctor: 1, defaultRoomType: "exam" as const },
    { name: "Sick Visit", durationMinutes: 30, color: "#dc2626", requiresDoctor: 1, defaultRoomType: "exam" as const },
    { name: "Vaccination", durationMinutes: 15, color: "#2563eb", requiresDoctor: 1, defaultRoomType: "exam" as const },
    { name: "Surgery", durationMinutes: 60, color: "#7c3aed", requiresDoctor: 1, defaultRoomType: "surgery" as const },
    { name: "Dental Prophylaxis", durationMinutes: 45, color: "#ea580c", requiresDoctor: 1, defaultRoomType: "exam" as const },
    { name: "Recheck / Follow-up", durationMinutes: 15, color: "#16a34a", requiresDoctor: 1, defaultRoomType: "exam" as const },
  ];

export const soapTemplates = [
    {
      subjective: "Owner reports patient is eating and drinking normally. No vomiting or diarrhea. Normal activity level. Up to date on flea/tick prevention.",
      objective: "T: 101.2F, HR: 80bpm, RR: 20. BCS: 5/9. Bright, alert, responsive. Coat in good condition. Physical exam unremarkable. Mild dental tartar noted on molars.",
      assessment: "Healthy patient, routine wellness exam. Mild dental tartar - recommended dental scaling within 6 months.",
      plan: "Continue current diet and exercise. Schedule dental cleaning. Vaccinations updated per protocol. Recheck in 1 year or PRN.",
    },
    {
      subjective: "Owner presents patient for decreased appetite for 2 days. Patient seems lethargic. No vomiting reported, but soft stool noted yesterday. Drinking water normally.",
      objective: "T: 102.8F, HR: 110bpm, RR: 28. BCS: 4/9. Mild dehydration. Abdomen slightly tense on palpation. No palpable masses. Mild discomfort in cranial abdomen.",
      assessment: "Suspected gastroenteritis. Differential diagnosis includes dietary indiscretion, pancreatitis, foreign body. Bloodwork and monitoring recommended.",
      plan: "Sent out CBC/Chemistry panel. Bland diet (boiled chicken and rice) for 3-5 days. Administered Cerenia 1mg/kg SQ. Recheck in 48 hours if no improvement. ER if vomiting or worsening lethargy.",
    },
    {
      subjective: "Annual vaccination visit. Owner reports no health concerns. Patient is taking monthly Heartgard and NexGard.",
      objective: "T: 100.8F, HR: 90bpm, RR: 18. BCS: 6/9. Slightly overweight. All body systems normal on examination. Heart and lungs clear on auscultation.",
      assessment: "Healthy patient, mild overweight. Vaccinations administered today.",
      plan: "Administered DHPP and Rabies vaccines. Recommended reducing daily food portion by 10% and increasing exercise. Weight check in 3 months. Annual exam next year.",
    },
    {
      subjective: "Patient brought in for right forelimb lameness, noticed after playing in the park yesterday. No known trauma. No improvement overnight.",
      objective: "T: 101.5F, HR: 95bpm, RR: 22. Right forelimb lameness 2/5. Pain elicited on flexion of right elbow. Mild soft tissue swelling lateral elbow. No crepitus. Good ROM shoulder/carpus.",
      assessment: "Right forelimb lameness, likely soft tissue strain in elbow region. X-rays negative for fracture or OCD lesion.",
      plan: "Rimadyl 2mg/kg BID x 7 days with food. Strict rest for 2 weeks - leash walks only. Cold compress 10 min TID for first 3 days. Recheck 2 weeks. Consider referral for advanced imaging if no improvement.",
    },
    {
      subjective: "Routine dental prophylaxis under anesthesia. Pre-anesthetic bloodwork performed last week with normal results. Fasted since 10pm last night.",
      objective: "Pre-anesthetic vitals: T: 101.0F, HR: 88bpm, RR: 16. ASA Class I. Stage 2 dental disease with moderate tartar on premolars and molars. Mild gingivitis. Complete intraoral radiographs taken.",
      assessment: "Stage 2 periodontal disease. Moderate calculus accumulation. No root abscesses on x-rays. All teeth intact and viable.",
      plan: "Performed complete dental prophylaxis under general anesthesia (propofol induction, isoflurane maintenance). Calculus completely removed. Teeth polished. Applied fluoride treatment. Smooth recovery. Discharge tonight with soft food recommendation for 3 days.",
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
    { name: "Dental Prophylaxis", description: "Complete dental cleaning with scaling and polishing under general anesthesia", anesthesiaUsed: "Isoflurane + Propofol induction", durationMinutes: 60 },
    { name: "Mass Removal", description: "Surgical excision of subcutaneous mass on right flank, submitted for histopathology", anesthesiaUsed: "Isoflurane + Lidocaine local block", durationMinutes: 45 },
    { name: "Laceration Repair", description: "Wound debridement and primary closure of 4cm laceration on left forelimb", anesthesiaUsed: "Dexdomitor sedation + local Lidocaine", durationMinutes: 30 },
    { name: "Foreign Body Removal", description: "Endoscopic retrieval of sock foreign body from stomach", anesthesiaUsed: "General Isoflurane anesthesia", durationMinutes: 90 },
    { name: "Spay (Ovariohysterectomy)", description: "Routine midline ovariohysterectomy", anesthesiaUsed: "Isoflurane + Propofol induction + Meloxicam", durationMinutes: 45 },
    { name: "Neuter (Orchiectomy)", description: "Routine prescrotal closed orchiectomy", anesthesiaUsed: "Isoflurane + Propofol induction", durationMinutes: 25 },
    { name: "Cystotomy", description: "Surgical removal of bladder stones via ventral cystotomy", anesthesiaUsed: "General Isoflurane anesthesia + epidural", durationMinutes: 75 },
  ];

export const servicesData = [
    { name: "Wellness Exam", code: "EXAM-WE", category: "Exam", defaultPrice: "65.00" },
    { name: "Sick Visit Examination", code: "EXAM-SV", category: "Exam", defaultPrice: "75.00" },
    { name: "Surgery Consultation", code: "EXAM-SC", category: "Exam", defaultPrice: "85.00" },
    { name: "Dental Prophylaxis", code: "DENT-01", category: "Dental", defaultPrice: "350.00" },
    { name: "Tooth Extraction (simple)", code: "DENT-02", category: "Dental", defaultPrice: "150.00" },
    { name: "Spay (under 50 lbs)", code: "SURG-01", category: "Surgery", defaultPrice: "400.00" },
    { name: "Neuter (under 50 lbs)", code: "SURG-02", category: "Surgery", defaultPrice: "300.00" },
    { name: "Mass Removal", code: "SURG-03", category: "Surgery", defaultPrice: "500.00" },
    { name: "Radiograph (2 views)", code: "DIAG-01", category: "Diagnostic", defaultPrice: "185.00" },
    { name: "CBC/Chemistry Panel", code: "LAB-01", category: "Lab", defaultPrice: "145.00" },
    { name: "Urinalysis", code: "LAB-02", category: "Lab", defaultPrice: "55.00" },
    { name: "Fecal Float", code: "LAB-03", category: "Lab", defaultPrice: "35.00" },
    { name: "DHPP Vaccine", code: "VAX-01", category: "Vaccine", defaultPrice: "28.00" },
    { name: "Rabies Vaccine", code: "VAX-02", category: "Vaccine", defaultPrice: "22.00" },
    { name: "Bordetella Vaccine", code: "VAX-03", category: "Vaccine", defaultPrice: "25.00" },
    { name: "FVRCP Vaccine", code: "VAX-04", category: "Vaccine", defaultPrice: "28.00" },
    { name: "FeLV Vaccine", code: "VAX-05", category: "Vaccine", defaultPrice: "30.00" },
    { name: "Nail Trim", code: "GROO-01", category: "Grooming", defaultPrice: "18.00" },
    { name: "Anal Gland Expression", code: "GROO-02", category: "Grooming", defaultPrice: "25.00" },
    { name: "Microchip Implantation", code: "MISC-01", category: "Misc", defaultPrice: "55.00" },
  ];

export const productsData = [
    // Medications
    { name: "Rimadyl 75mg (60ct)", sku: "MED-001", category: "Medication", unitPrice: "85.00", costPrice: "42.00", stockQuantity: 45, reorderPoint: 15 },
    { name: "Metacam 1.5mg/mL Oral Suspension (32mL)", sku: "MED-002", category: "Medication", unitPrice: "65.00", costPrice: "32.00", stockQuantity: 30, reorderPoint: 10 },
    { name: "Clavamox 250mg (28ct)", sku: "MED-003", category: "Medication", unitPrice: "48.00", costPrice: "22.00", stockQuantity: 50, reorderPoint: 15 },
    { name: "Apoquel 16mg (30ct)", sku: "MED-004", category: "Medication", unitPrice: "125.00", costPrice: "78.00", stockQuantity: 25, reorderPoint: 10 },
    { name: "Gabapentin 100mg (60ct)", sku: "MED-005", category: "Medication", unitPrice: "35.00", costPrice: "12.00", stockQuantity: 60, reorderPoint: 20 },
    { name: "Cerenia 24mg (4ct)", sku: "MED-006", category: "Medication", unitPrice: "95.00", costPrice: "55.00", stockQuantity: 20, reorderPoint: 8 },
    { name: "Trazodone 50mg (30ct)", sku: "MED-007", category: "Medication", unitPrice: "28.00", costPrice: "10.00", stockQuantity: 40, reorderPoint: 15 },
    { name: "Prednisone 10mg (30ct)", sku: "MED-008", category: "Medication", unitPrice: "15.00", costPrice: "5.00", stockQuantity: 55, reorderPoint: 20 },
    { name: "Vetmedin 2.5mg (50ct)", sku: "MED-009", category: "Medication", unitPrice: "145.00", costPrice: "88.00", stockQuantity: 15, reorderPoint: 5 },
    { name: "Metronidazole 250mg (30ct)", sku: "MED-010", category: "Medication", unitPrice: "22.00", costPrice: "8.00", stockQuantity: 50, reorderPoint: 15 },
    { name: "Doxycycline 100mg (30ct)", sku: "MED-011", category: "Medication", unitPrice: "32.00", costPrice: "12.00", stockQuantity: 40, reorderPoint: 15 },
    { name: "Enrofloxacin 68mg (50ct)", sku: "MED-012", category: "Medication", unitPrice: "55.00", costPrice: "28.00", stockQuantity: 30, reorderPoint: 10 },
    { name: "Cephalexin 500mg (100ct)", sku: "MED-013", category: "Medication", unitPrice: "45.00", costPrice: "18.00", stockQuantity: 35, reorderPoint: 12 },
    { name: "Tramadol 50mg (60ct)", sku: "MED-014", category: "Medication", unitPrice: "38.00", costPrice: "15.00", stockQuantity: 25, reorderPoint: 10 },
    { name: "Enalapril 5mg (60ct)", sku: "MED-015", category: "Medication", unitPrice: "25.00", costPrice: "8.00", stockQuantity: 30, reorderPoint: 10 },
    // Preventives
    { name: "Heartgard Plus (26-50 lbs, 6ct)", sku: "PREV-001", category: "Preventive", unitPrice: "55.00", costPrice: "32.00", stockQuantity: 40, reorderPoint: 15 },
    { name: "NexGard (24.1-60 lbs, 6ct)", sku: "PREV-002", category: "Preventive", unitPrice: "120.00", costPrice: "72.00", stockQuantity: 35, reorderPoint: 12 },
    { name: "Simparica Trio (22.1-44 lbs, 6ct)", sku: "PREV-003", category: "Preventive", unitPrice: "135.00", costPrice: "82.00", stockQuantity: 28, reorderPoint: 10 },
    { name: "Revolution Plus (5.6-11 lbs cat, 6ct)", sku: "PREV-004", category: "Preventive", unitPrice: "125.00", costPrice: "75.00", stockQuantity: 25, reorderPoint: 10 },
    { name: "Bravecto (22-44 lbs, 1ct)", sku: "PREV-005", category: "Preventive", unitPrice: "58.00", costPrice: "35.00", stockQuantity: 30, reorderPoint: 10 },
    // Supplements
    { name: "Fortiflora Canine (30 sachets)", sku: "SUP-001", category: "Supplement", unitPrice: "32.00", costPrice: "18.00", stockQuantity: 45, reorderPoint: 15 },
    { name: "Fortiflora Feline (30 sachets)", sku: "SUP-002", category: "Supplement", unitPrice: "32.00", costPrice: "18.00", stockQuantity: 35, reorderPoint: 12 },
    { name: "Dasuquin Advanced (84ct)", sku: "SUP-003", category: "Supplement", unitPrice: "65.00", costPrice: "38.00", stockQuantity: 25, reorderPoint: 8 },
    { name: "Welactin Omega-3 (120 softgels)", sku: "SUP-004", category: "Supplement", unitPrice: "42.00", costPrice: "22.00", stockQuantity: 20, reorderPoint: 8 },
    { name: "Cosequin DS Plus MSM (132ct)", sku: "SUP-005", category: "Supplement", unitPrice: "55.00", costPrice: "30.00", stockQuantity: 22, reorderPoint: 8 },
    // Food
    { name: "Hill's Science Diet Adult (30 lb)", sku: "FOOD-001", category: "Food", unitPrice: "72.00", costPrice: "45.00", stockQuantity: 15, reorderPoint: 5 },
    { name: "Royal Canin GI Low Fat (17.6 lb)", sku: "FOOD-002", category: "Food", unitPrice: "85.00", costPrice: "52.00", stockQuantity: 12, reorderPoint: 4 },
    { name: "Hill's Prescription Diet k/d (8.5 lb)", sku: "FOOD-003", category: "Food", unitPrice: "48.00", costPrice: "28.00", stockQuantity: 10, reorderPoint: 4 },
    { name: "Royal Canin Urinary SO (17.6 lb)", sku: "FOOD-004", category: "Food", unitPrice: "78.00", costPrice: "48.00", stockQuantity: 8, reorderPoint: 3 },
    { name: "Hill's Science Diet Kitten (7 lb)", sku: "FOOD-005", category: "Food", unitPrice: "32.00", costPrice: "18.00", stockQuantity: 10, reorderPoint: 4 },
    { name: "Purina Pro Plan Sensitive Skin (30 lb)", sku: "FOOD-006", category: "Food", unitPrice: "62.00", costPrice: "38.00", stockQuantity: 12, reorderPoint: 4 },
    { name: "Royal Canin Hydrolyzed Protein (17.6 lb)", sku: "FOOD-007", category: "Food", unitPrice: "92.00", costPrice: "58.00", stockQuantity: 6, reorderPoint: 3 },
    { name: "Hill's i/d Digestive Care (8.5 lb)", sku: "FOOD-008", category: "Food", unitPrice: "45.00", costPrice: "26.00", stockQuantity: 14, reorderPoint: 5 },
    // Supplies
    { name: "Elizabethan Collar (Medium)", sku: "SUP-S01", category: "Supply", unitPrice: "15.00", costPrice: "5.00", stockQuantity: 30, reorderPoint: 10 },
    { name: "Elizabethan Collar (Large)", sku: "SUP-S02", category: "Supply", unitPrice: "18.00", costPrice: "6.00", stockQuantity: 25, reorderPoint: 10 },
    { name: "Pill Pockets - Chicken (30ct)", sku: "SUP-S03", category: "Supply", unitPrice: "12.00", costPrice: "6.00", stockQuantity: 50, reorderPoint: 15 },
    { name: "Pill Pockets - Peanut Butter (30ct)", sku: "SUP-S04", category: "Supply", unitPrice: "12.00", costPrice: "6.00", stockQuantity: 45, reorderPoint: 15 },
    { name: "Gentle Leader Headcollar (Medium)", sku: "SUP-S05", category: "Supply", unitPrice: "22.00", costPrice: "12.00", stockQuantity: 15, reorderPoint: 5 },
    { name: "Microchip (HomeAgain)", sku: "SUP-S06", category: "Supply", unitPrice: "35.00", costPrice: "18.00", stockQuantity: 40, reorderPoint: 15 },
    { name: "Vetrap Bandage (4 in x 5 yd)", sku: "SUP-S07", category: "Supply", unitPrice: "4.00", costPrice: "1.50", stockQuantity: 100, reorderPoint: 30 },
    { name: "Adhesive Bandage Roll", sku: "SUP-S08", category: "Supply", unitPrice: "6.00", costPrice: "2.00", stockQuantity: 80, reorderPoint: 25 },
    { name: "Ear Cleaner (8 oz)", sku: "SUP-S09", category: "Supply", unitPrice: "14.00", costPrice: "7.00", stockQuantity: 35, reorderPoint: 10 },
    { name: "Chlorhexidine Flush (8 oz)", sku: "SUP-S10", category: "Supply", unitPrice: "16.00", costPrice: "8.00", stockQuantity: 30, reorderPoint: 10 },
    { name: "Dental Chews (Large, 30ct)", sku: "SUP-S11", category: "Supply", unitPrice: "28.00", costPrice: "14.00", stockQuantity: 25, reorderPoint: 8 },
    { name: "Syringes 3mL (100ct)", sku: "SUP-S12", category: "Supply", unitPrice: "18.00", costPrice: "8.00", stockQuantity: 20, reorderPoint: 5 },
    { name: "IV Catheter 20ga (50ct)", sku: "SUP-S13", category: "Supply", unitPrice: "45.00", costPrice: "22.00", stockQuantity: 15, reorderPoint: 5 },
    { name: "Surgical Gloves (Medium, 100ct)", sku: "SUP-S14", category: "Supply", unitPrice: "25.00", costPrice: "12.00", stockQuantity: 18, reorderPoint: 5 },
    { name: "KY Jelly Lubricant (4 oz)", sku: "SUP-S15", category: "Supply", unitPrice: "8.00", costPrice: "3.00", stockQuantity: 20, reorderPoint: 8 },
    { name: "Fecal Sample Container (50ct)", sku: "SUP-S16", category: "Supply", unitPrice: "15.00", costPrice: "6.00", stockQuantity: 25, reorderPoint: 8 },
    { name: "Pet Nail Clipper (Professional)", sku: "SUP-S17", category: "Supply", unitPrice: "18.00", costPrice: "8.00", stockQuantity: 10, reorderPoint: 3 },
  ];

export const emailSubjects = [
    { subject: "Annual wellness exam due for your pet", content: "It's time for your yearly wellness visit. Reply to this email or call the clinic to schedule." },
    { subject: "Vaccination booster reminder", content: "Your pet is due for a DHPP booster this month. We have openings on Tuesday and Thursday afternoons." },
    { subject: "Re: Prescription refill for Rimadyl", content: "Thanks for the refill request. We've approved a 30-day refill — pick up anytime this week during office hours." },
    { subject: "Invoice copy — recent visit", content: "Attached is the itemized invoice for your recent visit. Let us know if you have any questions." },
  ];

export const portalMessages = [
    { subject: "Question about Luna's medication", content: "Is it okay to give Luna her Rimadyl with food? She seems to have an upset stomach after taking it on an empty stomach." },
    { subject: "Rescheduling Tuesday appointment", content: "Hi — my work schedule changed. Can we move Tuesday's appointment to later in the week?" },
    { subject: "Vaccination records needed for boarding", content: "We're boarding Max next weekend. Can you send his vaccination records to the kennel?" },
  ];

export const callLogs = [
    { content: "Client called about limping on left hind leg, started this morning. Advised to bring in today — booked 3pm slot.", direction: "inbound" as const },
    { content: "Called to confirm surgery consent for tomorrow's dental. Client confirmed drop-off at 7:30am, fasting since 10pm.", direction: "outbound" as const },
    { content: "Post-op check-in call — patient eating normally, sutures look clean. Recheck scheduled in 10 days.", direction: "outbound" as const },
  ];

export const getCsEntries = (practiceId: string, samplePatients: any[], vetUsers: any[], techUsers: any[], daysAgo: (n: number) => Date): CsLogRow[] => [
    {
      practiceId,
      drugName: "Tramadol HCl 50mg",
      deaSchedule: "IV",
      action: "administered",
      quantity: "2.000",
      unit: "tablet",
      patientId: samplePatients[0]!.id,
      performedBy: vetUsers[0]!.id,
      witnessedBy: techUsers[0]!.id,
      lotNumber: "TR-2026-0318-A",
      notes: "Post-op pain management, dental extraction",
      performedAt: daysAgo(2),
    },
    {
      practiceId,
      drugName: "Buprenorphine 0.3 mg/mL",
      deaSchedule: "III",
      action: "administered",
      quantity: "0.500",
      unit: "mL",
      patientId: samplePatients[1]!.id,
      performedBy: vetUsers[1]!.id,
      witnessedBy: techUsers[0]!.id,
      lotNumber: "BUP-2026-Q1-7",
      notes: "Pre-surgical analgesia",
      performedAt: daysAgo(4),
    },
    {
      practiceId,
      drugName: "Phenobarbital 30mg",
      deaSchedule: "IV",
      action: "administered",
      quantity: "30.000",
      unit: "tablet",
      patientId: samplePatients[2]!.id,
      performedBy: vetUsers[0]!.id,
      witnessedBy: techUsers[1]!.id,
      lotNumber: "PB-2026-0201",
      notes: "30-day supply dispensed for seizure control",
      performedAt: daysAgo(6),
    },
    {
      practiceId,
      drugName: "Ketamine 100 mg/mL",
      deaSchedule: "III",
      action: "administered",
      quantity: "1.200",
      unit: "mL",
      patientId: samplePatients[3]!.id,
      performedBy: vetUsers[2]!.id,
      witnessedBy: techUsers[0]!.id,
      lotNumber: "KET-2026-0405",
      notes: "Induction for spay procedure",
      performedAt: daysAgo(1),
    },
    {
      practiceId,
      drugName: "Morphine 15 mg/mL",
      deaSchedule: "II",
      action: "wasted",
      quantity: "0.200",
      unit: "mL",
      patientId: null,
      performedBy: vetUsers[0]!.id,
      witnessedBy: vetUsers[1]!.id,
      lotNumber: "MOR-2026-0112",
      notes: "Partial vial waste after dose preparation — witnessed disposal",
      performedAt: daysAgo(3),
    },
    {
      practiceId,
      drugName: "Gabapentin 100mg",
      deaSchedule: "V",
      action: "administered",
      quantity: "60.000",
      unit: "capsule",
      patientId: samplePatients[4]!.id,
      performedBy: vetUsers[1]!.id,
      witnessedBy: techUsers[1]!.id,
      lotNumber: "GAB-2026-0227",
      notes: "30-day supply for chronic pain management",
      performedAt: daysAgo(8),
    },
  ];

export const getTemplatesData = (practiceId: string): Array<TemplateRow & { items: Array<{ description: string; defaultQuantity: number; defaultUnitPrice: string }> }> => [
    {
      practiceId,
      name: "Wellness Exam — Adult Dog",
      description: "Standard annual wellness exam for adult canines. Includes physical exam, heartworm test, and fecal analysis.",
      category: "Wellness",
      isActive: true,
      items: [
        { description: "Physical examination (15 min)", defaultQuantity: 1, defaultUnitPrice: "65.00" },
        { description: "Heartworm antigen test", defaultQuantity: 1, defaultUnitPrice: "45.00" },
        { description: "Fecal flotation", defaultQuantity: 1, defaultUnitPrice: "35.00" },
      ],
    },
    {
      practiceId,
      name: "Puppy DHPP Booster Visit",
      description: "Routine puppy vaccine visit — DHPP booster with brief exam.",
      category: "Vaccination",
      isActive: true,
      items: [
        { description: "Brief exam (10 min)", defaultQuantity: 1, defaultUnitPrice: "45.00" },
        { description: "DHPP vaccine", defaultQuantity: 1, defaultUnitPrice: "32.00" },
      ],
    },
    {
      practiceId,
      name: "Dental Prophylaxis — Standard",
      description: "Routine dental cleaning under anesthesia. Includes pre-anesthetic bloodwork and scale/polish.",
      category: "Dental",
      isActive: true,
      items: [
        { description: "Pre-anesthetic bloodwork panel", defaultQuantity: 1, defaultUnitPrice: "95.00" },
        { description: "General anesthesia (first 30 min)", defaultQuantity: 1, defaultUnitPrice: "180.00" },
        { description: "Dental scale and polish", defaultQuantity: 1, defaultUnitPrice: "220.00" },
        { description: "IV fluid support", defaultQuantity: 1, defaultUnitPrice: "55.00" },
      ],
    },
    {
      practiceId,
      name: "Canine Spay — Under 40 lb",
      description: "Routine ovariohysterectomy for small/medium canines. Includes anesthesia, surgery, and 3-day pain meds.",
      category: "Surgery",
      isActive: true,
      items: [
        { description: "Pre-surgical exam & bloodwork", defaultQuantity: 1, defaultUnitPrice: "135.00" },
        { description: "Spay surgery — under 40 lb", defaultQuantity: 1, defaultUnitPrice: "385.00" },
        { description: "General anesthesia (60 min)", defaultQuantity: 1, defaultUnitPrice: "220.00" },
        { description: "Take-home pain medication (3 days)", defaultQuantity: 1, defaultUnitPrice: "28.00" },
        { description: "E-collar", defaultQuantity: 1, defaultUnitPrice: "18.00" },
      ],
    },
  ];

export const miscTranslations = {
  practice: {
    name: "Neighborhood Veterinary Hospital",
    address: "123 Main Street, Suite 100, Anytown, NJ 07001",
  },
  location: {
    name: "Main Clinic",
    address: "123 Main Street, Suite 100, Anytown, NJ 07001",
  },
  rooms: [
    "Exam Room 1",
    "Exam Room 2",
    "Exam Room 3"
  ],
  allergies: [
    { allergen: "Penicillin", reaction: "Hives, facial swelling" },
    { allergen: "Chicken protein", reaction: "GI distress, pruritus" },
    { allergen: "Bee stings", reaction: "Anaphylaxis" },
    { allergen: "Latex", reaction: "Contact dermatitis" }
  ],
  appointment: {
    notes: "Owner reports no major concerns"
  },
  procedure: {
    notesTemplate: (duration: number) => `Patient recovered well. Post-operative monitoring for ${duration} minutes. Discharged with standard care instructions.`
  },
  communication: {
    smsReminderTemplate: (firstName: string) => `Hi ${firstName}, Neighborhood Vet Hospital reminder for tomorrow's appointment. Reply C to confirm or R to reschedule.`
  }
};

export const wellnessPlansData = [
  {
    name: "Basic Wellness Plan",
    description: "Essential preventive care including annual exams, core vaccines, and routine screening.",
    price: "29.99",
    billingInterval: "monthly" as const,
  },
  {
    name: "Comprehensive Care Plan",
    description: "Complete wellness coverage with bi-annual exams, dental scaling, bloodwork, and unlimited copay-free visits.",
    price: "49.99",
    billingInterval: "monthly" as const,
  },
  {
    name: "Senior Pet Care Plan",
    description: "Specialized geriatric care including comprehensive blood panels, joint health monitoring, and bi-annual X-rays.",
    price: "69.99",
    billingInterval: "monthly" as const,
  },
];

export const consentFormsData = [
  {
    slug: "surgical-anesthesia",
    title: "Surgical & General Anesthesia Consent",
    body: "I hereby authorize the veterinarians and staff of Neighborhood Veterinary Hospital to perform the surgical procedure and administer general anesthesia as deemed necessary. I understand the inherent risks associated with anesthesia and surgical procedures.",
    sortOrder: 1,
  },
  {
    slug: "dental-procedure",
    title: "Dental Prophylaxis & Extraction Consent",
    body: "I authorize dental examination, scaling, polishing, and necessary tooth extractions under anesthesia. I agree to pre-anesthetic blood testing to evaluate organ function prior to sedation.",
    sortOrder: 2,
  },
  {
    slug: "high-risk-procedure",
    title: "High-Risk Procedure & Intensive Care Consent",
    body: "I acknowledge that my pet's condition carries elevated clinical risk. I authorize emergency medical intervention, intensive care monitoring, and necessary diagnostic procedures.",
    sortOrder: 3,
  },
];

export const fileTemplatesData = [
  { fileName: "Rabies_Vaccination_Certificate.pdf", mimeType: "application/pdf", fileSizeBytes: 245000, category: "certificate" },
  { fileName: "Chest_Radiograph_AP_Lateral.jpg", mimeType: "image/jpeg", fileSizeBytes: 2450000, category: "radiology" },
  { fileName: "Complete_Blood_Count_CBC_Report.pdf", mimeType: "application/pdf", fileSizeBytes: 512000, category: "lab" },
  { fileName: "Signed_Surgical_Consent_Form.pdf", mimeType: "application/pdf", fileSizeBytes: 180000, category: "consent" },
  { fileName: "Abdominal_Ultrasound_Scan.pdf", mimeType: "application/pdf", fileSizeBytes: 1200000, category: "radiology" },
  { fileName: "Vaccination_History_Record.pdf", mimeType: "application/pdf", fileSizeBytes: 320000, category: "certificate" },
  { fileName: "Dental_Radiograph_Full_Mouth.jpg", mimeType: "image/jpeg", fileSizeBytes: 1850000, category: "radiology" },
  { fileName: "Echocardiogram_Diagnostic_Summary.pdf", mimeType: "application/pdf", fileSizeBytes: 890000, category: "lab" },
  { fileName: "Fecal_Parasite_Screen_Results.pdf", mimeType: "application/pdf", fileSizeBytes: 150000, category: "lab" },
  { fileName: "Histopathology_Biopsy_Report.pdf", mimeType: "application/pdf", fileSizeBytes: 410000, category: "lab" },
];

export const problemListData = [
  { patientIdx: 0, description: "Canine Osteoarthritis (Bilateral Hips)", status: "chronic" as const, onsetDaysAgo: 365, resolvedDaysAgo: null },
  { patientIdx: 0, description: "Periodontal Disease Stage 2", status: "active" as const, onsetDaysAgo: 120, resolvedDaysAgo: null },
  { patientIdx: 1, description: "Chronic Kidney Disease Stage II (IRIS)", status: "chronic" as const, onsetDaysAgo: 240, resolvedDaysAgo: null },
  { patientIdx: 2, description: "Feline Lower Urinary Tract Disease (FLUTD)", status: "resolved" as const, onsetDaysAgo: 180, resolvedDaysAgo: 30 },
  { patientIdx: 3, description: "Atopic Dermatitis (Environmental Allergen)", status: "active" as const, onsetDaysAgo: 90, resolvedDaysAgo: null },
  { patientIdx: 4, description: "Hypothyroidism", status: "chronic" as const, onsetDaysAgo: 300, resolvedDaysAgo: null },
  { patientIdx: 5, description: "Feline Hyperthyroidism", status: "active" as const, onsetDaysAgo: 60, resolvedDaysAgo: null },
];

export const allergyPoolData = [
  { allergen: "Penicillin / Amoxicillin", reaction: "Urticaria, facial edema, acute respiratory distress", severity: "severe" as const },
  { allergen: "Chicken Protein", reaction: "Pruritus, erythematous skin, chronic diarrhea", severity: "moderate" as const },
  { allergen: "Beef Protein", reaction: "Cutaneous flare-ups, recurrent otitis externa", severity: "moderate" as const },
  { allergen: "Flea Saliva (FAD)", reaction: "Severe lumbosacral alopecia, intense pruritus", severity: "severe" as const },
  { allergen: "Environmental Pollen", reaction: "Seasonal sneezing, pododermatitis, watery eyes", severity: "mild" as const },
  { allergen: "Vaccine Adjuvant", reaction: "Post-vaccinal lethargy, localized injection swelling", severity: "mild" as const },
  { allergen: "Neomycin Topical", reaction: "Localized contact hypersensitivity, erythema", severity: "moderate" as const },
  { allergen: "Dairy / Lactose", reaction: "Acute emesis, abdominal cramping, loose stool", severity: "mild" as const },
  { allergen: "Storage Mites (Tyrophagus)", reaction: "Generalized papular dermatitis", severity: "moderate" as const },
  { allergen: "Suture Material (Chromic Gut)", reaction: "Delayed tissue reaction, sterile abscess formation", severity: "severe" as const },
];

export const treatmentPlansData = [
  {
    title: "Dental Prophylaxis Plan",
    description: "Multi-step dental prophylaxis including scaling, polishing, and post-procedure recovery monitoring.",
    status: "active" as const,
    templateIdx: 1,
    items: [
      { description: "Pre-anesthetic bloodwork panel", instructions: "Evaluate hepatic and renal function prior to sedation.", status: "done" as const },
      { description: "General anesthesia (first 30 min)", instructions: "Monitor heart rate, SpO2, and blood pressure continuously.", status: "done" as const },
      { description: "Dental scale and polish", instructions: "Perform supragingival and subgingival scaling.", status: "in_progress" as const },
      { description: "Post-op pain management & discharge", instructions: "Administer analgesics as directed.", status: "pending" as const },
    ],
  },
  {
    title: "Canine Spay Recovery Plan",
    description: "Surgical recovery and post-operative monitoring plan for routine spay.",
    status: "active" as const,
    templateIdx: 2,
    items: [
      { description: "Pre-surgical exam & bloodwork", instructions: "Verify clear vitals and blood panel results.", status: "done" as const },
      { description: "Spay surgery — under 40 lb", instructions: "Perform routine ovariohysterectomy.", status: "done" as const },
      { description: "Take-home pain medication (3 days)", instructions: "Dispense Meloxicam oral suspension.", status: "done" as const },
      { description: "E-collar fitting & discharge instructions", instructions: "Ensure strict rest for 10-14 days.", status: "in_progress" as const },
      { description: "Suture line re-check appointment", instructions: "Evaluate surgical site healing at 10-14 days post-op.", status: "pending" as const },
    ],
  },
  {
    title: "Senior Wellness & Joint Management Plan",
    description: "Comprehensive management plan for senior canine osteoarthritis and mobility support.",
    status: "active" as const,
    templateIdx: 0,
    items: [
      { description: "Senior blood panel & urinalysis", instructions: "Screen for renal, hepatic, and metabolic abnormalities.", status: "done" as const },
      { description: "Joint supplement & NSAID regimen", instructions: "Initiate joint supplement therapy and daily anti-inflammatory medication.", status: "in_progress" as const },
      { description: "Orthopedic re-evaluation (6-month)", instructions: "Evaluate gait, joint pain scores, and mobility improvements.", status: "pending" as const },
    ],
  },
];



// ---------------------------------------------------------------------------
// Phase 2 — locale seed data (English). Translations of the Slovak data in
// data/sk/index.ts; practiceId/authorId are appended by each seed mutation at
// the call site. Keep in sync with data/sk/index.ts.
// ---------------------------------------------------------------------------

export const marketingTemplatesData = [
  {
    name: "Spring Prevention: Ticks & Parasites",
    category: "Preventive Care & Wellness",
    description: "Seasonal reminder for tick and parasite protection.",
    platforms: ["IG", "FB", "GBP"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton:
      "Create an educational post about protection against ticks and external parasites. Clinic: {{clinicName}}. Tone: professional, empathetic, Fear-Free. No diagnostics, prevention only.",
    exampleCaption:
      "🌿 Spring is here — and with it tick season! Protect your pet before the first walk in nature. Ask us about current antiparasitics. #FearFree #Prevention",
  },
  {
    name: "Fear-Free: Why Visit Us Stress-Free",
    category: "Practice & Team",
    description: "Showcasing the clinic's Fear-Free approach.",
    platforms: ["IG", "FB"],
    aspectRatios: ["1:1", "4:5", "16:9"],
    mediaType: "image",
    promptSkeleton:
      "Write a post explaining the Fear-Free philosophy of {{clinicName}}. Emphasize the calming environment, pheromone use, slow movements, and rewards. Tone: warm, trustworthy.",
    exampleCaption:
      "💚 We know a vet visit can be stressful for your pet. That's why we have separate waiting areas, soothing music, and Adaptil/Feliway diffusers. Your four-legged friend deserves calm care. #FearFree",
  },
  {
    name: "Wellness Plan: An Investment in Health",
    category: "Promotions & Announcements",
    description: "Promoting monthly wellness plans (subscription model).",
    platforms: ["IG", "FB", "GBP"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton:
      "Write a post promoting the {{clinicName}} wellness plan. Includes: preventive exams, vaccinations, dental check-ups. Monthly fee. Tone: value for money, modern.",
    exampleCaption:
      "🐾 Wellness Plan — care with no surprises! Regular exams, vaccinations, and dental hygiene for a fixed monthly fee. Ask us for details. Your pet's health is our priority. #WellnessPlan",
  },
  {
    name: "Meet the Clinic Team",
    category: "Practice & Team",
    description: "Introducing the veterinary team — brand personalization.",
    platforms: ["IG", "FB"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton:
      "Write a post introducing the veterinary team of {{clinicName}}. Veterinarian's name: {{vetName}}. Tone: warm, personal, trustworthy. Emphasize passion for animals.",
    exampleCaption:
      "👨‍⚕️ Let us introduce ourselves! We're the team that cares for your four-legged families every day with love and expertise. We'd love to welcome you! #OurTeam #VeterinaryClinic",
  },
  {
    name: "5-Star Review: Thank You",
    category: "Client & Patient Engagement",
    description: "Sharing a positive review with thanks to the client.",
    platforms: ["IG", "FB", "GBP"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton:
      "Based on this client review: {{reviewText}} — write a warm post thanking them. Clinic: {{clinicName}}. Do not use the patient's name without consent. Tone: grateful, community-focused.",
    exampleCaption:
      "💛 Words like these fill us with joy! Thank you for your trust — it's for you and your pets that we're here every day. #Review #Trust",
  },
  {
    name: "Seasonal Tip: Summer Safety",
    category: "Educational",
    description: "Educational tip on protecting pets during summer months.",
    platforms: ["IG", "FB", "GBP"],
    aspectRatios: ["1:1", "4:5"],
    mediaType: "image",
    promptSkeleton:
      "Write an educational post about summer pet safety for {{clinicName}}: overheating in cars, hydration, paw burns on hot asphalt. NO diagnostics. Tone: caring.",
    exampleCaption:
      "☀️ Hot days are here! Remember: never leave a pet in a parked car. Regular hydration and shady spots are essential. Heading out together? Don't forget water! #SummerSafety",
  },
];

export const crmAutomationsData = [
  {
    name: "Post-Discharge Follow-up (24h)",
    triggerType: "APPOINTMENT_DISCHARGE",
    conditions: { delayDays: 1 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a friendly SMS to the client after a veterinary visit. Ask how the pet is feeling and offer help. Maximum 160 characters. Fear-Free tone. English language.",
    },
    isActive: true,
  },
  {
    name: "Google Review Request (3 days post-visit)",
    triggerType: "REVIEW_REQUEST",
    conditions: { delayDays: 3 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a short SMS asking the client to leave a Google review after a satisfactory veterinary visit. Max 160 characters. English language.",
    },
    isActive: true,
  },
  {
    name: "Annual Preventive Exam",
    triggerType: "ANNUAL_REMINDER",
    conditions: { delayDays: 365 },
    actionType: "email",
    actionPayload: {
      templatePrompt:
        "Write an email reminding the client of their pet's annual preventive exam. Warm, Fear-Free tone. English language.",
    },
    isActive: false,
  },
  {
    name: "Patient Birthday",
    triggerType: "BIRTHDAY",
    conditions: { delayDays: 0 },
    actionType: "sms",
    actionPayload: {
      templatePrompt:
        "Write a happy birthday SMS for the client's pet from the veterinary clinic. Fun, Fear-Free. Max 160 characters. English language.",
    },
    isActive: true,
  },
];

export const canvasMasterDocumentsData = [
  {
    title: "Master Strategic Plan v8.0",
    docType: "STRATEGY",
    status: "published",
    tags: ["Strategy", "Growth", "Marketing"],
    isRagSource: true,
    content: `<h1>Strategy Development and Operational Modernization of the Clinic v8.0</h1>
<h2>1. Executive Summary</h2>
<p>A comprehensive, data-driven strategic plan for the digital transformation of a private veterinary clinic. The goal is to build a strong local brand, introduce Fear-Free standards, and implement a subscription model (Wellness Plans).</p>
<h2>2. Pillars of Growth</h2>
<ul>
  <li>Local digital dominance and Google Business Profile optimization</li>
  <li>Social media and the veterinarian's personal brand (Instagram, Facebook)</li>
  <li>Wellness Plans — subscription (subscription) care model</li>
  <li>Fear-Free approach — certification and differentiation from competitors</li>
  <li>OpenVPM — end-to-end digital clinic management</li>
</ul>
<h2>3. Transformation Roadmap (Gate 1 → Gate 4)</h2>
<ul>
  <li><strong>Gate 1 (Month 1):</strong> GBP & Web Ready — optimized Google Business, new website, photo gallery</li>
  <li><strong>Gate 2 (Month 3):</strong> AI Scribe Proven — OpenVPM SOAP notes, automated SMS, first Reels</li>
  <li><strong>Gate 3 (Month 6):</strong> Wellness Adoption &gt; 3% — at least 3% of clients on a Wellness Plan</li>
  <li><strong>Gate 4 (Month 12):</strong> Full OpenVPM Migration — complete transition to digital clinic management</li>
</ul>
<h2>4. Client Acquisition to Retention Flow</h2>
<pre class="mermaid">
graph TD
    A[Social Media / Local SEO] --> B[Call / Online Booking]
    B --> C[Fear-Free In-Clinic Visit]
    C --> D[Discharge Ask — request a Google review]
    D --> E[Wellness Plan Offer]
    E --> F[Loyal Long-Term Client]
    F --> A
</pre>
<h2>5. KPI Dashboard (12-month targets)</h2>
<ul>
  <li>Google reviews: +50 new, average rating &gt; 4.8★</li>
  <li>Instagram followers: +500 organically</li>
  <li>Wellness Plan enrollment: &gt; 3% of active patients</li>
  <li>Average visit value: +15% YoY</li>
</ul>`,
  },
  {
    title: "Clinical SOP: Sensory Fear-Free Protocol",
    docType: "SOP",
    status: "published",
    tags: ["Fear-Free", "SOP", "Staff"],
    isRagSource: false,
    content: `<h1>Clinical SOP: Sensory Fear-Free Protocol</h1>
<p><strong>Version:</strong> 2.0 | <strong>Applies to:</strong> All clinic staff</p>
<p>Basic rules for minimizing animal stress in the veterinary clinic environment. The Fear-Free approach is the clinic's differentiating factor — it must be visible to every client.</p>
<h2>Morning reception duties (before opening)</h2>
<ul class="contains-task-list">
  <li class="task-list-item">[ ] Turn on <strong>Adaptil</strong> (for dogs) and <strong>Feliway</strong> (for cats) diffusers in the waiting room and exam rooms — at least 30 minutes before opening.</li>
  <li class="task-list-item">[ ] Set up soothing music in the waiting room — classical music or special Pet Acoustics playlists. <strong>No commercial radio.</strong></li>
  <li class="task-list-item">[ ] Prepare <strong>elevated shelving</strong> for cat carriers — cats must not be on the floor at dog level.</li>
  <li class="task-list-item">[ ] Visual barriers between the dog area and the cat zone in the waiting room (e.g., a partition, cardboard).</li>
  <li class="task-list-item">[ ] Have <strong>non-slip mats</strong> ready on all exam tables.</li>
  <li class="task-list-item">[ ] LickiMat pads with peanut butter or paste ready for blood draws and vaccinations.</li>
</ul>
<h2>Principles of Low-Stress Handling</h2>
<ul>
  <li><strong>Slow movements:</strong> No sudden gestures or loud sounds. Always approach the animal from the side, not head-on.</li>
  <li><strong>Rewards during procedures:</strong> Peanut butter, lickable treats, snacks — positive association with the clinic.</li>
  <li><strong>Minimal restraint:</strong> Never restrain an animal forcefully. If the animal is too stressed, postpone the procedure.</li>
  <li><strong>Warm lighting:</strong> Replace cold LED lights in the exam room with warmer ones (3000K). Optionally dim lights during feline exams.</li>
  <li><strong>Cats from carriers:</strong> Never pull a cat out by force — offer a treat and wait for it to come out on its own, or disassemble the carrier.</li>
</ul>
<h2>Client Communication</h2>
<p>Staff always explains to the client what will happen and why — transparency builds trust. Avoid phrases like <em>"Don't worry"</em> (negating fear is ineffective) — instead: <em>"We'll do everything to keep your pet as comfortable as possible."</em></p>`,
  },
  {
    title: "Communication & Crisis Manual: Google Reviews",
    docType: "MANUAL",
    status: "published",
    tags: ["Reputation", "Google", "Crisis communication", "RAG"],
    isRagSource: true,
    content: `<h1>Communication & Crisis Manual: Google Reviews</h1>
<p>Principles for responding to online feedback and managing crisis situations. <strong>This document is a RAG context source for the AI assistant when drafting responses.</strong></p>
<h2>Basic Rules</h2>
<ul>
  <li>Respond to every review within <strong>48 hours</strong>.</li>
  <li>Never be aggressive, defensive, or sarcastic.</li>
  <li>Do not use the patient's name or diagnosis in the response (GDPR).</li>
  <li>Every response is signed with the veterinarian's name or "Clinic Team".</li>
</ul>
<h2>Response Matrix by Review Type</h2>
<table border="1" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background: #f0f0f0;">
      <th style="padding: 10px; text-align: left;">Review Type</th>
      <th style="padding: 10px; text-align: left;">Response Tone</th>
      <th style="padding: 10px; text-align: left;">Example Response (EN)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px;">Complaint about high price (1–2★)</td>
      <td style="padding: 10px;">Professional, firm, transparent, no apology for quality</td>
      <td style="padding: 10px;"><em>"Hello, we're sorry to hear you were dissatisfied. Veterinary medicine, when done safely and correctly, requires top-tier equipment, certified medications, and ongoing education. We'd be happy to review the details of your invoice with you anytime, but lowering the quality of patient care just to make the bill smaller is something we will never do at our clinic. — Clinic Team"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">Complaint about wait time</td>
      <td style="padding: 10px;">Empathetic, explanation, offer of a solution</td>
      <td style="padding: 10px;"><em>"Hello, we apologize for the wait. Every patient deserves our full attention, which sometimes causes delays. We're working on introducing online booking to minimize your wait. Thank you for your patience. — Clinic Team"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">Patient death (even with 5★)</td>
      <td style="padding: 10px;">Extreme empathy, compassion, no defensiveness, brief</td>
      <td style="padding: 10px;"><em>"Dear family, the loss has affected us too. You were wonderful owners who did everything possible for your pet until the very end. It was an honor to care for them in their most difficult moments. We stand with you in grief. — Dr. Sykora"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">5★ praise</td>
      <td style="padding: 10px;">Gratitude, personal, community-oriented, invitation to return</td>
      <td style="padding: 10px;"><em>"Thank you so much for your kind words and trust! Feedback like this fills us with joy and motivates us every day to do our work with love. We look forward to your next visit! 🐾 — Clinic Team"</em></td>
    </tr>
    <tr>
      <td style="padding: 10px;">Fake / malicious negative review</td>
      <td style="padding: 10px;">Calm, factual, unemotional, report to Google</td>
      <td style="padding: 10px;"><em>"Hello, we find no visit in our system associated with your name. If you have a specific concern, please contact us directly at [email]. We have reported this review to Google for verification. — Clinic Team"</em></td>
    </tr>
  </tbody>
</table>`,
  },
  {
    title: "SOP: Educational TV Management & Export",
    docType: "SOP",
    status: "published",
    tags: ["TV", "Marketing", "Technology", "SOP"],
    isRagSource: false,
    content: `<h1>SOP: Educational TV Management & Export for the Waiting Room</h1>
<p><strong>Responsibility:</strong> Reception | <strong>Update frequency:</strong> Monthly</p>
<h2>Technical Setup</h2>
<ul>
  <li><strong>Hardware:</strong> TV with a free HDMI input + Android TV Stick (Chromecast with Google TV, Raspberry Pi 4, or Xiaomi Mi TV Stick 4K).</li>
  <li><strong>Software:</strong> <a href="https://yodeck.com" target="_blank">Yodeck</a> (recommended) or Screenly for managing digital content on the TV. Alternative: a simple video player looping via USB stick.</li>
  <li><strong>Content:</strong> Created in Canva (1920×1080px / 16:9 templates) or directly in the <strong>Marketing & Growth</strong> module in OpenVPM.</li>
</ul>
<h2>Export Process from the Marketing Planner (OpenVPM)</h2>
<ol>
  <li>Open the <strong>Marketing Studio</strong> module in OpenVPM.</li>
  <li>Go to the <em>Templates</em> section and filter by the <strong>"TV Slides (16:9)"</strong> category.</li>
  <li>Select the current seasonal slide and edit the text. <br><strong>Rule:</strong> Maximum <strong>15 words</strong> per slide. Text must be readable from 3 meters (min. size 60pt).</li>
  <li>Click <em>Export</em> → choose the format <strong>MP4 (1080p, 10s loop)</strong> or <strong>PNG (image set)</strong>.</li>
  <li>Upload the file directly to the <a href="https://app.yodeck.com" target="_blank">Yodeck admin</a> or to the shared Google Drive TV folder.</li>
</ol>
<h2>Seasonal Content Calendar</h2>
<ul>
  <li><strong>January–February:</strong> Dental hygiene (Pet Dental Health Month), winter care</li>
  <li><strong>March–May:</strong> Tick and parasite protection, spring</li>
  <li><strong>June–August:</strong> Summer safety, overheating, hydration</li>
  <li><strong>September–November:</strong> Fall prevention, winter preparation</li>
  <li><strong>December:</strong> Stress and fireworks, lost pets, Christmas and chocolate (toxicity)</li>
</ul>`,
  },
  {
    title: "Client Personas (Slovak & Hungarian demographics)",
    docType: "STRATEGY",
    status: "published",
    tags: ["Marketing", "Personas", "AI context", "RAG"],
    isRagSource: true,
    content: `<h1>Client Personas (Southern Region — Rimavská Sobota and surroundings)</h1>
<p>A detailed breakdown of target groups for precise targeting of the AI generator's communication tone and marketing campaigns. These personas serve as <strong>RAG context for the AI</strong> when generating content.</p>
<h2>Persona 1: Local Senior — "János / Mária"</h2>
<ul>
  <li><strong>Age:</strong> 60+ years</li>
  <li><strong>Language:</strong> Predominantly Hungarian-speaking residents of the region</li>
  <li><strong>Behavior:</strong> Extremely price-sensitive segment, yet immensely loyal once trust is earned. Requires a high degree of personal trust and the direct authority of the doctor. Does not recognize digital communication as primary.</li>
  <li><strong>Motivators:</strong> Trust in the doctor personally, recommendations from neighbors/friends, stability and tradition</li>
  <li><strong>Communication:</strong> Prefers in-person contact, phone calls, and paper flyers in the waiting room. <strong>Key: bilingual (SK/HU) communication</strong> at reception and on basic materials. Responds to a conservative, respectful, and patient tone.</li>
  <li><strong>Barriers:</strong> Price, distrust of new procedures, language barrier (Slovak)</li>
</ul>
<h2>Persona 2: Young Family / Millennial — "Tomáš & Lucia"</h2>
<ul>
  <li><strong>Age:</strong> 25–40 years</li>
  <li><strong>Language:</strong> Slovak-speaking or bilingual (SK/HU)</li>
  <li><strong>Behavior:</strong> View their dog or cat as a full "furry" family member. Willing to invest above-standard resources in prevention, diagnostics, and premium services. Value transparency and a digital approach.</li>
  <li><strong>Motivators:</strong> Animal welfare, Fear-Free approach, modern clinic, online convenience, prevention over treatment</li>
  <li><strong>Communication:</strong> Digital-first — online booking, SMS reminders, engaging Instagram (Reels, Stories), educational content, Google reviews. Primary target group for <strong>Wellness Plans</strong>.</li>
  <li><strong>Barriers:</strong> Distance (prefer a clinic in the city), price without perceived value</li>
</ul>
<h2>Language Guidelines for the AI Generator</h2>
<ul>
  <li><strong>Persona 1 (HU):</strong> Formal, respectful tone. Avoid slang. Shorter sentences. Address as "Önök" (You, formal). Use examples from traditional life.</li>
  <li><strong>Persona 2 (SK):</strong> Modern, warm tone. Can be emotional. Emojis are appropriate on social media. Informal "ty" address in casual contexts.</li>
</ul>`,
  },
];
