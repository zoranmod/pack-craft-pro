// Contract template data with dynamic placeholders

export interface ContractTemplateField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea';
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  category: 'basic' | 'buyer' | 'finance' | 'appliances' | 'signature';
}

export interface ContractTemplate {
  id: string;
  name: string;
  fields: ContractTemplateField[];
  content: string;
}

export const furnitureContractTemplate: ContractTemplate = {
  id: 'ugovor-namjestaj-po-mjeri',
  name: 'Ugovor o izradi namještaja po mjeri',
  fields: [
    // Basic
    { key: 'broj_dokumenta', label: 'Broj dokumenta', type: 'text', category: 'basic', required: true },
    { key: 'mjesto', label: 'Mjesto', type: 'text', defaultValue: 'Županja', category: 'basic', required: true },
    { key: 'datum', label: 'Datum', type: 'date', category: 'basic', required: true },
    
    // Buyer
    { key: 'kupac_naziv', label: 'Naziv kupca', type: 'text', category: 'buyer', required: true, placeholder: 'Ime i prezime / Naziv tvrtke' },
    { key: 'kupac_adresa', label: 'Adresa kupca', type: 'text', category: 'buyer', required: true, placeholder: 'Ulica i broj, Poštanski broj Grad' },
    { key: 'kupac_oib', label: 'OIB kupca', type: 'text', category: 'buyer', placeholder: '12345678901' },
    { key: 'kupac_kontakt', label: 'Kontakt kupca', type: 'text', category: 'buyer', placeholder: 'Telefon / Email' },
    
    // Finance
    { key: 'specifikacija', label: 'Specifikacija namještaja', type: 'textarea', category: 'finance', required: true, placeholder: 'Opis namještaja koji se izrađuje...' },
    { key: 'cijena', label: 'Cijena (EUR s PDV-om)', type: 'number', category: 'finance', required: true },
    { key: 'rok_isporuke', label: 'Rok isporuke', type: 'text', category: 'finance', required: true, placeholder: 'npr. 60 radnih dana' },
    { key: 'predujam', label: 'Predujam', type: 'text', category: 'finance', placeholder: 'npr. 1.500,00 €' },
    { key: 'jamstvo', label: 'Jamstveni rok', type: 'text', defaultValue: '10 godina', category: 'finance' },
    
    // Appliances (optional)
    { key: 'pecnica', label: 'Pećnica', type: 'text', category: 'appliances', placeholder: 'Model, marka...' },
    { key: 'ploca', label: 'Ploča za kuhanje', type: 'text', category: 'appliances', placeholder: 'Model, marka...' },
    { key: 'napa', label: 'Napa', type: 'text', category: 'appliances', placeholder: 'Model, marka...' },
    { key: 'perilica', label: 'Perilica suđa', type: 'text', category: 'appliances', placeholder: 'Model, marka...' },
    { key: 'hladnjak', label: 'Hladnjak', type: 'text', category: 'appliances', placeholder: 'Model, marka...' },
    { key: 'mikrovalna', label: 'Mikrovalna', type: 'text', category: 'appliances', placeholder: 'Model, marka...' },
    
    // Signature
    { key: 'prodavatelj_potpis', label: 'Za prodavatelja', type: 'text', category: 'signature', placeholder: 'Ime i prezime' },
    { key: 'kupac_potpis', label: 'Za kupca', type: 'text', category: 'signature', placeholder: 'Ime i prezime' },
    { key: 'datum_potpisa', label: 'Datum potpisa', type: 'date', category: 'signature' },
  ],
  content: `UGOVOR O IZRADI NAMJEŠTAJA PO MJERI

Dokument broj: {{broj_dokumenta}}
Mjesto i datum: {{mjesto}}, {{datum}}

UGOVORNE STRANE

KUPAC:
{{kupac_naziv}}
Adresa: {{kupac_adresa}}
OIB: {{kupac_oib}}
Kontakt: {{kupac_kontakt}}

(u daljnjem tekstu: KUPAC)

i

PRODAVATELJ:
AKORD d.o.o. za trgovinu, proizvodnju i usluge
Proizvodnja namještaja
Veliki kraj 131, 32270 Županja, Hrvatska
OIB: 97777678206

(u daljnjem tekstu: PRODAVATELJ)

sklapaju sljedeći:

Članak 1. – Predmet ugovora

KUPAC naručuje, a PRODAVATELJ izrađuje namještaj po mjeri prema specifikaciji koja je sastavni dio ovog ugovora:
{{specifikacija}}

Članak 2. – Cijena

Ukupna cijena ugovorenog namještaja i usluga iznosi:
{{cijena}} € (s PDV-om)

Članak 3. – Uključeno u cijenu

U navedenu cijenu uključeno je:

• dostava do kupca
• montaža
• ugradnja svih ugradbenih uređaja, ako ih ima (bez priključivanja na instalacije)
• priprema za priključivanje na instalacije (otvori kroz korpuse elemenata za prolaz cijevi, kablova i slično)

Članak 4. – Nije uključeno u cijenu

U navedenu cijenu nije uključeno:

• dostava iznad drugog kata, ako u zgradi ne postoji dovoljno prostrano dizalo

Članak 5. – Priključci

Montaža PRODAVATELJA ne podrazumijeva priključivanje uređaja na instalacije vode, plina ili električne energije.
Priključivanje mora izvršiti ovlašteni serviser.

Članak 6. – Rok isporuke

PRODAVATELJ se obvezuje ugovorene proizvode isporučiti u roku:
{{rok_isporuke}}

Članak 7. – Dodatni radovi

Ako se tijekom montaže namještaja po mjeri utvrdi potreba za prilagodbom, prepravkom ili doradom, o tome će se sastaviti zapisnik s definiranim rokom izvršenja.

Članak 8. – Odgovornost za štetu

Ako PRODAVATELJ tijekom dostave ili montaže ošteti isporučeni proizvod, dužan je o vlastitom trošku sanirati nastalu štetu.

Članak 9. – Oštećenja na objektu

Ako je šteta nastala na objektu KUPCA zbog prethodno nepropisno izvedenih građevinskih ili instalacijskih radova (npr. nepropisno izvedene podžbukne instalacije vode i/ili struje), PRODAVATELJ nije dužan nadoknaditi štetu.

Članak 10. – Uvjeti montaže

Ako KUPAC ne osigura uvjete za montažu u ugovorenom roku, PRODAVATELJ zadržava pravo KUPCA premjestiti na kraj plana montaže.
O novom terminu montaže KUPAC će biti naknadno obaviješten.

Članak 11. – Priprema prostora

KUPAC je dužan prije montaže osigurati minimalne tehničke uvjete za montažu, uključujući dovršene građevinske i instalacijske radove te osigurano osvjetljenje i grijanje prostora.

Članak 12. – Sigurnost prostora

Prije isporuke i montaže KUPAC mora osigurati radni i manipulativni prostor kako ne bi došlo do oštećenja postojećeg namještaja ili uređaja niti do ozljede radnika PRODAVATELJA.

Članak 13. – Predujam

Prilikom potpisivanja ovog ugovora KUPAC plaća predujam u iznosu:
{{predujam}}

Članak 14. – Konačna uplata

Razliku ugovorene cijene KUPAC plaća nakon isporuke namještaja po mjeri i potpisanog naloga za dostavu i montažu.

Članak 15. – Vlasništvo

Isporučeni proizvodi ostaju vlasništvo PRODAVATELJA do potpune isplate.
Prije potpune isplate KUPAC ih ne smije koristiti.

Članak 16. – Način plaćanja

Potpunom isplatom smatra se i obročno plaćanje te plaćanje bankovnom karticom.

Članak 17. – Reklamacije

Reklamacije KUPCA koje PRODAVATELJ ne uvaži kao opravdane ne odgađaju plaćanje konačno ugovorenog iznosa.

Članak 18. – Ovrha

KUPAC ovim ugovorom ovlašćuje PRODAVATELJA da radi namirenja dospjelog, a nenaplaćenog potraživanja, može neposredno provesti ovrhu.

Članak 19. – Jamstvo

Jamstveni rok za isporučeni namještaj iznosi:
{{jamstvo}}

Jamstveni uvjeti za ugrađene uređaje određeni su uvjetima proizvođača.
KUPAC je dužan čuvati račun i jamstvene listove.

{{ugradbeni_uredaji}}

Članak 20. – Pregled prilikom isporuke

Prilikom isporuke ili montaže KUPAC ili ovlaštena osoba dužni su izvršiti pregled namještaja i, ako nema primjedbi, potpisati nalog za dostavu i montažu.
Naknadne reklamacije na vidljiva oštećenja neće se uvažiti.

Članak 21. – Mjerodavno pravo

Za sve što nije regulirano ovim ugovorom primjenjuju se odredbe Zakona o obveznim odnosima.

Članak 22. – Nadležnost suda

Za sporove proizašle iz ovog ugovora nadležan je Općinski sud u Županji.

Članak 23. – Završne odredbe

Ovaj ugovor sastavljen je u dva istovjetna primjerka, od kojih po jedan pripada svakoj ugovornoj strani.

POTPISI

Za PRODAVATELJA: {{prodavatelj_potpis}}

KUPAC: {{kupac_potpis}}

Datum potpisa: {{datum_potpisa}}`
};

export const contractTemplates: ContractTemplate[] = [
  furnitureContractTemplate,
];

export const getContractTemplate = (id: string): ContractTemplate | undefined => {
  return contractTemplates.find(t => t.id === id);
};

export const getDefaultContractTemplate = (): ContractTemplate => {
  return furnitureContractTemplate;
};
