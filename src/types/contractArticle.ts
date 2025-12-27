export interface ContractArticleTemplate {
  id: string;
  user_id: string;
  article_number: number;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentContractArticle {
  id: string;
  document_id: string;
  article_number: number;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
}

export interface ContractArticleFormData {
  article_number: number;
  title: string;
  content: string;
  is_selected: boolean;
}

// Default contract article templates from PDF
export const defaultContractArticles: Omit<ContractArticleTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    article_number: 1,
    title: 'PREDMET UGOVORA',
    content: 'Predmet ovog Ugovora je isporuka i montaža kuhinje prema troškovniku ponude.',
    is_active: true,
  },
  {
    article_number: 2,
    title: 'ROK ISPORUKE',
    content: 'Isporuka i montaža robe iz članka 1. ovog ugovora bit će obavljena u roku od 4-6 tjedana od dana uplate predujma i potpisa ugovora.',
    is_active: true,
  },
  {
    article_number: 3,
    title: 'UVJETI PLAĆANJA',
    content: `Ugovorena cijena za robu iz članka 1. ovog ugovora iznosi {ukupna_cijena} EUR.

Kupac se obvezuje platiti ugovorenu cijenu na sljedeći način:
- Kod potpisivanja ugovora (a najkasnije u roku 3 dana od potpisa) uplaćuje iznos od {predujam} EUR, što predstavlja 50% od ukupne cijene.
- Preostali iznos od {ostatak} EUR, Kupac će platiti na dan preuzimanja i montaže robe.`,
    is_active: true,
  },
  {
    article_number: 4,
    title: 'DOSTAVA I MONTAŽA',
    content: `Prodavatelj preuzima obvezu prijevoza i montaže robe na adresi Kupca: {adresa_kupca}.

U slučaju da Kupac ima objektivnu prepreku u preuzimanju robe (npr. nespremnost elektroinstalacija, keramike, slično) u gore navedenom roku, dužan je o tome obavijestiti Prodavatelja najkasnije 7 dana prije roka isporuke. U suprotnom, Prodavatelj ima pravo na naplatu skladištenja robe od strane Kupca u iznosu od 20 EUR po danu uskladištenja.`,
    is_active: true,
  },
  {
    article_number: 5,
    title: 'PROMJENA SPECIFIKACIJE',
    content: 'Specifikacija robe može se naknadno izmijeniti uz suglasnost obje ugovorne strane, pri čemu će Prodavatelj pravodobno obavijestiti Kupca o mogućim promjenama i posljedicama (npr. promjena cijene i/ili roka isporuke).',
    is_active: true,
  },
  {
    article_number: 6,
    title: 'MATERIJAL',
    content: 'Ukoliko je Kupac iskazao želju za kupnjom materijala koji je kupljen po narudžbi za dotično kuhinjsko rješenje, Prodavatelj ga ne može zamijeniti za drugi materijal bez pristanka Kupca.',
    is_active: true,
  },
  {
    article_number: 7,
    title: 'JAMSTVO',
    content: `Prodavatelj se obvezuje da će pokrivati sve troškove popravka i servisiranja po pritužbi Kupca, ukoliko se utvrdi da je kvar nastao uslijed korištenja nekvalitetnih materijala i/ili pogrešne ugradnje, a u slučajevima koji ne spadaju u situacije oslobođenja od odgovornosti navedenih u članku 8.

Jamstveni rok za proizvod iznosi 24 mjeseca od datuma preuzimanja.`,
    is_active: true,
  },
  {
    article_number: 8,
    title: 'OSLOBOĐENJE OD ODGOVORNOSTI ZA JAMSTVO',
    content: `Prodavatelj se oslobađa od odgovornosti po jamstvu u sljedećim slučajevima:
- Kvar ugrađenog uređaja – odgovornost preuzima proizvođač uređaja
- Oštećenja nastala nakon montaže – a da nisu prouzročena od strane Prodavatelja
- Kupac odbije dopustiti Prodavatelju ulazak u prostor radi otklanjanja kvara
- Kupac ili treća strana pokuša samostalno popraviti kvar ili izmijeniti proizvod`,
    is_active: true,
  },
  {
    article_number: 9,
    title: 'SERVIS I POPRAVCI',
    content: `U slučaju opravdane reklamacije utvrđene od strane Prodavatelja, sve troškove otklanjanja kvara nastalih nepravilnim korištenjem robe snosi Kupac.

Prodavatelj se obvezuje da će sve opravdane reklamacije rješavati u roku od 15 radnih dana.`,
    is_active: true,
  },
  {
    article_number: 10,
    title: 'ZADRŽAVANJE PRAVA VLASNIŠTVA',
    content: `Prodavatelj pridržava pravo vlasništva nad robom sve dok Kupac u cijelosti ne podmiri kupoprodajnu cijenu i to uključuje:
- uplaćeni predujam,
- ostatak cijene.`,
    is_active: true,
  },
  {
    article_number: 11,
    title: 'VIŠA SILA',
    content: 'Prodavatelj neće biti odgovoran za kašnjenje ili neispunjenje obveza iz ovog Ugovora u slučaju više sile. U navedenom slučaju, Prodavatelj će Kupca u razumnom roku obavijestiti o okolnostima koje mogu uzrokovati kašnjenje ili neispunjenje te predložiti novi rok isporuke.',
    is_active: true,
  },
  {
    article_number: 12,
    title: 'NEPOTPUNA ILI POGREŠNA UGRADNJA',
    content: 'Kupac je dužan prijaviti neispravnu ili nepotpunu ugradnju u roku od 7 dana od dana preuzimanja robe, nakon čega Prodavatelj ne preuzima odgovornost za navedene nedostatke.',
    is_active: true,
  },
  {
    article_number: 13,
    title: 'RASKID UGOVORA OD STRANE KUPCA',
    content: `U slučaju raskida ugovora od strane Kupca, Prodavatelj ima pravo Kupcu naplatiti:
- ako do raskida dođe prije naručivanja materijala i robe: 20% predujma,
- ako do raskida dođe nakon naručivanja materijala i robe: cjelokupni iznos predujma.`,
    is_active: true,
  },
  {
    article_number: 14,
    title: 'RASKID UGOVORA OD STRANE PRODAVATELJA',
    content: `Prodavatelj ima pravo raskinuti ugovor u sljedećim slučajevima:
- Kupac nije platio predujam u dogovorenom roku.
- Prodavatelj je više od jednom pokušao dostaviti i/ili montirati robu, a da mu Kupac nije omogućio prihvat.

U slučaju kašnjenja isporuke duljeg od 14 dana, a koje nije nastalo uslijed više sile, Kupac ima pravo raskinuti ugovor bez ikakvih troškova.`,
    is_active: true,
  },
  {
    article_number: 15,
    title: 'NADLEŽNOST SUDA',
    content: 'U slučaju spora proizašlog iz ovog Ugovora, ugovorne strane sporazumno će pokušati riješiti spor. Ukoliko to nije moguće, nadležan je stvarno nadležan sud u mjestu sjedišta Prodavatelja.',
    is_active: true,
  },
  {
    article_number: 16,
    title: 'PRIMJERCI UGOVORA',
    content: 'Ovaj ugovor sastavljen je u dva (2) istovjetna primjerka od kojih svaka ugovorna strana zadržava po jedan primjerak.',
    is_active: true,
  },
  {
    article_number: 17,
    title: 'PRILOG UGOVORA',
    content: 'Sastavni dio ovog Ugovora čine prilozi: ponuda s troškovnikom.',
    is_active: true,
  },
  {
    article_number: 18,
    title: 'MJESTO I DATUM ZAKLJUČENJA UGOVORA',
    content: 'Ovaj Ugovor zaključen je dana {datum_ugovora} u mjestu {mjesto_ugovora}.',
    is_active: true,
  },
  {
    article_number: 19,
    title: 'POTPISI UGOVORNIH STRANA',
    content: `Za Prodavatelja:                           Za Kupca:
_____________________                 _____________________`,
    is_active: true,
  },
];
