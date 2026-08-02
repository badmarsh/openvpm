import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'packages', 'db', 'data', 'sk', 'index.ts');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // apptTypesData
  ['name: "Wellness Exam"', 'name: "Preventívna prehliadka"'],
  ['name: "Sick Visit"', 'name: "Vyšetrenie chorého zvieraťa"'],
  ['name: "Vaccination"', 'name: "Vakcinácia"'],
  ['name: "Surgery"', 'name: "Chirurgický zákrok"'],
  ['name: "Dental"', 'name: "Zubné ošetrenie"'],
  ['name: "Follow-up"', 'name: "Kontrola"'],

  // servicesData
  ['name: "Wellness Examination"', 'name: "Preventívna prehliadka"'],
  ['name: "Sick Visit Examination"', 'name: "Vyšetrenie chorého zvieraťa"'],
  ['name: "Surgery Consultation"', 'name: "Chirurgická konzultácia"'],
  ['name: "Dental Prophylaxis"', 'name: "Zubná profylaxia"'],
  ['name: "Tooth Extraction (simple)"', 'name: "Extrakcia zuba (jednoduchá)"'],
  ['name: "Spay (under 50 lbs)"', 'name: "Kastrácia samice (do 22 kg)"'],
  ['name: "Neuter (under 50 lbs)"', 'name: "Kastrácia samca (do 22 kg)"'],
  ['name: "Mass Removal"', 'name: "Odstránenie nádoru"'],
  ['name: "Radiograph (2 views)"', 'name: "Röntgen (2 projekcie)"'],
  ['name: "CBC/Chemistry Panel"', 'name: "Krvný obraz/Biochémia"'],
  ['name: "Urinalysis"', 'name: "Rozbor moču"'],
  ['name: "Fecal Float"', 'name: "Koprologické vyšetrenie"'],
  ['name: "DHPP Vaccine"', 'name: "Vakcína DHPP"'],
  ['name: "Rabies Vaccine"', 'name: "Vakcína proti besnote"'],
  ['name: "Bordetella Vaccine"', 'name: "Vakcína proti kotercovému kašľu"'],
  ['name: "FVRCP Vaccine"', 'name: "Vakcína FVRCP"'],
  ['name: "FeLV Vaccine"', 'name: "Vakcína FeLV"'],
  ['name: "Nail Trim"', 'name: "Strihanie pazúrov"'],
  ['name: "Anal Gland Expression"', 'name: "Vytlačenie análnych žliaz"'],
  ['name: "Microchip Implantation"', 'name: "Čipovanie"'],

  // proceduresData
  ['description: "Full dental cleaning with scaling and polishing under general anesthesia"', 'description: "Kompletné čistenie zubov s odstránením zubného kameňa a leštením v celkovej anestézii"'],
  ['anesthesiaUsed: "Isoflurane + Propofol induction"', 'anesthesiaUsed: "Izoflurán + úvod propofolom"'],
  ['description: "Surgical excision of subcutaneous mass on right flank, submitted for histopathology"', 'description: "Chirurgické odstránenie podkožného útvaru na pravom boku, odoslané na histopatológiu"'],
  ['anesthesiaUsed: "Isoflurane + local lidocaine block"', 'anesthesiaUsed: "Izoflurán + lokálny blok lidokaínom"'],
  ['name: "Laceration Repair"', 'name: "Ošetrenie tržnej rany"'],
  ['description: "Wound debridement and primary closure of 4cm laceration on left forelimb"', 'description: "Toaleta rany a primárne uzavretie 4 cm tržnej rany na ľavej hrudnej končatine"'],
  ['anesthesiaUsed: "Sedation (Dexdomitor) + local lidocaine"', 'anesthesiaUsed: "Sedácia (Dexdomitor) + lokálny lidokaín"'],
  ['name: "Foreign Body Removal"', 'name: "Odstránenie cudzieho telesa"'],
  ['description: "Endoscopic retrieval of sock fragment from stomach"', 'description: "Endoskopické odstránenie kusu ponožky zo žalúdka"'],
  ['anesthesiaUsed: "Isoflurane general anesthesia"', 'anesthesiaUsed: "Celková izofluránová anestézia"'],
  ['name: "Spay (Ovariohysterectomy)"', 'name: "Kastrácia (Ovariohysterektómia)"'],
  ['description: "Routine ovariohysterectomy via ventral midline approach"', 'description: "Rutinná ovariohysterektómia z prístupu v strednej línii"'],
  ['anesthesiaUsed: "Isoflurane + Propofol induction + Meloxicam"', 'anesthesiaUsed: "Izoflurán + úvod propofolom + meloxikam"'],
  ['name: "Neuter (Orchiectomy)"', 'name: "Kastrácia (Orchiektómia)"'],
  ['description: "Routine castration, pre-scrotal approach, closed technique"', 'description: "Rutinná kastrácia, preskrotálny prístup, uzavretá technika"'],
  ['name: "Cystotomy"', 'name: "Cystotómia"'],
  ['description: "Surgical removal of bladder stones via ventral cystotomy"', 'description: "Chirurgické odstránenie močových kameňov pomocou ventrálnej cystotómie"'],
  ['anesthesiaUsed: "Isoflurane general anesthesia + epidural"', 'anesthesiaUsed: "Celková izofluránová anestézia + epidurál"'],

  // categories
  ['category: "Exam"', 'category: "Vyšetrenie"'],
  ['category: "Dental"', 'category: "Zubné"'],
  ['category: "Surgery"', 'category: "Chirurgia"'],
  ['category: "Diagnostic"', 'category: "Diagnostika"'],
  ['category: "Lab"', 'category: "Laboratórium"'],
  ['category: "Vaccine"', 'category: "Vakcíny"'],
  ['category: "Grooming"', 'category: "Úprava srsti"'],
  ['category: "Misc"', 'category: "Rôzne"'],
  ['category: "Medication"', 'category: "Lieky"'],
  ['category: "Preventive"', 'category: "Prevencia"'],
  ['category: "Supplement"', 'category: "Doplnky"'],
  ['category: "Food"', 'category: "Krmivo"'],
  ['category: "Supply"', 'category: "Zdravotnícky materiál"'],
  ['category: "Wellness"', 'category: "Prevencia"'],
  ['category: "Vaccination"', 'category: "Vakcinácia"'],

  // Products
  ['name: "Elizabethan Collar (Medium)"', 'name: "Ochranný golier (Stredný)"'],
  ['name: "Elizabethan Collar (Large)"', 'name: "Ochranný golier (Veľký)"'],
  ['name: "Pill Pockets - Chicken (30ct)"', 'name: "Pamlsky na tabletky - Kuracie (30ks)"'],
  ['name: "Pill Pockets - Peanut Butter (30ct)"', 'name: "Pamlsky na tabletky - Arašidové maslo (30ks)"'],
  ['name: "Gentle Leader Headcollar (Medium)"', 'name: "Ohlávka Gentle Leader (Stredná)"'],
  ['name: "Microchip (HomeAgain)"', 'name: "Mikročip (HomeAgain)"'],
  ['name: "Vetrap Bandage (4 in x 5 yd)"', 'name: "Bandáž Vetrap (10 cm x 4.5 m)"'],
  ['name: "Adhesive Bandage Roll"', 'name: "Lepiaca páska"'],
  ['name: "Ear Cleaner (8 oz)"', 'name: "Čistič uší (236 ml)"'],
  ['name: "Chlorhexidine Flush (8 oz)"', 'name: "Chlórhexidínový roztok (236 ml)"'],
  ['name: "Dental Chews (Large, 30ct)"', 'name: "Zubné tyčinky (Veľké, 30ks)"'],
  ['name: "Syringes 3mL (100ct)"', 'name: "Striekačky 3ml (100ks)"'],
  ['name: "IV Catheter 20ga (50ct)"', 'name: "Vnútrožilový katéter 20G (50ks)"'],
  ['name: "Surgical Gloves (Medium, 100ct)"', 'name: "Chirurgické rukavice (Stredné, 100ks)"'],
  ['name: "KY Jelly Lubricant (4 oz)"', 'name: "Lubrikačný gél (113g)"'],
  ['name: "Fecal Sample Container (50ct)"', 'name: "Nádobka na trus (50ks)"'],
  ['name: "Pet Nail Clipper (Professional)"', 'name: "Kliešte na pazúry (Profesionálne)"'],

  // Emails and Portal
  ['subject: "Annual wellness exam due for your pet"', 'subject: "Termín každoročnej preventívnej prehliadky vášho zvieratka"'],
  ['content: "It\'s time for your yearly wellness visit. Reply to this email or call the clinic to schedule."', 'content: "Je čas na každoročnú preventívnu prehliadku. Odpovedzte na tento e-mail alebo zavolajte na kliniku pre dohodnutie termínu."'],
  ['subject: "Vaccination booster reminder"', 'subject: "Pripomienka preočkovania"'],
  ['content: "Your pet is due for a DHPP booster this month. We have openings on Tuesday and Thursday afternoons."', 'content: "Vaše zvieratko by malo byť tento mesiac preočkované vakcínou DHPP. Máme voľné termíny v utorok a štvrtok poobede."'],
  ['subject: "Re: Prescription refill for Rimadyl"', 'subject: "Re: Doplnenie receptu na Rimadyl"'],
  ['content: "Thanks for the refill request. We\'ve approved a 30-day refill — pick up anytime this week during office hours."', 'content: "Ďakujeme za žiadosť o recept. Schválili sme dávku na 30 dní — môžete si ju vyzdvihnúť kedykoľvek tento týždeň počas ordinačných hodín."'],
  ['subject: "Invoice copy — recent visit"', 'subject: "Kópia faktúry — nedávna návšteva"'],
  ['content: "Attached is the itemized invoice for your recent visit. Let us know if you have any questions."', 'content: "V prílohe nájdete podrobnú faktúru z vašej nedávnej návštevy. Dajte nám vedieť, ak máte nejaké otázky."'],

  ['subject: "Question about Luna\'s medication"', 'subject: "Otázka k liekom pre Lunu"'],
  ['content: "Is it okay to give Luna her Rimadyl with food? She seems to have an upset stomach after taking it on an empty stomach."', 'content: "Môžem dať Lune Rimadyl s jedlom? Zdá sa, že má po ňom na lačno podráždený žalúdok."'],
  ['subject: "Rescheduling Tuesday appointment"', 'subject: "Zmena utorkového termínu"'],
  ['content: "Hi — my work schedule changed. Can we move Tuesday\'s appointment to later in the week?"', 'content: "Dobrý deň — zmenil sa mi pracovný rozvrh. Mohli by sme utorkový termín presunúť na neskôr v týždni?"'],
  ['subject: "Vaccination records needed for boarding"', 'subject: "Záznamy o očkovaní pre hotel pre psov"'],
  ['content: "We\'re boarding Max next weekend. Can you send his vaccination records to the kennel?"', 'content: "Cez víkend dávame Maxa do psieho hotela. Mohli by ste im poslať jeho očkovací preukaz?"'],

  // Calls
  ['content: "Client called about limping on left hind leg, started this morning. Advised to bring in today — booked 3pm slot."', 'content: "Klient volal ohľadom krívania na ľavú zadnú nohu, ktoré začalo dnes ráno. Odporučené prísť dnes — objednané na 15:00."'],
  ['content: "Called to confirm surgery consent for tomorrow\'s dental. Client confirmed drop-off at 7:30am, fasting since 10pm."', 'content: "Volané pre potvrdenie súhlasu so zajtrajším zubným zákrokom. Klient potvrdil príchod o 7:30, hladovka od 22:00."'],
  ['content: "Post-op check-in call — patient eating normally, sutures look clean. Recheck scheduled in 10 days."', 'content: "Pooperačná kontrola po telefóne — pacient žerie normálne, stehy sú čisté. Kontrola naplánovaná o 10 dní."'],

  // Templates
  ['name: "Wellness Exam — Adult Dog"', 'name: "Preventívna prehliadka — Dospelý pes"'],
  ['description: "Standard annual wellness exam for adult canines. Includes physical exam, heartworm test, and fecal analysis."', 'description: "Štandardná každoročná preventívna prehliadka pre dospelých psov. Zahrňuje fyzikálne vyšetrenie, test na srdcové červy a koprológiu."'],
  ['description: "Physical examination (15 min)"', 'description: "Fyzikálne vyšetrenie (15 min)"'],
  ['description: "Heartworm antigen test"', 'description: "Antigénny test na srdcové červy"'],
  ['description: "Fecal flotation"', 'description: "Koprologické vyšetrenie (flotácia)"'],

  ['name: "Puppy DHPP Booster Visit"', 'name: "Šteňa - Preočkovanie DHPP"'],
  ['description: "Routine puppy vaccine visit — DHPP booster with brief exam."', 'description: "Rutinná návšteva pre šteňatá — preočkovanie DHPP s krátkym vyšetrením."'],
  ['description: "Brief exam (10 min)"', 'description: "Krátke vyšetrenie (10 min)"'],

  ['name: "Dental Prophylaxis — Standard"', 'name: "Zubná profylaxia — Štandard"'],
  ['description: "Routine dental cleaning under anesthesia. Includes pre-anesthetic bloodwork and scale/polish."', 'description: "Rutinné čistenie zubov v anestézii. Zahrňuje predoperačné vyšetrenie krvi, odstránenie zubného kameňa a leštenie."'],
  ['description: "Pre-anesthetic bloodwork panel"', 'description: "Predoperačný krvný panel"'],
  ['description: "General anesthesia (first 30 min)"', 'description: "Celková anestézia (prvých 30 min)"'],
  ['description: "Dental scale and polish"', 'description: "Odstránenie zubného kameňa a leštenie"'],
  ['description: "IV fluid support"', 'description: "Intravenózna tekutinová terapia"'],

  ['name: "Canine Spay — Under 40 lb"', 'name: "Kastrácia fenky — Do 18 kg"'],
  ['description: "Routine ovariohysterectomy for small/medium canines. Includes anesthesia, surgery, and 3-day pain meds."', 'description: "Rutinná ovariohysterektómia pre malé/stredné fenky. Zahrňuje anestéziu, chirurgický zákrok a lieky od bolesti na 3 dni."'],
  ['description: "Pre-surgical exam & bloodwork"', 'description: "Predoperačné vyšetrenie a krvný obraz"'],
  ['description: "Spay surgery — under 40 lb"', 'description: "Kastrácia fenky — do 18 kg"'],
  ['description: "General anesthesia (60 min)"', 'description: "Celková anestézia (60 min)"'],
  ['description: "Take-home pain medication (3 days)"', 'description: "Lieky od bolesti domov (na 3 dni)"'],
  ['description: "E-collar"', 'description: "Ochranný golier"'],
  
  // getCsEntries
  ['notes: "Post-op pain management, dental extraction"', 'notes: "Pooperačná kontrola bolesti, extrakcia zuba"'],
  ['notes: "Pre-surgical analgesia"', 'notes: "Predoperačná analgézia"'],
  ['notes: "30-day supply dispensed for seizure control"', 'notes: "Vydané balenie na 30 dní na kontrolu záchvatov"'],
  ['notes: "Induction for spay procedure"', 'notes: "Úvod do anestézie pre kastráciu"'],
  ['notes: "Partial vial waste after dose preparation — witnessed disposal"', 'notes: "Likvidácia zvyšku z ampulky po príprave dávky — znehodnotené so svedkom"'],
  ['notes: "30-day supply for chronic pain management"', 'notes: "Vydané balenie na 30 dní pre manažment chronickej bolesti"'],
  
  // Soap templates (abbreviated replace)
  ['subjective: "Owner reports patient has been eating and drinking normally. No vomiting or diarrhea. Activity level normal. Up to date on flea/tick prevention."', 'subjective: "Majiteľ hlási, že pacient normálne žerie a pije. Bez zvracania alebo hnačky. Normálna aktivita. Aktuálna prevencia proti blchám a kliešťom."'],
  ['objective: "T: 101.2F, HR: 80bpm, RR: 20. BCS: 5/9. Bright, alert, responsive. Coat in good condition. No abnormal findings on physical exam. Teeth show mild tartar buildup on molars."', 'objective: "T: 38.4C, HR: 80/min, RR: 20. BCS: 5/9. Bdelý, vnímavý. Srsť v dobrom stave. Fyzikálne vyšetrenie bez patologických nálezov. Mierny zubný kameň na stoličkách."'],
  ['assessment: "Healthy patient, routine wellness exam. Mild dental tartar noted - recommend dental cleaning within the next 6 months."', 'assessment: "Zdravý pacient, bežná preventívna prehliadka. Zistený mierny zubný kameň - odporúčané čistenie zubov do 6 mesiacov."'],
  ['plan: "Continue current diet and exercise. Schedule dental cleaning. Update vaccinations per protocol. Recheck in 1 year or as needed."', 'plan: "Pokračovať v súčasnej strave a pohybe. Naplánovať čistenie zubov. Očkovanie podľa protokolu. Kontrola o 1 rok alebo podľa potreby."'],
  
  ['subjective: "Owner reports decreased appetite for 2 days. Patient seems lethargic. No vomiting but soft stools noted. Drinking water normally."', 'subjective: "Majiteľ udáva zníženú chuť do jedla už 2 dni. Pacient pôsobí letargicky. Bez zvracania, ale bola spozorovaná mäkká stolica. Pije vodu normálne."'],
  ['objective: "T: 102.8F, HR: 110bpm, RR: 28. BCS: 4/9. Mild dehydration noted. Abdomen slightly tense on palpation. No masses felt. Mild discomfort in cranial abdomen."', 'objective: "T: 39.3C, HR: 110/min, RR: 28. BCS: 4/9. Mierna dehydratácia. Brucho pri palpácii mierne napäté. Hmatateľné masy nezistené. Mierny diskomfort v kraniálnej časti brucha."'],
  ['assessment: "Suspected gastroenteritis. DDx includes dietary indiscretion, pancreatitis, foreign body. Recommend bloodwork and monitoring."', 'assessment: "Podozrenie na gastroenteritídu. Diferenciálna diagnóza zahŕňa diétnu chybu, pankreatitídu, cudzie teleso. Odporúčaný krvný obraz a sledovanie."'],
  ['plan: "CBC/Chem panel submitted. Bland diet (boiled chicken and rice) for 3-5 days. Cerenia 1mg/kg SQ administered. Recheck in 48 hours if not improving. ER if vomiting begins or lethargy worsens."', 'plan: "Odoslaný krvný obraz/biochémia. Bezzvyšková diéta (varené kura s ryžou) na 3-5 dní. Podaná Cerenia 1mg/kg SQ. Kontrola o 48 hodín v prípade nezlepšenia. Pohotovosť v prípade zvracania alebo zhoršenia letargie."'],

  ['subjective: "Annual vaccination visit. Owner has no concerns. Patient on monthly Heartgard and NexGard."', 'subjective: "Každoročné očkovanie. Majiteľ neudáva žiadne problémy. Pacient užíva mesačne Heartgard a NexGard."'],
  ['objective: "T: 100.8F, HR: 90bpm, RR: 18. BCS: 6/9. Slightly overweight. All systems within normal limits on exam. Heart and lungs auscultate normally."', 'objective: "T: 38.2C, HR: 90/min, RR: 18. BCS: 6/9. Mierna nadváha. Všetky systémy pri vyšetrení v norme. Srdce a pľúca pri auskultácii bez nálezu."'],
  ['assessment: "Healthy patient, slightly overweight. Vaccines updated today."', 'assessment: "Zdravý pacient, mierna nadváha. Dnes zaočkovaný."'],
  ['plan: "Administered DHPP and Rabies vaccines. Recommend reducing daily food by 10% and increasing exercise. Weight recheck in 3 months. Next annual due in 1 year."', 'plan: "Podané vakcíny DHPP a besnota. Odporúčané znížiť dennú dávku krmiva o 10 % a zvýšiť pohyb. Kontrola hmotnosti o 3 mesiace. Ďalšia preventívna prehliadka o rok."'],

  ['subjective: "Patient presented for limping on right forelimb, noticed by owner after playing at park yesterday. No known trauma. Not improving overnight."', 'subjective: "Pacient privedený pre krívanie na pravú hrudnú končatinu, majiteľ spozoroval po včerajšom hraní v parku. Bez známej traumy. Do rána bez zlepšenia."'],
  ['objective: "T: 101.5F, HR: 95bpm, RR: 22. Grade 2/5 right forelimb lameness. Pain on flexion of right elbow. Mild soft tissue swelling noted over lateral elbow. No crepitus. Good range of motion in shoulder and carpus."', 'objective: "T: 38.6C, HR: 95/min, RR: 22. Krívanie pravej hrudnej končatiny 2/5. Bolesť pri flexii pravého lakťa. Mierny opuch mäkkých tkanív na laterálnej strane lakťa. Bez krepitácie. Dobrý rozsah pohybu v ramene a karpe."'],
  ['assessment: "Right forelimb lameness, likely soft tissue injury to elbow region. Radiographs unremarkable - no fracture or OCD lesion identified."', 'assessment: "Krívanie pravej hrudnej končatiny, pravdepodobne poranenie mäkkých tkanív v oblasti lakťa. RTG bez nálezu - nezistená zlomenina ani OCD lézia."'],
  ['plan: "Rimadyl 2mg/kg BID for 7 days with food. Strict rest for 2 weeks - leash walks only. Cold compress 10 min TID for first 3 days. Recheck in 2 weeks. If not improving, consider referral for advanced imaging."', 'plan: "Rimadyl 2mg/kg 2x denne na 7 dní s jedlom. Prísny kľud na 2 týždne - len prechádzky na vôdzke. Studený obklad 10 min 3x denne prvé 3 dni. Kontrola o 2 týždne. V prípade nezlepšenia zvážiť odporučenie na pokročilé zobrazovacie vyšetrenie."'],

  ['subjective: "Routine dental cleaning under anesthesia. Pre-anesthetic bloodwork performed last week and was within normal limits. NPO since 10pm last night."', 'subjective: "Rutinné čistenie zubov v anestézii. Predoperačné vyšetrenie krvi vykonané minulý týždeň s výsledkami v norme. Hladovka od 22:00 včera v noci."'],
  ['objective: "Pre-anesthetic vitals: T: 101.0F, HR: 88bpm, RR: 16. ASA Class I. Grade 2 dental disease with moderate tartar on premolars and molars. Mild gingivitis noted. Full mouth radiographs taken."', 'objective: "Predoperačné vitálne funkcie: T: 38.3C, HR: 88/min, RR: 16. ASA trieda I. Ochorenie zubov stupňa 2 s miernym zubným kameňom na premolároch a molároch. Mierna gingivitída. Zhotovené kompletné intraorálne RTG snímky."'],
  ['assessment: "Dental disease grade 2. Moderate tartar accumulation. No tooth root abscess on radiographs. All teeth intact and viable."', 'assessment: "Ochorenie zubov stupňa 2. Stredné hromadenie zubného kameňa. Na RTG snímkach bez abscesu koreňa zuba. Všetky zuby neporušené a vitálne."'],
  ['plan: "Full dental prophylaxis performed under general anesthesia (propofol induction, isoflurane maintenance). All tartar removed. Teeth polished. Fluoride treatment applied. Recovery uneventful. Discharge this evening with soft food for 3 days."', 'plan: "Vykonaná kompletná zubná profylaxia v celkovej anestézii (úvod propofolom, udržiavanie izofluránom). Zubný kameň úplne odstránený. Zuby vyleštené. Aplikované ošetrenie fluoridom. Zotavenie bez komplikácií. Prepustenie dnes večer s odporúčaním mäkkej stravy na 3 dni."'],
];

replacements.forEach(([search, replace]) => {
  content = content.replace(search, replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Translations applied successfully.");
