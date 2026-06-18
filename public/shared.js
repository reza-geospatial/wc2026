/* ============================================================
   shared.js  —  هستهٔ مشترک سرور و مرورگر
   تیم‌ها، ۷۲ بازی مرحلهٔ گروهی، موتور امتیازدهی و منطق قفل
   منبع: قرعه‌کشی و برنامهٔ رسمی جام جهانی فیفا ۲۰۲۶
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.WC = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const TEAMS = {
    mex: {
      n: "مکزیک",
      f: "🇲🇽",
      p: [
        "Raúl Jiménez",
        "Santiago Giménez",
        "Hirving Lozano",
        "Alexis Vega",
        "Orbelín Pineda",
        "César Huerta",
        "Roberto Alvarado",
        "Edson Álvarez",
      ],
    },
    rsa: {
      n: "آفریقای جنوبی",
      f: "🇿🇦",
      p: [
        "Percy Tau",
        "Lyle Foster",
        "Themba Zwane",
        "Evidence Makgopa",
        "Relebohile Mofokeng",
        "Oswin Appollis",
      ],
    },
    kor: {
      n: "کره جنوبی",
      f: "🇰🇷",
      p: [
        "Son Heung-min",
        "Hwang Hee-chan",
        "Lee Kang-in",
        "Cho Gue-sung",
        "Oh Hyeon-gyu",
      ],
    },
    cze: {
      n: "چک",
      f: "🇨🇿",
      p: [
        "Patrik Schick",
        "Adam Hložek",
        "Tomáš Souček",
        "Antonín Barák",
        "Mojmír Chytil",
      ],
    },
    can: {
      n: "کانادا",
      f: "🇨🇦",
      p: [
        "Jonathan David",
        "Alphonso Davies",
        "Cyle Larin",
        "Tajon Buchanan",
        "Jacob Shaffelburg",
        "Stephen Eustáquio",
      ],
    },
    bih: {
      n: "بوسنی و هرزگوین",
      f: "🇧🇦",
      p: [
        "Edin Džeko",
        "Ermedin Demirović",
        "Smail Prevljak",
        "Miralem Pjanić",
        "Armin Gigović",
      ],
    },
    qat: {
      n: "قطر",
      f: "🇶🇦",
      p: ["Almoez Ali", "Akram Afif", "Hassan Al-Haydos", "Mohammed Muntari"],
    },
    sui: {
      n: "سوئیس",
      f: "🇨🇭",
      p: [
        "Breel Embolo",
        "Zeki Amdouni",
        "Dan Ndoye",
        "Ruben Vargas",
        "Xherdan Shaqiri",
        "Granit Xhaka",
      ],
    },
    bra: {
      n: "برزیل",
      f: "🇧🇷",
      p: [
        "Vinícius Júnior",
        "Rodrygo",
        "Raphinha",
        "Endrick",
        "Gabriel Jesus",
        "Neymar",
        "Lucas Paquetá",
      ],
    },
    mar: {
      n: "مراکش",
      f: "🇲🇦",
      p: [
        "Achraf Hakimi",
        "Youssef En-Nesyri",
        "Hakim Ziyech",
        "Brahim Díaz",
        "Ayoub El Kaabi",
        "Sofiane Boufal",
        "Azzedine Ounahi",
      ],
    },
    hai: {
      n: "هائیتی",
      f: "🇭🇹",
      p: ["Frantzdy Pierrot", "Duckens Nazon", "Danley Jean Jacques"],
    },
    sco: {
      n: "اسکاتلند",
      f: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      p: [
        "Scott McTominay",
        "John McGinn",
        "Che Adams",
        "Lyndon Dykes",
        "Ryan Christie",
        "Ben Doak",
      ],
    },
    usa: {
      n: "آمریکا",
      f: "🇺🇸",
      p: [
        "Christian Pulisic",
        "Folarin Balogun",
        "Ricardo Pepi",
        "Timothy Weah",
        "Gio Reyna",
        "Weston McKennie",
        "Josh Sargent",
      ],
    },
    par: {
      n: "پاراگوئه",
      f: "🇵🇾",
      p: [
        "Miguel Almirón",
        "Antonio Sanabria",
        "Julio Enciso",
        "Gabriel Ávalos",
        "Diego Gómez",
      ],
    },
    aus: {
      n: "استرالیا",
      f: "🇦🇺",
      p: [
        "Mathew Leckie",
        "Mitchell Duke",
        "Jackson Irvine",
        "Craig Goodwin",
        "Martin Boyle",
        "Kusini Yengi",
      ],
    },
    tur: {
      n: "ترکیه",
      f: "🇹🇷",
      p: [
        "Arda Güler",
        "Kenan Yıldız",
        "Hakan Çalhanoğlu",
        "Kerem Aktürkoğlu",
        "Barış Alper Yılmaz",
        "Yusuf Yazıcı",
      ],
    },
    ger: {
      n: "آلمان",
      f: "🇩🇪",
      p: [
        "Florian Wirtz",
        "Jamal Musiala",
        "Kai Havertz",
        "Niclas Füllkrug",
        "Serge Gnabry",
        "Leroy Sané",
        "Deniz Undav",
      ],
    },
    cuw: {
      n: "کوراسائو",
      f: "🇨🇼",
      p: [
        "Tahith Chong",
        "Leandro Bacuna",
        "Juninho Bacuna",
        "Gervane Kastaneer",
      ],
    },
    civ: {
      n: "ساحل عاج",
      f: "🇨🇮",
      p: [
        "Sébastien Haller",
        "Wilfried Zaha",
        "Nicolas Pépé",
        "Simon Adingra",
        "Jérémie Boga",
        "Franck Kessié",
      ],
    },
    ecu: {
      n: "اکوادور",
      f: "🇪🇨",
      p: [
        "Enner Valencia",
        "Kendry Páez",
        "Gonzalo Plata",
        "Moisés Caicedo",
        "Jeremy Sarmiento",
      ],
    },
    ned: {
      n: "هلند",
      f: "🇳🇱",
      p: [
        "Memphis Depay",
        "Cody Gakpo",
        "Donyell Malen",
        "Xavi Simons",
        "Wout Weghorst",
        "Frenkie de Jong",
      ],
    },
    jpn: {
      n: "ژاپن",
      f: "🇯🇵",
      p: [
        "Takefusa Kubo",
        "Kaoru Mitoma",
        "Daizen Maeda",
        "Ayase Ueda",
        "Junya Ito",
        "Ritsu Doan",
      ],
    },
    swe: {
      n: "سوئد",
      f: "🇸🇪",
      p: [
        "Alexander Isak",
        "Viktor Gyökeres",
        "Dejan Kulusevski",
        "Anthony Elanga",
        "Emil Forsberg",
      ],
    },
    tun: {
      n: "تونس",
      f: "🇹🇳",
      p: [
        "Youssef Msakni",
        "Hannibal Mejbri",
        "Naïm Sliti",
        "Seifeddine Jaziri",
        "Elyes Skhiri",
      ],
    },
    esp: {
      n: "اسپانیا",
      f: "🇪🇸",
      p: [
        "Lamine Yamal",
        "Nico Williams",
        "Álvaro Morata",
        "Dani Olmo",
        "Mikel Oyarzabal",
        "Pedri",
        "Ferran Torres",
      ],
    },
    cpv: {
      n: "کیپ‌ورد",
      f: "🇨🇻",
      p: [
        "Ryan Mendes",
        "Garry Rodrigues",
        "Jamiro Monteiro",
        "Bebé",
        "Júlio Tavares",
      ],
    },
    ksa: {
      n: "عربستان سعودی",
      f: "🇸🇦",
      p: [
        "Salem Al-Dawsari",
        "Firas Al-Buraikan",
        "Saleh Al-Shehri",
        "Abdullah Al-Hamdan",
      ],
    },
    uru: {
      n: "اروگوئه",
      f: "🇺🇾",
      p: [
        "Darwin Núñez",
        "Federico Valverde",
        "Facundo Pellistri",
        "Giorgian de Arrascaeta",
        "Maximiliano Araújo",
        "Nicolás de la Cruz",
      ],
    },
    bel: {
      n: "بلژیک",
      f: "🇧🇪",
      p: [
        "Kevin De Bruyne",
        "Romelu Lukaku",
        "Jérémy Doku",
        "Leandro Trossard",
        "Youri Tielemans",
        "Charles De Ketelaere",
        "Dodi Lukebakio",
      ],
    },
    egy: {
      n: "مصر",
      f: "🇪🇬",
      p: [
        "Mohamed Salah",
        "Omar Marmoush",
        "Mostafa Mohamed",
        "Trezeguet",
        "Mahmoud Hassan",
      ],
    },
    irn: {
      n: "ایران",
      f: "<svg xmlns='http://www.w3.org/2000/svg' width='34' height='22' viewBox='0 0 66 42' style='vertical-align:middle;border-radius:3px;overflow:hidden'><rect width='66' height='14' fill='#239f40'/><rect y='14' width='66' height='14' fill='#fff'/><rect y='28' width='66' height='14' fill='#da0000'/><g transform='translate(33,21)'><g stroke='#d99500' stroke-width='1.3' stroke-linecap='round'><line x1='0' y1='-6' x2='0' y2='-9.2'/><line x1='4.2' y1='-4.2' x2='6.5' y2='-6.5'/><line x1='6' y1='0' x2='9.2' y2='0'/><line x1='4.2' y1='4.2' x2='6.5' y2='6.5'/><line x1='0' y1='6' x2='0' y2='9.2'/><line x1='-4.2' y1='4.2' x2='-6.5' y2='6.5'/><line x1='-6' y1='0' x2='-9.2' y2='0'/><line x1='-4.2' y1='-4.2' x2='-6.5' y2='-6.5'/></g><circle r='6' fill='#f3b400'/><g fill='#7a5512'><ellipse cx='0.6' cy='1.6' rx='3.5' ry='2.1'/><circle cx='-2.9' cy='-0.2' r='2'/><path d='M2.2 -0.6 L5.2 -4.2 L4.1 -0.2 Z'/><rect x='-2.3' y='3.1' width='1' height='2.3'/><rect x='1.5' y='3.1' width='1' height='2.3'/><path d='M3.5 0.9 q3.2 -1 2.5 -4.2' stroke='#7a5512' stroke-width='0.9' fill='none'/></g></g></svg>",
      p: [
        "Mehdi Taremi",
        "Sardar Azmoun",
        "Alireza Jahanbakhsh",
        "Saman Ghoddos",
        "Karim Ansarifard",
        "Mohammad Mohebi",
      ],
    },
    nzl: {
      n: "نیوزیلند",
      f: "🇳🇿",
      p: [
        "Chris Wood",
        "Ben Waine",
        "Kosta Barbarouses",
        "Sarpreet Singh",
        "Marko Stamenić",
      ],
    },
    fra: {
      n: "فرانسه",
      f: "🇫🇷",
      p: [
        "Kylian Mbappé",
        "Ousmane Dembélé",
        "Antoine Griezmann",
        "Marcus Thuram",
        "Randal Kolo Muani",
        "Kingsley Coman",
        "Bradley Barcola",
      ],
    },
    sen: {
      n: "سنگال",
      f: "🇸🇳",
      p: [
        "Sadio Mané",
        "Nicolas Jackson",
        "Iliman Ndiaye",
        "Ismaïla Sarr",
        "Habib Diallo",
        "Boulaye Dia",
      ],
    },
    irq: {
      n: "عراق",
      f: "🇮🇶",
      p: [
        "Aymen Hussein",
        "Mohanad Ali",
        "Ali Al-Hamadi",
        "Amir Al-Ammari",
        "Zidane Iqbal",
      ],
    },
    nor: {
      n: "نروژ",
      f: "🇳🇴",
      p: [
        "Erling Haaland",
        "Martin Ødegaard",
        "Alexander Sørloth",
        "Antonio Nusa",
        "Oscar Bobb",
      ],
    },
    arg: {
      n: "آرژانتین",
      f: "🇦🇷",
      p: [
        "Lionel Messi",
        "Julián Álvarez",
        "Lautaro Martínez",
        "Nicolás González",
        "Alejandro Garnacho",
        "Thiago Almada",
        "Enzo Fernández",
      ],
    },
    alg: {
      n: "الجزایر",
      f: "🇩🇿",
      p: [
        "Riyad Mahrez",
        "Amine Gouiri",
        "Baghdad Bounedjah",
        "Saïd Benrahma",
        "Youcef Belaïli",
        "Islam Slimani",
      ],
    },
    aut: {
      n: "اتریش",
      f: "🇦🇹",
      p: [
        "Marko Arnautović",
        "Marcel Sabitzer",
        "Christoph Baumgartner",
        "Michael Gregoritsch",
        "Patrick Wimmer",
        "Konrad Laimer",
      ],
    },
    jor: {
      n: "اردن",
      f: "🇯🇴",
      p: [
        "Yazan Al-Naimat",
        "Mousa Al-Tamari",
        "Ali Olwan",
        "Mahmoud Al-Mardi",
      ],
    },
    por: {
      n: "پرتغال",
      f: "🇵🇹",
      p: [
        "Cristiano Ronaldo",
        "Bruno Fernandes",
        "Bernardo Silva",
        "Rafael Leão",
        "Gonçalo Ramos",
        "João Félix",
        "Pedro Neto",
        "Vitinha",
      ],
    },
    cod: {
      n: "کنگو دموکراتیک",
      f: "🇨🇩",
      p: [
        "Cédric Bakambu",
        "Yoane Wissa",
        "Silas Katompa",
        "Théo Bongonda",
        "Meschack Elia",
      ],
    },
    uzb: {
      n: "ازبکستان",
      f: "🇺🇿",
      p: [
        "Eldor Shomurodov",
        "Igor Sergeev",
        "Jaloliddin Masharipov",
        "Abbosbek Fayzullaev",
      ],
    },
    col: {
      n: "کلمبیا",
      f: "🇨🇴",
      p: [
        "Luis Díaz",
        "James Rodríguez",
        "Jhon Córdoba",
        "Rafael Santos Borré",
        "Luis Sinisterra",
        "Jhon Durán",
      ],
    },
    eng: {
      n: "انگلیس",
      f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      p: [
        "Harry Kane",
        "Bukayo Saka",
        "Phil Foden",
        "Jude Bellingham",
        "Cole Palmer",
        "Marcus Rashford",
        "Anthony Gordon",
        "Ollie Watkins",
      ],
    },
    cro: {
      n: "کرواسی",
      f: "🇭🇷",
      p: [
        "Andrej Kramarić",
        "Bruno Petković",
        "Ante Budimir",
        "Luka Modrić",
        "Ivan Perišić",
        "Mateo Kovačić",
        "Lovro Majer",
      ],
    },
    gha: {
      n: "غنا",
      f: "🇬🇭",
      p: [
        "Mohammed Kudus",
        "Iñaki Williams",
        "Jordan Ayew",
        "Antoine Semenyo",
        "Kamaldeen Sulemana",
        "Ernest Nuamah",
      ],
    },
    pan: {
      n: "پاناما",
      f: "🇵🇦",
      p: [
        "Ismael Díaz",
        "José Fajardo",
        "Cecilio Waterman",
        "Adalberto Carrasquilla",
        "Eric Davis",
      ],
    },
  };

  const GROUPS = {
    A: ["mex", "rsa", "kor", "cze"],
    B: ["can", "sui", "qat", "bih"],
    C: ["bra", "mar", "sco", "hai"],
    D: ["usa", "par", "aus", "tur"],
    E: ["ger", "ecu", "civ", "cuw"],
    F: ["ned", "jpn", "swe", "tun"],
    G: ["bel", "irn", "egy", "nzl"],
    H: ["esp", "uru", "ksa", "cpv"],
    I: ["fra", "sen", "irq", "nor"],
    J: ["arg", "alg", "aut", "jor"],
    K: ["por", "col", "uzb", "cod"],
    L: ["eng", "cro", "gha", "pan"],
  };

  const MATCHES = [
    ["m1", "A", "mex", "rsa", "2026-06-11T19:00:00Z", "آزتکا، مکزیکوسیتی"],
    ["m2", "A", "kor", "cze", "2026-06-12T02:00:00Z", "آکرون، زاپوپان"],
    ["m3", "B", "can", "bih", "2026-06-12T19:00:00Z", "بی‌ام‌او فیلد، تورنتو"],
    ["m4", "D", "usa", "par", "2026-06-13T01:00:00Z", "سوفای، اینگل‌وود"],
    ["m5", "B", "qat", "sui", "2026-06-13T19:00:00Z", "لیوایز، سانتاکلارا"],
    ["m6", "C", "bra", "mar", "2026-06-13T22:00:00Z", "متلایف، نیوجرسی"],
    ["m7", "C", "hai", "sco", "2026-06-14T01:00:00Z", "ژیلت، فاکسبرو"],
    ["m8", "D", "aus", "tur", "2026-06-14T04:00:00Z", "بی‌سی پلیس، ونکوور"],
    ["m9", "E", "ger", "cuw", "2026-06-14T17:00:00Z", "ان‌آرجی، هیوستون"],
    [
      "m10",
      "F",
      "ned",
      "jpn",
      "2026-06-14T20:00:00Z",
      "ای‌تی‌اند‌تی، آرلینگتون",
    ],
    ["m11", "E", "civ", "ecu", "2026-06-14T23:00:00Z", "لینکلن، فیلادلفیا"],
    ["m12", "F", "swe", "tun", "2026-06-15T02:00:00Z", "بی‌بی‌وی‌ای، مونته‌ری"],
    ["m13", "H", "esp", "cpv", "2026-06-15T16:00:00Z", "مرسدس‌بنز، آتلانتا"],
    ["m14", "G", "bel", "egy", "2026-06-15T19:00:00Z", "لومن فیلد، سیاتل"],
    ["m15", "H", "ksa", "uru", "2026-06-15T22:00:00Z", "هارد راک، میامی"],
    ["m16", "G", "irn", "nzl", "2026-06-16T01:00:00Z", "سوفای، اینگل‌وود"],
    ["m17", "I", "fra", "sen", "2026-06-16T19:00:00Z", "متلایف، نیوجرسی"],
    ["m18", "I", "irq", "nor", "2026-06-16T22:00:00Z", "ژیلت، فاکسبرو"],
    ["m19", "J", "arg", "alg", "2026-06-17T01:00:00Z", "اروهد، کانزاس‌سیتی"],
    ["m20", "J", "aut", "jor", "2026-06-17T04:00:00Z", "لیوایز، سانتاکلارا"],
    ["m21", "K", "por", "cod", "2026-06-17T17:00:00Z", "ان‌آرجی، هیوستون"],
    [
      "m22",
      "L",
      "eng",
      "cro",
      "2026-06-17T20:00:00Z",
      "ای‌تی‌اند‌تی، آرلینگتون",
    ],
    ["m23", "L", "gha", "pan", "2026-06-17T23:00:00Z", "بی‌ام‌او فیلد، تورنتو"],
    ["m24", "K", "uzb", "col", "2026-06-18T02:00:00Z", "آزتکا، مکزیکوسیتی"],
    ["m25", "A", "cze", "rsa", "2026-06-18T16:00:00Z", "مرسدس‌بنز، آتلانتا"],
    ["m26", "B", "sui", "bih", "2026-06-18T19:00:00Z", "سوفای، اینگل‌وود"],
    ["m27", "B", "can", "qat", "2026-06-18T22:00:00Z", "بی‌سی پلیس، ونکوور"],
    ["m28", "A", "mex", "kor", "2026-06-19T01:00:00Z", "آکرون، زاپوپان"],
    ["m29", "D", "usa", "aus", "2026-06-19T19:00:00Z", "لومن فیلد، سیاتل"],
    ["m30", "C", "sco", "mar", "2026-06-19T22:00:00Z", "ژیلت، فاکسبرو"],
    ["m31", "C", "bra", "hai", "2026-06-20T00:30:00Z", "لینکلن، فیلادلفیا"],
    ["m32", "D", "tur", "par", "2026-06-20T03:00:00Z", "لیوایز، سانتاکلارا"],
    ["m33", "F", "ned", "swe", "2026-06-20T17:00:00Z", "ان‌آرجی، هیوستون"],
    ["m34", "E", "ger", "civ", "2026-06-20T20:00:00Z", "بی‌ام‌او فیلد، تورنتو"],
    ["m35", "E", "ecu", "cuw", "2026-06-21T00:00:00Z", "اروهد، کانزاس‌سیتی"],
    ["m36", "F", "tun", "jpn", "2026-06-21T04:00:00Z", "بی‌بی‌وی‌ای، مونته‌ری"],
    ["m37", "H", "esp", "ksa", "2026-06-21T16:00:00Z", "مرسدس‌بنز، آتلانتا"],
    ["m38", "G", "bel", "irn", "2026-06-21T19:00:00Z", "سوفای، اینگل‌وود"],
    ["m39", "H", "uru", "cpv", "2026-06-21T22:00:00Z", "هارد راک، میامی"],
    ["m40", "G", "nzl", "egy", "2026-06-22T01:00:00Z", "بی‌سی پلیس، ونکوور"],
    [
      "m41",
      "J",
      "arg",
      "aut",
      "2026-06-22T17:00:00Z",
      "ای‌تی‌اند‌تی، آرلینگتون",
    ],
    ["m42", "I", "fra", "irq", "2026-06-22T21:00:00Z", "لینکلن، فیلادلفیا"],
    ["m43", "I", "nor", "sen", "2026-06-23T00:00:00Z", "متلایف، نیوجرسی"],
    ["m44", "J", "jor", "alg", "2026-06-23T03:00:00Z", "لیوایز، سانتاکلارا"],
    ["m45", "K", "por", "uzb", "2026-06-23T17:00:00Z", "ان‌آرجی، هیوستون"],
    ["m46", "L", "eng", "gha", "2026-06-23T20:00:00Z", "ژیلت، فاکسبرو"],
    ["m47", "L", "pan", "cro", "2026-06-23T23:00:00Z", "بی‌ام‌او فیلد، تورنتو"],
    ["m48", "K", "col", "cod", "2026-06-24T02:00:00Z", "آکرون، زاپوپان"],
    ["m49", "B", "sui", "can", "2026-06-24T19:00:00Z", "بی‌سی پلیس، ونکوور"],
    ["m50", "B", "bih", "qat", "2026-06-24T19:00:00Z", "لومن فیلد، سیاتل"],
    ["m51", "C", "sco", "bra", "2026-06-24T22:00:00Z", "هارد راک، میامی"],
    ["m52", "C", "mar", "hai", "2026-06-24T22:00:00Z", "مرسدس‌بنز، آتلانتا"],
    ["m53", "A", "cze", "mex", "2026-06-25T01:00:00Z", "آزتکا، مکزیکوسیتی"],
    ["m54", "A", "rsa", "kor", "2026-06-25T01:00:00Z", "بی‌بی‌وی‌ای، مونته‌ری"],
    ["m55", "E", "cuw", "civ", "2026-06-25T20:00:00Z", "لینکلن، فیلادلفیا"],
    ["m56", "E", "ecu", "ger", "2026-06-25T20:00:00Z", "متلایف، نیوجرسی"],
    [
      "m57",
      "F",
      "jpn",
      "swe",
      "2026-06-25T23:00:00Z",
      "ای‌تی‌اند‌تی، آرلینگتون",
    ],
    ["m58", "F", "tun", "ned", "2026-06-25T23:00:00Z", "اروهد، کانزاس‌سیتی"],
    ["m59", "D", "tur", "usa", "2026-06-26T02:00:00Z", "سوفای، اینگل‌وود"],
    ["m60", "D", "par", "aus", "2026-06-26T02:00:00Z", "لیوایز، سانتاکلارا"],
    ["m61", "I", "nor", "fra", "2026-06-26T19:00:00Z", "ژیلت، فاکسبرو"],
    ["m62", "I", "sen", "irq", "2026-06-26T19:00:00Z", "بی‌ام‌او فیلد، تورنتو"],
    ["m63", "H", "cpv", "ksa", "2026-06-27T00:00:00Z", "ان‌آرجی، هیوستون"],
    ["m64", "H", "uru", "esp", "2026-06-27T00:00:00Z", "آکرون، زاپوپان"],
    ["m65", "G", "egy", "irn", "2026-06-27T03:00:00Z", "لومن فیلد، سیاتل"],
    ["m66", "G", "nzl", "bel", "2026-06-27T03:00:00Z", "بی‌سی پلیس، ونکوور"],
    ["m67", "L", "pan", "eng", "2026-06-27T21:00:00Z", "متلایف، نیوجرسی"],
    ["m68", "L", "cro", "gha", "2026-06-27T21:00:00Z", "لینکلن، فیلادلفیا"],
    ["m69", "K", "col", "por", "2026-06-27T23:30:00Z", "هارد راک، میامی"],
    ["m70", "K", "cod", "uzb", "2026-06-27T23:30:00Z", "مرسدس‌بنز، آتلانتا"],
    ["m71", "J", "alg", "aut", "2026-06-28T02:00:00Z", "اروهد، کانزاس‌سیتی"],
    [
      "m72",
      "J",
      "jor",
      "arg",
      "2026-06-28T02:00:00Z",
      "ای‌تی‌اند‌تی، آرلینگتون",
    ],
  ].map(function (x) {
    return {
      id: x[0],
      group: x[1],
      home: x[2],
      away: x[3],
      dt: x[4],
      venue: x[5],
    };
  });

  const MATCH_BY_ID = {};
  MATCHES.forEach(function (m) {
    MATCH_BY_ID[m.id] = m;
  });

  const DEFAULT_CFG = {
    pOutcome: 3,
    pOneTeam: 2,
    pExact: 5,
    pScorer: 2,
    pChampion: 15,
  };

  // تیم‌های مجاز برای پیش‌بینی قهرمان (به ترتیب شانس قهرمانی)
  const CHAMP_TEAMS = [
    "fra",
    "esp",
    "por",
    "eng",
    "arg",
    "bra",
    "ger",
    "ned",
    "nor",
    "mar",
    "usa",
    "jpn",
    "bel",
  ];

  // شروع تورنمنت = زودترین زمان شروع بین همهٔ بازی‌ها
  var _start = MATCHES.reduce(function (min, m) {
    var t = new Date(m.dt).getTime();
    return t < min ? t : min;
  }, Infinity);
  function tournamentStart() {
    return _start;
  }
  // مهلت پیش‌بینی قهرمان: تا پایان ۲۵ ژوئن ۲۰۲۶ باز است
  var CHAMP_DEADLINE = Date.parse("2026-06-25T23:59:59Z");
  function championLocked(nowMs) {
    var now = typeof nowMs === "number" ? nowMs : Date.now();
    return now >= CHAMP_DEADLINE;
  }

  function norm(s) {
    return (s == null ? "" : String(s))
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }
  function sign(n) {
    return n > 0 ? 1 : n < 0 ? -1 : 0;
  }

  // قفل: بازی فقط تا قبل از سوت شروع قابل پیش‌بینی است
  function isLocked(match, nowMs) {
    var now = typeof nowMs === "number" ? nowMs : Date.now();
    return now >= new Date(match.dt).getTime();
  }

  // امتیاز یک پیش‌بینی نسبت به نتیجهٔ واقعی
  function scoreOne(pred, res, cfg) {
    cfg = cfg || DEFAULT_CFG;
    if (!pred || !res || res.h == null || res.a == null) return null;
    var d = { outcome: 0, team: 0, exact: 0, scorer: 0, total: 0 };
    if (sign(pred.h - pred.a) === sign(res.h - res.a)) d.outcome = cfg.pOutcome;
    var hR = Number(pred.h) === Number(res.h),
      aR = Number(pred.a) === Number(res.a);
    if (hR && aR) d.exact = cfg.pExact;
    else if (hR || aR) d.team = cfg.pOneTeam;
    var actual = (res.s || []).map(norm);
    var predNames = (pred.s || []).filter(Boolean).map(norm);
    var uniq = predNames.filter(function (n, i) {
      return predNames.indexOf(n) === i;
    }); // حذف نام تکراری
    var hits = 0;
    uniq.forEach(function (n) {
      if (actual.indexOf(n) >= 0) hits++;
    });
    d.scorer = hits * cfg.pScorer;
    d.total = d.outcome + d.team + d.exact + d.scorer;
    return d;
  }

  // محاسبهٔ جدول امتیازات از روی همهٔ پیش‌بینی‌ها و نتایج (+ پیش‌بینی قهرمان، اختیاری)
  function leaderboard(users, preds, results, cfg, champPreds, champion) {
    cfg = cfg || DEFAULT_CFG;
    champPreds = champPreds || {};
    champion = champion || null;
    var rows = users.map(function (u) {
      var p = preds[u.id] || {};
      var total = 0,
        exact = 0,
        team = 0,
        outcome = 0,
        scorers = 0,
        played = 0;
      MATCHES.forEach(function (m) {
        var r = results[m.id],
          pp = p[m.id];
        if (r && r.h != null && pp) {
          var dd = scoreOne(pp, r, cfg);
          if (dd) {
            total += dd.total;
            if (dd.exact) exact++;
            if (dd.team) team++;
            if (dd.outcome) outcome++;
            if (dd.scorer) scorers += dd.scorer / (cfg.pScorer || 1);
            played++;
          }
        }
      });
      var champHit = !!(
        champion &&
        champPreds[u.id] &&
        champPreds[u.id] === champion
      );
      if (champHit) total += cfg.pChampion || 0;
      return {
        id: u.id,
        name: u.name,
        total: total,
        exact: exact,
        team: team,
        outcome: outcome,
        scorers: scorers,
        played: played,
        predCount: Object.keys(p).length,
        champHit: champHit,
      };
    });
    rows.sort(function (a, b) {
      return (
        b.total - a.total || b.exact - a.exact || b.predCount - a.predCount
      );
    });
    return rows;
  }

  return {
    TEAMS,
    GROUPS,
    MATCHES,
    MATCH_BY_ID,
    DEFAULT_CFG,
    CHAMP_TEAMS,
    CHAMP_DEADLINE,
    norm,
    sign,
    isLocked,
    scoreOne,
    leaderboard,
    tournamentStart,
    championLocked,
  };
});
