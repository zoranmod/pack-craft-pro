
Plan: Isključivanje HIBP provjere lozinki

Što sam provjerio
- Problem nije u vašim ručnim pravilima lozinke, nego u backend zaštiti za procurjele lozinke.
- Logovi potvrđuju `weak_password` s razlogom `pwned`.
- U `supabase/functions/create-employee-account/index.ts` HIBP nije uključen ručno; funkcija samo hvata tu grešku i prevodi je u hrvatsku poruku.
- U `src/components/employees/EmployeeAccountTab.tsx` se trenutno prikazuje generička greška iz edge poziva, zato u modalu vidite “Edge Function returned a non-2xx status code”.
- `supabase/config.toml` trenutno nema auth/password postavke; zato ovo treba riješiti kroz postavke autentikacije u Lovable Cloud, ne kroz bazu.

Što ću promijeniti
1. U postavkama autentikacije u Lovable Cloud isključiti provjeru procurjelih lozinki (HIBP).
2. Ostaviti postojeća lokalna pravila lozinke:
   - najmanje 10 znakova
   - barem jedno veliko slovo
   - barem jedno malo slovo
   - barem jedan broj
3. U `supabase/functions/create-employee-account/index.ts` ukloniti HIBP-specifičnu poruku i zadržati samo generičku obradu weak-password grešaka gdje je potrebno.
4. U `src/components/employees/EmployeeAccountTab.tsx` dohvatiti stvarni JSON error iz edge funkcije, umjesto prikaza generičke non-2xx poruke.

Utjecaj
- Ovo je globalna promjena za autentikaciju, ne samo za reset lozinke zaposlenika.
- Ne dira bazu podataka ni RLS politike.
- Radim minimalni diff: 1 auth postavka + 2 datoteke.

Provjera nakon izmjene
- Testirati reset lozinke iz modala s lozinkom koja je ranije bila odbijena.
- Potvrditi da i dalje padaju lozinke koje krše vaša lokalna pravila forme.
- Testirati kreiranje računa i prijavu zaposlenika s novom lozinkom.

Tehnički detalji
- Datoteke: `supabase/functions/create-employee-account/index.ts`, `src/components/employees/EmployeeAccountTab.tsx`
- Konfiguracija: authentication settings u Lovable Cloud
