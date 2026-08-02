export const metadata = {
  title: "Zásady ochrany osobných údajov - OpenVPM",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Zásady ochrany osobných údajov</h1>
      <p>Posledná aktualizácia: 7. júla 2026</p>

      <p>
        
        Táto politika vysvetľuje, čo OpenVPM Cloud zhromažďuje, prečo a aké sú možnosti
        máš. Stručne povedané: údaje o vašej praxi patria vám
        prax. Používame ho na prevádzkovanie služby, nie na predaj alebo reklamu.
      </p>

      <h2>Čo zbierame</h2>
      <ul>
        <li>
          <strong>Údaje o účte:</strong>  mená, e-maily a roly pre vás
          účty zamestnancov a názov a nastavenia vašej praxe.
        </li>
        <li>
          <strong>Záznamy z praxe:</strong>  klienti, pacienti,
          schôdzky, lekárske záznamy, správy a faktúry vášmu tímu
          vstúpi. Tieto údaje spracovávame vo vašom mene; vaša prax ovláda
          to.
        </li>
        <li>
          <strong>Fakturačné údaje:</strong>  stav predplatného a počet používania.
          Podrobnosti o karte idú priamo do Stripe; nikdy nevidíme celé čísla kariet.
        </li>
        <li>
          <strong>Servisné denníky:</strong>  technické denníky a chybové hlásenia
          pomôžte nám udržať spoľahlivú a bezpečnú službu.
        </li>
        <li>
          <strong>Voliteľné analýzy:</strong>  iba ak vyberiete možnosť „Povoliť
          Analytics" v banneri súboru cookie. Nevyhnutné súbory cookie pre bezpečnosť
          prihlasovanie je vždy zapnuté; reklamné cookies sa nikdy nepoužívajú.
        </li>
      </ul>

      <h2>Ako používame údaje</h2>
      <ul>
        <li>Poskytovať, zabezpečovať a zlepšovať službu.</li>
        <li>
          
          Ak chcete posielať správy, o ktoré nás požiadate (pripomenutia schôdzok, klient
          správy, potvrdenia) a e-maily účtu.
        </li>
        <li>
          
          Na napájanie voliteľných funkcií AI. Žiadosti AI spracováva naša AI
          poskytovateľ odpovedať na žiadosť; nenechávame poskytovateľov školiť ich
          modely na vašich praktických údajoch.
        </li>
        <li>Osobné údaje nepredávame. Nezobrazujeme reklamy.</li>
      </ul>

      <h2>Kto nám pomáha prevádzkovať službu</h2>
      <p>
        
        Na prevádzkovanie OpenVPM využívame malú skupinu poskytovateľov služieb: cloud
        hosting a databázy, úložisko súborov, Stripe pre platby, e-mail
        poskytovateľa doručovania, operátora SMS a poskytovateľa AI pre
        asistent. Každý spracúva údaje len preto, aby nám poskytol svoje služby.
      </p>

      <h2>Zachovanie a vymazanie</h2>
      <ul>
        <li>
          
          Záznamy z praxe zostávajú, kým je váš účet aktívny. Váš
          prax kontroluje svoje vlastné povinnosti uchovávania zdravotných záznamov.
        </li>
        <li>
          
          Všetko môžete kedykoľvek exportovať z Nastavenia a správcu
          môže požiadať o vymazanie účtu v produkte. Po uzavretí uchovávame
          údaje exportovateľné po dobu najmenej 60 dní, potom ich vymažte zo živého vysielania
          systémy a nechať zálohy starnúť.
        </li>
      </ul>

      <h2>Bezpečnosť</h2>
      <p>
        
        Dáta sú pri prenose šifrované, prístup je založený na rolách, každá prax je taká
        izolované na databázovej vrstve so zabezpečením na úrovni riadkov a hostované
        dáta sú pravidelne zálohované. Žiadny systém nie je dokonale bezpečný, ale my
        zaobchádzajte so svojimi záznamami ako s lekárskymi údajmi, ktorými sú. Ak niekedy dôjde k porušeniu
        ovplyvní vaše údaje, upozorníme vás na to, ako to vyžaduje zákon.
      </p>

      <h2>Vaše voľby</h2>
      <ul>
        <li>Exportujte svoje údaje kedykoľvek.</li>
        <li>Požiadajte o vymazanie svojho účtu a údajov.</li>
        <li>Zmeňte výber analytických súborov cookie z odkazu na predvoľby súborov cookie.</li>
        <li>
          
          Majitelia domácich zvierat: vaše záznamy kontroluje prax vášho veterinára. Kontaktovať
          prax pre otázky, opravy alebo vymazanie.
        </li>
      </ul>

      <h2>Zmeny a kontakt</h2>
      <p>
        
        Ak tieto zásady zmeníme spôsobom, na ktorom záleží, oznámime vám to
        najskôr e-mailom alebo v produkte. Otázky alebo požiadavky:
        ahoj@openvpm.com.
      </p>
    </>
  );
}
