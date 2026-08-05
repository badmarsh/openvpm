# Architektúrne rozhodnutia

> Denník rozhodnutí pre projekt OpenVPM. Každý záznam obsahuje kontext, rozhodnutie a dôvod.

---

## 2026-08-05: Umiestnenie `seed-suppliers.ts`

- **Otázka:** Má zostať len kópia `seed-suppliers.ts` v `packages/db` a odstrániť koreňovú verziu?
- **Rozhodnutie:** Áno. Koreňová verzia bola zámerne odstránená. Jediným platným umiestnením je `packages/db`.
- **Dôvod:** Zamedziť duplicitám a udržať jediný zdroj pravdy pre seedovanie databázy.

---

## 2026-08-05: Zdieľaný dialóg pre moduly marketing/automations/documents

- **Otázka:** Majú sa moduly `marketing`, `automations` a `documents` zjednotiť na spoločnom `components/ui/dialog.tsx` namiesto ad-hoc modálov?
- **Rozhodnutie:** Áno. V rámci Fázy 4 bol `components/ui/dialog.tsx` rozšírený o variantu `slideover` a všetky ad-hoc modály v týchto moduloch boli nahradené zdieľaným komponentom.
- **Dôvod:** Konzistentná prístupnosť (focus trap, ESC, `aria-modal`), jednotný vizuálny jazyk a zníženie duplicity kódu.
