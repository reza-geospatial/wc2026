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
      p: ["Guillermo Ochoa", "Raúl Rangel", "Carlos Acevedo", "Jesús Gallardo", "César Montes", "Jorge Sánchez", "Johan Vásquez", "Israel Reyes", "Mateo Chávez", "Edson Álvarez", "Orbelín Pineda", "Roberto Alvarado", "Luis Romo", "Luis Chávez", "Érik Lira", "Gilberto Mora", "Brian Gutiérrez", "Obed Vargas", "Álvaro Fidalgo", "Raúl Jiménez", "Alexis Vega", "Santiago Giménez", "César Huerta", "Julián Quiñones", "Guillermo Martínez", "Armando González"],
    },
    rsa: {
      n: "آفریقای جنوبی",
      f: "🇿🇦",
      p: ["Ronwen Williams", "Ricardo Goss", "Sipho Chaine", "Aubrey Modiba", "Khuliso Mudau", "Nkosinathi Sibisi", "Mbekezeli Mbokazi", "Ime Okon", "Samukele Kabini", "Khulumani Ndamane", "Thabang Matuludi", "Kamogelo Sebelebele", "Bradley Cross", "Olwethu Makhanya", "Teboho Mokoena", "Sphephelo Sithole", "Thalente Mbatha", "Jayden Adams", "Themba Zwane", "Lyle Foster", "Evidence Makgopa", "Oswin Appollis", "Iqraam Rayners", "Relebohile Mofokeng", "Thapelo Maseko", "Tshepang Moremi"],
    },
    kor: {
      n: "کره جنوبی",
      f: "🇰🇷",
      p: ["Kim Seung-gyu", "Jo Hyeon-woo", "Song Bum-keun", "Kim Min-jae", "Kim Moon-hwan", "Seol Young-woo", "Lee Tae-seok", "Park Jin-seob", "Kim Tae-hyeon", "Lee Han-beom", "Jens Castrop", "Lee Ki-hyuk", "Cho Wi-je", "Lee Jae-sung", "Hwang Hee-chan", "Hwang In-beom", "Lee Kang-in", "Paik Seung-ho", "Kim Jin-gyu", "Lee Dong-gyeong", "Bae Jun-ho", "Eom Ji-sung", "Yang Hyun-jun", "Son Heung-min", "Cho Gue-sung", "Oh Hyeon-gyu"],
    },
    cze: {
      n: "چک",
      f: "🇨🇿",
      p: ["Matěj Kovář", "Jindřich Staněk", "Lukáš Horníček", "Vladimír Coufal", "Tomáš Holeš", "Ladislav Krejčí", "David Zima", "Jaroslav Zelený", "David Jurásek", "David Douděra", "Robin Hranáč", "Štěpán Chaloupek", "Tomáš Souček", "Vladimír Darida", "Lukáš Provod", "Michal Sadílek", "Pavel Šulc", "Lukáš Červ", "Hugo Sochůrek", "Alexandr Sojka", "Denis Višinský", "Patrik Schick", "Adam Hložek", "Jan Kuchta", "Mojmír Chytil", "Tomáš Chorý"],
    },
    can: {
      n: "کانادا",
      f: "🇨🇦",
      p: ["Dayne St. Clair", "Alistair Johnston", "Luc de Fougerolles", "Alfie Jones", "Joel Waterman", "Mathieu Choinière", "Stephen Eustáquio", "Ismaël Koné", "Cyle Larin", "Jonathan David", "Liam Millar", "Tani Oluwaseyi", "Derek Cornelius", "Jacob Shaffelburg", "Moïse Bombito", "Maxime Crépeau", "Tajon Buchanan", "Owen Goodman", "Alphonso Davies", "Ali Ahmed", "Jonathan Osorio", "Richie Laryea", "Niko Sigur", "Promise David", "Nathan Saliba"],
    },
    bih: {
      n: "بوسنی و هرزگوین",
      f: "🇧🇦",
      p: ["Nikola Vasilj", "Martin Zlomislić", "Osman Hadžikić", "Sead Kolašinac", "Dennis Hadžikadunić", "Amar Dedić", "Nikola Katić", "Tarik Muharemović", "Nihad Mujakić", "Stjepan Radeljić", "Nidal Čelik", "Amir Hadžiahmetović", "Benjamin Tahirović", "Armin Gigović", "Dženis Burnić", "Ivan Bašić", "Esmir Bajraktarević", "Amar Memić", "Ivan Šunjić", "Kerim Alajbegović", "Ermin Mahmić", "Edin Džeko", "Ermedin Demirović", "Samed Baždar", "Haris Tabaković", "Jovo Lukić"],
    },
    qat: {
      n: "قطر",
      f: "🇶🇦",
      p: ["Mahmud Abunada", "Pedro Miguel", "Lucas Mendes", "Issa Laye", "Jassem Gaber", "Abdulaziz Hatem", "Ahmed Alaaeldin", "Edmilson Junior", "Mohammed Muntari", "Hassan Al-Haydos", "Akram Afif", "Karim Boudiaf", "Ayoub Al-Oui", "Homam Ahmed", "Yusuf Abdurisag", "Boualem Khoukhi", "Ahmed Al-Ganehi", "Sultan Al-Brake", "Almoez Ali", "Ahmed Fathy", "Salah Zakaria", "Meshaal Barsham", "Assim Madibo", "Tahsin Jamshid", "Al-Hashmi Al-Hussain", "Mohamed Al-Mannai"],
    },
    sui: {
      n: "سوئیس",
      f: "🇨🇭",
      p: ["Gregor Kobel", "Miro Muheim", "Silvan Widmer", "Nico Elvedi", "Manuel Akanji", "Denis Zakaria", "Breel Embolo", "Remo Freuler", "Johan Manzambi", "Granit Xhaka", "Dan Ndoye", "Yvon Mvogo", "Ricardo Rodriguez", "Ardon Jashari", "Djibril Sow", "Christian Fassnacht", "Rubén Vargas", "Eray Cömert", "Noah Okafor", "Michel Aebischer", "Marvin Keller", "Fabian Rieder", "Zeki Amdouni", "Aurèle Amenda", "Luca Jaquez", "Cedric Itten"],
    },
    bra: {
      n: "برزیل",
      f: "🇧🇷",
      p: ["Alisson", "Wesley", "Gabriel Magalhães", "Marquinhos", "Casemiro", "Alex Sandro", "Vinícius Júnior", "Bruno Guimarães", "Matheus Cunha", "Neymar", "Raphinha", "Weverton", "Danilo Luiz", "Bremer", "Léo Pereira", "Douglas Santos", "Fabinho", "Danilo Santos", "Endrick", "Lucas Paquetá", "Luiz Henrique", "Gabriel Martinelli", "Ederson", "Roger Ibañez", "Igor Thiago", "Rayan"],
    },
    mar: {
      n: "مراکش",
      f: "🇲🇦",
      p: ["Yassine Bounou", "Munir Mohamedi", "Ahmed Reda Tagnaouti", "Achraf Hakimi", "Nayef Aguerd", "Noussair Mazraoui", "Youssef Belammari", "Anass Salah-Eddine", "Chadi Riad", "Issa Diop", "Zakaria El Ouahdi", "Redouane Halhal", "Sofyan Amrabat", "Azzedine Ounahi", "Bilal El Khannouss", "Ismael Saibari", "Neil El Aynaoui", "Samir El Mourabet", "Ayyoub Bouaddi", "Ayoub El Kaabi", "Soufiane Rahimi", "Abde Ezzalzouli", "Brahim Díaz", "Chemsdine Talbi", "Gessime Yassine", "Ayoube Amaimouni"],
    },
    hai: {
      n: "هائیتی",
      f: "🇭🇹",
      p: ["Johny Placide", "Alexandre Pierre", "Josué Duverger", "Ricardo Adé", "Carlens Arcus", "Martin Expérience", "Jean-Kévin Duverne", "Duke Lacroix", "Wilguens Paugain", "Hannes Delcroix", "Keeto Thermoncy", "Leverton Pierre", "Danley Jean Jacques", "Carl Sainté", "Jean-Ricner Bellegarde", "Woodensky Pierre", "Dominique Simon", "Duckens Nazon", "Frantzdy Pierrot", "Derrick Etienne Jr.", "Louicius Deedson", "Ruben Providence", "Josué Casimir", "Yassin Fortuné", "Wilson Isidor", "Lenny Joseph"],
    },
    sco: {
      n: "اسکاتلند",
      f: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      p: ["Craig Gordon", "Angus Gunn", "Liam Kelly", "Andy Robertson", "Grant Hanley", "Kieran Tierney", "Scott McKenna", "Jack Hendry", "Nathan Patterson", "Anthony Ralston", "John Souttar", "Aaron Hickey", "Dominic Hyam", "John McGinn", "Scott McTominay", "Ryan Christie", "Kenny McLean", "Lewis Ferguson", "Ben Gannon-Doak", "Findlay Curtis", "Tyler Fletcher", "Lyndon Dykes", "Ché Adams", "Lawrence Shankland", "George Hirst", "Ross Stewart"],
    },
    usa: {
      n: "آمریکا",
      f: "🇺🇸",
      p: ["Matt Turner", "Sergiño Dest", "Chris Richards", "Tyler Adams", "Antonee Robinson", "Auston Trusty", "Giovanni Reyna", "Weston McKennie", "Ricardo Pepi", "Christian Pulisic", "Brenden Aaronson", "Miles Robinson", "Tim Ream", "Sebastian Berhalter", "Cristian Roldan", "Alex Freeman", "Malik Tillman", "Maximilian Arfsten", "Haji Wright", "Folarin Balogun", "Timothy Weah", "Mark McKenzie", "Joe Scally", "Matt Freese", "Chris Brady", "Alejandro Zendejas"],
    },
    par: {
      n: "پاراگوئه",
      f: "🇵🇾",
      p: ["Gatito Fernández", "Orlando Gill", "Gastón Olveira", "Gustavo Gómez", "Júnior Alonso", "Fabián Balbuena", "Omar Alderete", "Juan José Cáceres", "Gustavo Velázquez", "José Canale", "Alexandro Maidana", "Miguel Almirón", "Kaku", "Andrés Cubas", "Ramón Sosa", "Diego Gómez", "Damián Bobadilla", "Braian Ojeda", "Matías Galarza", "Maurício", "Antonio Sanabria", "Julio Enciso", "Gabriel Ávalos", "Álex Arce", "Isidro Pitta", "Gustavo Caballero"],
    },
    aus: {
      n: "استرالیا",
      f: "🇦🇺",
      p: ["Mathew Ryan", "Miloš Degenek", "Alessandro Circati", "Jacob Italiano", "Jordan Bos", "Jason Geria", "Mathew Leckie", "Connor Metcalfe", "Mohamed Touré", "Ajdin Hrustic", "Awer Mabil", "Paul Izzo", "Aiden O'Neill", "Cammy Devlin", "Kai Trewin", "Aziz Behich", "Nestory Irankunda", "Patrick Beach", "Harry Souttar", "Cristian Volpato", "Cameron Burgess", "Jackson Irvine", "Nishan Velupillay", "Paul Okon-Engstler", "Lucas Herrington", "Tete Yengi"],
    },
    tur: {
      n: "ترکیه",
      f: "🇹🇷",
      p: ["Uğurcan Çakır", "Mert Günok", "Altay Bayındır", "Ersin Destanoğlu", "Muhammed Şengezer", "Merih Demiral", "Zeki Çelik", "Çağlar Söyüncü", "Mert Müldür", "Ferdi Kadıoğlu", "Ozan Kabak", "Abdülkerim Bardakcı", "Eren Elmalı", "Samet Akaydin", "Yusuf Akçiçek", "Mustafa Eskihellaç", "Ahmetcan Kaplan", "Hakan Çalhanoğlu", "Kaan Ayhan", "Orkun Kökçü", "İsmail Yüksek", "Salih Özcan", "Atakan Karazor", "Demir Ege Tıknaz", "Kerem Aktürkoğlu", "İrfan Can Kahveci", "Barış Alper Yılmaz", "Arda Güler", "Kenan Yıldız", "Yunus Akgün", "Oğuz Aydın", "Deniz Gül", "Yusuf Sarı", "Can Uzun", "Aral Şimşir"],
    },
    ger: {
      n: "آلمان",
      f: "🇩🇪",
      p: ["Manuel Neuer", "Antonio Rüdiger", "Waldemar Anton", "Jonathan Tah", "Aleksandar Pavlović", "Joshua Kimmich", "Kai Havertz", "Leon Goretzka", "Jamie Leweling", "Jamal Musiala", "Nick Woltemade", "Oliver Baumann", "Pascal Groß", "Maximilian Beier", "Nico Schlotterbeck", "Angelo Stiller", "Florian Wirtz", "Nathaniel Brown", "Leroy Sané", "Nadiem Amiri", "Alexander Nübel", "David Raum", "Felix Nmecha", "Malick Thiaw", "Lennart Karl", "Deniz Undav"],
    },
    cuw: {
      n: "کوراسائو",
      f: "🇨🇼",
      p: ["Eloy Room", "Shurandy Sambo", "Juriën Gaari", "Roshon van Eijma", "Sherel Floranus", "Godfried Roemeratoe", "Juninho Bacuna", "Livano Comenencia", "Jürgen Locadia", "Leandro Bacuna", "Jeremy Antonisse", "Sontje Hansen", "Tyrese Noslin", "Kenji Gorré", "Ar'jany Martha", "Jearl Margaritha", "Brandley Kuwas", "Armando Obispo", "Gervane Kastaneer", "Joshua Brenet", "Tahith Chong", "Kevin Felida", "Riechedly Bazoer", "Deveron Fonville", "Tyrick Bodak", "Trevor Doornbusch"],
    },
    civ: {
      n: "ساحل عاج",
      f: "🇨🇮",
      p: ["Yahia Fofana", "Alban Lafont", "Mohamed Koné", "Ghislain Konan", "Odilon Kossounou", "Wilfried Singo", "Evan Ndicka", "Emmanuel Agbadou", "Guéla Doué", "Ousmane Diomande", "Christopher Opéri", "Franck Kessié", "Jean Michaël Seri", "Ibrahim Sangaré", "Seko Fofana", "Christ Inao Oulaï", "Parfait Guiagon", "Nicolas Pépé", "Oumar Diakité", "Simon Adingra", "Evann Guessand", "Amad Diallo", "Yan Diomande", "Bazoumana Touré", "Elye Wahi", "Ange-Yoan Bonny"],
    },
    ecu: {
      n: "اکوادور",
      f: "🇪🇨",
      p: ["Hernán Galíndez", "Félix Torres", "Piero Hincapié", "Joel Ordóñez", "Jordy Alcívar", "Willian Pacho", "Pervis Estupiñán", "Denil Castillo", "John Yeboah", "Kendry Páez", "Kevin Rodríguez", "Moisés Ramírez", "Enner Valencia", "Alan Minda", "Pedro Vite", "Anthony Valencia", "Ángelo Preciado", "Jordy Caicedo", "Gonzalo Plata", "Nilson Angulo", "Alan Franco", "Gonzalo Valle", "Moisés Caicedo", "Yaimar Medina", "Jackson Porozo", "Jeremy Arévalo"],
    },
    ned: {
      n: "هلند",
      f: "🇳🇱",
      p: ["Bart Verbruggen", "Mark Flekken", "Robin Roefs", "Virgil van Dijk", "Denzel Dumfries", "Nathan Aké", "Jurriën Timber", "Micky van de Ven", "Mats Wieffer", "Jan Paul van Hecke", "Jorrel Hato", "Frenkie de Jong", "Marten de Roon", "Tijjani Reijnders", "Teun Koopmeiners", "Ryan Gravenberch", "Justin Kluivert", "Quinten Timber", "Guus Til", "Memphis Depay", "Wout Weghorst", "Donyell Malen", "Cody Gakpo", "Noa Lang", "Brian Brobbey", "Crysencio Summerville"],
    },
    jpn: {
      n: "ژاپن",
      f: "🇯🇵",
      p: ["Zion Suzuki", "Yukinari Sugawara", "Shōgo Taniguchi", "Kō Itakura", "Yūto Nagatomo", "Wataru Endo", "Ao Tanaka", "Takefusa Kubo", "Keisuke Gotō", "Ritsu Dōan", "Daizen Maeda", "Keisuke Ōsako", "Keito Nakamura", "Junya Itō", "Daichi Kamada", "Tsuyoshi Watanabe", "Yuito Suzuki", "Ayase Ueda", "Kōki Ogawa", "Ayumu Seko", "Hiroki Itō", "Takehiro Tomiyasu", "Tomoki Hayakawa", "Kaishū Sano", "Junnosuke Suzuki", "Kento Shiogai"],
    },
    swe: {
      n: "سوئد",
      f: "🇸🇪",
      p: ["Jacob Widell Zetterström", "Gustaf Lagerbielke", "Victor Lindelöf", "Isak Hien", "Gabriel Gudmundsson", "Herman Johansson", "Lucas Bergvall", "Daniel Svensson", "Alexander Isak", "Benjamin Nygren", "Anthony Elanga", "Viktor Johansson", "Ken Sema", "Hjalmar Ekdal", "Carl Starfelt", "Jesper Karlström", "Viktor Gyökeres", "Yasin Ayari", "Mattias Svanberg", "Eric Smith", "Alexander Bernhardsson", "Besfort Zeneli", "Kristoffer Nordfeldt", "Elliot Stroud", "Gustaf Nilsson", "Taha Ali"],
    },
    tun: {
      n: "تونس",
      f: "🇹🇳",
      p: ["Aymen Dahmen", "Sabri Ben Hessen", "Mouhib Chamakh", "Montassar Talbi", "Dylan Bronn", "Ali Abdi", "Yan Valery", "Mohamed Amine Ben Hamida", "Moutaz Neffati", "Omar Rekik", "Adem Arous", "Raed Chikhaoui", "Ellyes Skhiri", "Hannibal Mejbri", "Anis Ben Slimane", "Mortadha Ben Ouanes", "Ismaël Gharbi", "Hadj Mahmoud", "Rani Khedira", "Elias Achouri", "Firas Chaouat", "Hazem Mastouri", "Elias Saad", "Sebastian Tounekti", "Khalil Ayari", "Rayan Elloumi"],
    },
    esp: {
      n: "اسپانیا",
      f: "🇪🇸",
      p: ["David Raya", "Marc Pubill", "Álex Grimaldo", "Eric García", "Marcos Llorente", "Mikel Merino", "Ferran Torres", "Fabián Ruiz", "Gavi", "Dani Olmo", "Yéremy Pino", "Pedro Porro", "Joan Garcia", "Aymeric Laporte", "Álex Baena", "Rodri", "Nico Williams", "Martín Zubimendi", "Lamine Yamal", "Pedri", "Mikel Oyarzabal", "Pau Cubarsí", "Unai Simón", "Marc Cucurella", "Víctor Muñoz", "Borja Iglesias"],
    },
    cpv: {
      n: "کیپ‌ورد",
      f: "🇨🇻",
      p: ["Vozinha", "Márcio Rosa", "CJ dos Santos", "Stopira", "Roberto Lopes", "João Paulo", "Diney", "Logan Costa", "Steven Moreira", "Wagner Pina", "Sidny Lopes Cabral", "Kelvin Pires", "Jamiro Monteiro", "Kevin Pina", "Deroy Duarte", "Telmo Arcanjo", "Laros Duarte", "Yannick Semedo", "Ryan Mendes", "Garry Rodrigues", "Willy Semedo", "Jovane Cabral", "Gilson Benchimol", "Dailon Livramento", "Hélio Varela", "Nuno da Costa"],
    },
    ksa: {
      n: "عربستان سعودی",
      f: "🇸🇦",
      p: ["Mohammed Al-Owais", "Nawaf Al-Aqidi", "Ahmed Al-Kassar", "Saud Abdulhamid", "Hassan Al-Tambakti", "Abdulelah Al-Amri", "Nawaf Boushal", "Ali Lajami", "Ali Majrashi", "Hassan Kadesh", "Moteb Al-Harbi", "Jehad Thakri", "Mohammed Abu Al-Shamat", "Salem Al-Dawsari", "Mohamed Kanno", "Nasser Al-Dawsari", "Abdullah Al-Khaibari", "Musab Al-Juwayr", "Ayman Yahya", "Ziyad Al-Johani", "Sultan Mandash", "Alaa Al-Hejji", "Firas Al-Buraikan", "Saleh Al-Shehri", "Abdullah Al-Hamdan", "Khalid Al-Ghannam"],
    },
    uru: {
      n: "اروگوئه",
      f: "🇺🇾",
      p: ["Fernando Muslera", "Sergio Rochet", "Santiago Mele", "José María Giménez", "Matías Viña", "Mathías Olivera", "Guillermo Varela", "Ronald Araújo", "Sebastián Cáceres", "Joaquín Piquerez", "Santiago Bueno", "Rodrigo Bentancur", "Federico Valverde", "Giorgian de Arrascaeta", "Facundo Pellistri", "Manuel Ugarte", "Nicolás de la Cruz", "Brian Rodríguez", "Maximiliano Araújo", "Agustín Canobbio", "Emiliano Martínez", "Rodrigo Zalazar", "Juan Manuel Sanabria", "Darwin Núñez", "Federico Viñas", "Rodrigo Aguirre"],
    },
    bel: {
      n: "بلژیک",
      f: "🇧🇪",
      p: ["Thibaut Courtois", "Senne Lammens", "Mike Penders", "Thomas Meunier", "Timothy Castagne", "Arthur Theate", "Zeno Debast", "Maxim De Cuyper", "Brandon Mechele", "Koni De Winter", "Joaquin Seys", "Nathan Ngoy", "Axel Witsel", "Kevin De Bruyne", "Youri Tielemans", "Hans Vanaken", "Amadou Onana", "Nicolas Raskin", "Romelu Lukaku", "Leandro Trossard", "Jérémy Doku", "Dodi Lukébakio", "Charles De Ketelaere", "Alexis Saelemaekers", "Diego Moreira", "Matias Fernandez-Pardo"],
    },
    egy: {
      n: "مصر",
      f: "🇪🇬",
      p: ["Mohamed El Shenawy", "Mostafa Shobeir", "Mohamed Alaa", "El Mahdy Soliman", "Hamdy Fathy", "Ramy Rabia", "Mohamed Hany", "Ahmed Fatouh", "Mohamed Abdelmonem", "Yasser Ibrahim", "Hossam Abdelmaguid", "Karim Hafez", "Tarek Alaa", "Marwan Attia", "Emam Ashour", "Mohanad Lasheen", "Mahmoud Saber", "Nabil Emad", "Mostafa Ziko", "Mohamed Salah", "Trézéguet", "Zizo", "Omar Marmoush", "Ibrahim Adel", "Haissem Hassan", "Hamza Abdelkarim"],
    },
    irn: {
      n: "ایران",
      f: "<svg xmlns='http://www.w3.org/2000/svg' width='34' height='22' viewBox='0 0 66 42' style='vertical-align:middle;border-radius:3px;overflow:hidden'><rect width='66' height='14' fill='#239f40'/><rect y='14' width='66' height='14' fill='#fff'/><rect y='28' width='66' height='14' fill='#da0000'/><g transform='translate(33,21)'><g stroke='#d99500' stroke-width='1.3' stroke-linecap='round'><line x1='0' y1='-6' x2='0' y2='-9.2'/><line x1='4.2' y1='-4.2' x2='6.5' y2='-6.5'/><line x1='6' y1='0' x2='9.2' y2='0'/><line x1='4.2' y1='4.2' x2='6.5' y2='6.5'/><line x1='0' y1='6' x2='0' y2='9.2'/><line x1='-4.2' y1='4.2' x2='-6.5' y2='6.5'/><line x1='-6' y1='0' x2='-9.2' y2='0'/><line x1='-4.2' y1='-4.2' x2='-6.5' y2='-6.5'/></g><circle r='6' fill='#f3b400'/><g fill='#7a5512'><ellipse cx='0.6' cy='1.6' rx='3.5' ry='2.1'/><circle cx='-2.9' cy='-0.2' r='2'/><path d='M2.2 -0.6 L5.2 -4.2 L4.1 -0.2 Z'/><rect x='-2.3' y='3.1' width='1' height='2.3'/><rect x='1.5' y='3.1' width='1' height='2.3'/><path d='M3.5 0.9 q3.2 -1 2.5 -4.2' stroke='#7a5512' stroke-width='0.9' fill='none'/></g></g></svg>",
      p: ["Alireza Beiranvand", "Payam Niazmand", "Hossein Hosseini", "Ehsan Hajsafi", "Milad Mohammadi", "Ramin Rezaeian", "Hossein Kanaanizadegan", "Shojae Khalilzadeh", "Saleh Hardani", "Ali Nemati", "Danial Eiri", "Alireza Jahanbakhsh", "Saeid Ezatolahi", "Saman Ghoddos", "Mehdi Torabi", "Rouzbeh Cheshmi", "Mohammad Mohebi", "Mehdi Ghayedi", "Mohammad Ghorbani", "Aria Yousefi", "Amirmohammad Razzaghinia", "Mehdi Taremi", "Shahriyar Moghanlou", "Amirhossein Hosseinzadeh", "Ali Alipour", "Dennis Eckert"],
    },
    nzl: {
      n: "نیوزیلند",
      f: "🇳🇿",
      p: ["Max Crocombe", "Tim Payne", "Francis de Vries", "Tyler Bindon", "Michael Boxall", "Joe Bell", "Matthew Garbett", "Marko Stamenić", "Chris Wood", "Sarpreet Singh", "Elijah Just", "Alex Paulsen", "Liberato Cacace", "Alex Rufer", "Nando Pijnaker", "Finn Surman", "Kosta Barbarouses", "Ben Waine", "Ben Old", "Callum McCowatt", "Jesse Randall", "Michael Woud", "Ryan Thomas", "Callan Elliot", "Lachlan Bayliss", "Tommy Smith"],
    },
    fra: {
      n: "فرانسه",
      f: "🇫🇷",
      p: ["Brice Samba", "Malo Gusto", "Lucas Digne", "Dayot Upamecano", "Jules Koundé", "Manu Koné", "Ousmane Dembélé", "Aurélien Tchouaméni", "Marcus Thuram", "Kylian Mbappé", "Michael Olise", "Bradley Barcola", "N'Golo Kanté", "Adrien Rabiot", "Ibrahima Konaté", "Mike Maignan", "William Saliba", "Warren Zaïre-Emery", "Théo Hernandez", "Désiré Doué", "Lucas Hernandez", "Jean-Philippe Mateta", "Robin Risser", "Rayan Cherki", "Maghnes Akliouche", "Maxence Lacroix"],
    },
    sen: {
      n: "سنگال",
      f: "🇸🇳",
      p: ["Édouard Mendy", "Mory Diaw", "Yehvann Diouf", "Kalidou Koulibaly", "Krépin Diatta", "Moussa Niakhaté", "Ismail Jakobs", "Abdoulaye Seck", "El Hadji Malick Diouf", "Mamadou Sarr", "Antoine Mendy", "Ilay Camara", "Moustapha Mbow", "Idrissa Gueye", "Pape Gueye", "Pape Matar Sarr", "Lamine Camara", "Pathé Ciss", "Habib Diarra", "Bara Sapoko Ndiaye", "Sadio Mané", "Ismaïla Sarr", "Iliman Ndiaye", "Nicolas Jackson", "Bamba Dieng", "Cherif Ndiaye", "Ibrahim Mbaye", "Assane Diao"],
    },
    irq: {
      n: "عراق",
      f: "🇮🇶",
      p: ["Jalal Hassan", "Fahad Talib", "Ahmed Basil", "Rebin Sulaka", "Manaf Younis", "Merchas Doski", "Zaid Tahseen", "Frans Putros", "Hussein Ali", "Ahmed Yahya", "Mustafa Saadoon", "Akam Hashim", "Ibrahim Bayesh", "Amir Al-Ammari", "Ali Jasim", "Youssef Amyn", "Zidane Iqbal", "Marko Farji", "Kevin Yakob", "Aimar Sher", "Zaid Ismail", "Ahmed Qasem", "Aymen Hussein", "Mohanad Ali", "Ali Al-Hamadi", "Ali Yousif"],
    },
    nor: {
      n: "نروژ",
      f: "🇳🇴",
      p: ["Ørjan Nyland", "Morten Thorsby", "Kristoffer Ajer", "Leo Østigård", "David Møller Wolfe", "Patrick Berg", "Alexander Sørloth", "Sander Berge", "Erling Haaland", "Martin Ødegaard", "Jørgen Strand Larsen", "Sander Tangvik", "Egil Selvik", "Fredrik Aursnes", "Fredrik André Bjørkan", "Marcus Holmgren Pedersen", "Torbjørn Heggem", "Kristian Thorstvedt", "Thelo Aasgaard", "Antonio Nusa", "Andreas Schjelderup", "Oscar Bobb", "Jens Petter Hauge", "Sondre Langås", "Henrik Falchener", "Julian Ryerson"],
    },
    arg: {
      n: "آرژانتین",
      f: "🇦🇷",
      p: ["Juan Musso", "Leonardo Balerdi", "Nicolás Tagliafico", "Gonzalo Montiel", "Leandro Paredes", "Lisandro Martínez", "Rodrigo De Paul", "Valentín Barco", "Julián Alvarez", "Lionel Messi", "Giovani Lo Celso", "Gerónimo Rulli", "Cristian Romero", "Exequiel Palacios", "Nicolás González", "Thiago Almada", "Giuliano Simeone", "Nico Paz", "Nicolás Otamendi", "Alexis Mac Allister", "José Manuel López", "Lautaro Martínez", "Emiliano Martínez", "Enzo Fernández", "Facundo Medina", "Nahuel Molina"],
    },
    alg: {
      n: "الجزایر",
      f: "🇩🇿",
      p: ["Luca Zidane", "Oussama Benbot", "Melvin Mastil", "Aïssa Mandi", "Ramy Bensebaini", "Mohamed Amine Tougai", "Rayan Aït-Nouri", "Jaouen Hadjam", "Rafik Belghali", "Zineddine Belaïd", "Achref Abada", "Samir Chergui", "Nabil Bentaleb", "Ramiz Zerrouki", "Hicham Boudaoui", "Farès Chaïbi", "Houssem Aouar", "Ibrahim Maza", "Yacine Titraoui", "Riyad Mahrez", "Mohamed Amoura", "Amine Gouiri", "Anis Hadj Moussa", "Adil Boulbina", "Nadhir Benbouali", "Farès Ghedjemis"],
    },
    aut: {
      n: "اتریش",
      f: "🇦🇹",
      p: ["Alexander Schlager", "David Affengruber", "Kevin Danso", "Xaver Schlager", "Stefan Posch", "Nicolas Seiwald", "Marko Arnautović", "David Alaba", "Marcel Sabitzer", "Florian Grillitsch", "Michael Gregoritsch", "Florian Wiegele", "Patrick Pentz", "Saša Kalajdžić", "Philipp Lienhart", "Phillipp Mwene", "Carney Chukwuemeka", "Romano Schmid", "Christoph Baumgartner", "Konrad Laimer", "Patrick Wimmer", "Alexander Prass", "Marco Friedl", "Paul Wanner", "Michael Svoboda", "Alessandro Schöpf"],
    },
    jor: {
      n: "اردن",
      f: "🇯🇴",
      p: ["Yazeed Abulaila", "Abdallah Al-Fakhouri", "Nour Bani Attiah", "Ihsan Haddad", "Yazan Al-Arab", "Abdallah Nasib", "Saed Al-Rosan", "Husam Abu Dahab", "Mo Abualnadi", "Salim Obaid", "Anas Badawi", "Rajaei Ayed", "Noor Al-Rawabdeh", "Ibrahim Sadeh", "Mohammad Abu Hashish", "Nizar Al-Rashdan", "Mohannad Abu Taha", "Amer Jamous", "Mohammad Al-Dawoud", "Yousef Qashi", "Mohammad Taha", "Musa Al-Taamari", "Mahmoud Al-Mardi", "Ali Olwan", "Mohammad Abu Zrayq", "Odeh Al-Fakhouri", "Ibrahim Sabra", "Ali Azaizeh"],
    },
    por: {
      n: "پرتغال",
      f: "🇵🇹",
      p: ["Diogo Costa", "José Sá", "Rui Silva", "Rúben Dias", "João Cancelo", "Nélson Semedo", "Nuno Mendes", "Diogo Dalot", "Gonçalo Inácio", "Matheus Nunes", "Renato Veiga", "Tomás Araújo", "Bernardo Silva", "Bruno Fernandes", "Rúben Neves", "Vitinha", "João Neves", "Samú Costa", "Cristiano Ronaldo", "João Félix", "Rafael Leão", "Gonçalo Guedes", "Gonçalo Ramos", "Pedro Neto", "Francisco Trincão", "Francisco Conceição"],
    },
    cod: {
      n: "کنگو دموکراتیک",
      f: "🇨🇩",
      p: ["Lionel Mpasi", "Timothy Fayulu", "Matthieu Epolo", "Chancel Mbemba", "Arthur Masuaku", "Gédéon Kalulu", "Joris Kayembe", "Dylan Batubinsika", "Axel Tuanzebe", "Aaron Wan-Bissaka", "Steve Kapuadi", "Samuel Moutoussamy", "Edo Kayembe", "Charles Pickel", "Gaël Kakuta", "Noah Sadiki", "Aaron Tshibola", "Ngal'ayel Mukau", "Brian Cipenga", "Cédric Bakambu", "Meschak Elia", "Théo Bongonda", "Fiston Mayele", "Yoane Wissa", "Nathanaël Mbuku", "Simon Banza"],
    },
    uzb: {
      n: "ازبکستان",
      f: "🇺🇿",
      p: ["Utkir Yusupov", "Abduvohid Nematov", "Botirali Ergashev", "Rustam Ashurmatov", "Farrukh Sayfiev", "Khojiakbar Alijonov", "Sherzod Nasrullaev", "Umar Eshmurodov", "Abdukodir Khusanov", "Abdulla Abdullaev", "Bekhruz Karimov", "Jakhongir Urozov", "Avazbek Ulmasaliev", "Otabek Shukurov", "Odiljon Hamrobekov", "Jamshid Iskanderov", "Akmal Mozgovoy", "Azizjon Ganiev", "Jasurbek Jaloliddinov", "Umarali Rakhmonaliev", "Sherzod Esanov", "Eldor Shomurodov", "Igor Sergeev", "Jaloliddin Masharipov", "Oston Urunov", "Dostonbek Khamdamov", "Abbosbek Fayzullaev", "Azizbek Amonov", "Ruslanbek Jiyanov", "Sherzod Temirov"],
    },
    col: {
      n: "کلمبیا",
      f: "🇨🇴",
      p: ["David Ospina", "Camilo Vargas", "Álvaro Montero", "Davinson Sánchez", "Santiago Arias", "Yerry Mina", "Daniel Muñoz", "Johan Mojica", "Jhon Lucumí", "Deiver Machado", "Willer Ditta", "James Rodríguez", "Jefferson Lerma", "Juan Fernando Quintero", "Jhon Arias", "Richard Ríos", "Kevin Castaño", "Jorge Carrascal", "Jaminton Campaz", "Juan Portilla", "Gustavo Puerta", "Luis Díaz", "Jhon Córdoba", "Luis Suárez", "Cucho Hernández", "Andrés Gómez"],
    },
    eng: {
      n: "انگلیس",
      f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      p: ["Jordan Pickford", "Dean Henderson", "James Trafford", "John Stones", "Marc Guéhi", "Reece James", "Ezri Konsa", "Dan Burn", "Tino Livramento", "Djed Spence", "Nico O'Reilly", "Jarell Quansah", "Jordan Henderson", "Declan Rice", "Jude Bellingham", "Morgan Rogers", "Kobbie Mainoo", "Elliot Anderson", "Harry Kane", "Marcus Rashford", "Bukayo Saka", "Ollie Watkins", "Anthony Gordon", "Eberechi Eze", "Noni Madueke", "Ivan Toney"],
    },
    cro: {
      n: "کرواسی",
      f: "🇭🇷",
      p: ["Dominik Livaković", "Dominik Kotarski", "Ivor Pandur", "Joško Gvardiol", "Duje Ćaleta-Car", "Josip Šutalo", "Josip Stanišić", "Marin Pongračić", "Martin Erlić", "Luka Vušković", "Luka Modrić", "Mateo Kovačić", "Mario Pašalić", "Nikola Vlašić", "Luka Sučić", "Martin Baturina", "Kristijan Jakić", "Petar Sučić", "Nikola Moro", "Toni Fruk", "Ivan Perišić", "Andrej Kramarić", "Ante Budimir", "Marco Pašalić", "Petar Musa", "Igor Matanović"],
    },
    gha: {
      n: "غنا",
      f: "🇬🇭",
      p: ["Lawrence Ati-Zigi", "Benjamin Asare", "Joseph Anang", "Abdul Rahman Baba", "Gideon Mensah", "Alidu Seidu", "Jerome Opoku", "Jonas Adjetey", "Abdul Mumin", "Kojo Peprah Oppong", "Derrick Luckassen", "Marvin Senaya", "Thomas Partey", "Abdul Fatawu", "Elisha Owusu", "Caleb Yirenkyi", "Kwasi Sibo", "Augustine Boakye", "Jordan Ayew", "Antoine Semenyo", "Kamaldeen Sulemana", "Iñaki Williams", "Ernest Nuamah", "Christopher Bonsu Baah", "Brandon Thomas-Asante", "Prince Kwabena Adu"],
    },
    pan: {
      n: "پاناما",
      f: "🇵🇦",
      p: ["Luis Mejía", "Orlando Mosquera", "César Samudio", "Eric Davis", "Fidel Escobar", "Michael Amir Murillo", "Roderick Miller", "Andrés Andrade", "César Blackman", "José Córdoba", "Jiovany Ramos", "Jorge Gutiérrez", "Edgardo Fariña", "Aníbal Godoy", "Alberto Quintero", "Yoel Bárcenas", "Adalberto Carrasquilla", "José Luis Rodríguez", "Cristian Martínez", "César Yanis", "Carlos Harvey", "Azarias Londoño", "José Fajardo", "Ismael Díaz", "Cecilio Waterman", "Tomás Rodríguez"],
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

  /* ============================================================
     بازی‌های مرحلهٔ یک‌شانزدهم نهایی (Round of 16)
     تاریخ‌ها بر اساس UTC — مرورگر به ساعت محلی تبدیل می‌کند
     ============================================================ */
  // تیم‌هایی که هنوز مشخص نشده‌اند با رشتهٔ توصیفی مشخص می‌شوند
  const R16_TEAMS = {
    "rsa-can-w": { n: "برنده آفریقای جنوبی / کانادا", f: "🏆" },
    "bra-jpn-w": { n: "برنده برزیل / ژاپن", f: "🏆" },
    "ger-par-w": { n: "برنده آلمان / پاراگوئه", f: "🏆" },
    "ned-mar-w": { n: "برنده هلند / مراکش", f: "🏆" },
    "civ-nor-w": { n: "برنده ساحل عاج / نروژ", f: "🏆" },
    "fra-swe-w": { n: "برنده فرانسه / سوئد", f: "🏆" },
    "mex-ecu-w": { n: "برنده مکزیک / اکوادور", f: "🏆" },
    "eng-cog-w": { n: "برنده انگلیس / کنگو", f: "🏆" },
    "bel-sen-w": { n: "برنده بلژیک / سنگال", f: "🏆" },
    "usa-bos-w": { n: "برنده آمریکا / بوسنی", f: "🏆" },
    "esp-aut-w": { n: "برنده اسپانیا / اتریش", f: "🏆" },
    "por-cro-w": { n: "برنده پرتغال / کرواسی", f: "🏆" },
    "sui-alg-w": { n: "برنده سوئیس / الجزایر", f: "🏆" },
    "aus-egy-w": { n: "برنده استرالیا / مصر", f: "🏆" },
    "arg-cpv-w": { n: "برنده آرژانتین / کیپ‌ورد", f: "🏆" },
    "col-gha-w": { n: "برنده کلمبیا / غنا", f: "🏆" },
  };

  // اطلاعات تیم‌ها را از TEAMS می‌گیریم؛ اگر تیم مشخص نشده بود، از R16_TEAMS استفاده می‌کنیم
  function r16Team(code) {
    return TEAMS[code] || R16_TEAMS[code] || { n: code, f: "🏟️" };
  }

  const R16_MATCHES = [
    // یکشنبه ۷ تیر = Sunday, June 28 — آفریقای جنوبی / کانادا  22:30 ایران = 19:00 UTC
    ["r16m1",  "rsa", "can", "2026-06-28T19:00:00Z", "استادیوم TBD"],
    // دوشنبه ۸ تیر = Monday, June 29 — برزیل / ژاپن  20:30 ایران = 17:00 UTC
    ["r16m2",  "bra", "jpn", "2026-06-29T17:00:00Z", "استادیوم TBD"],
    // سه‌شنبه ۹ تیر = Tuesday, June 30 — آلمان / پاراگوئه  00:00 ایران = 20:30 UTC روز قبل
    ["r16m3",  "ger", "par", "2026-06-29T20:30:00Z", "استادیوم TBD"],
    // سه‌شنبه ۹ تیر = Tuesday, June 30 — هلند / مراکش  04:30 ایران = 01:00 UTC
    ["r16m4",  "ned", "mar", "2026-06-30T01:00:00Z", "استادیوم TBD"],
    // سه‌شنبه ۹ تیر = Tuesday, June 30 — ساحل عاج / نروژ  20:30 ایران = 17:00 UTC
    ["r16m5",  "civ", "nor", "2026-06-30T17:00:00Z", "استادیوم TBD"],
    // چهارشنبه ۱۰ تیر = Wednesday, July 1 — فرانسه / سوئد  00:30 ایران = 21:00 UTC روز قبل
    ["r16m6",  "fra", "swe", "2026-06-30T21:00:00Z", "استادیوم TBD"],
    // چهارشنبه ۱۰ تیر = Wednesday, July 1 — مکزیک / اکوادور  04:30 ایران = 01:00 UTC
    ["r16m7",  "mex", "ecu", "2026-07-01T01:00:00Z", "استادیوم TBD"],
    // چهارشنبه ۱۰ تیر = Wednesday, July 1 — انگلیس / جمهوری کنگو  19:30 ایران = 16:00 UTC
    ["r16m8",  "eng", "cod", "2026-07-01T16:00:00Z", "استادیوم TBD"],
    // چهارشنبه ۱۰ تیر = Wednesday, July 1 — بلژیک / سنگال  23:30 ایران = 20:00 UTC
    ["r16m9",  "bel", "sen", "2026-07-01T20:00:00Z", "استادیوم TBD"],
    // پنج‌شنبه ۱۱ تیر = Thursday, July 2 — آمریکا / بوسنی  03:30 ایران = 00:00 UTC
    ["r16m10", "usa", "bih", "2026-07-02T00:00:00Z", "استادیوم TBD"],
    // پنج‌شنبه ۱۱ تیر = Thursday, July 2 — اسپانیا / اتریش  22:30 ایران = 19:00 UTC
    ["r16m11", "esp", "aut", "2026-07-02T19:00:00Z", "استادیوم TBD"],
    // جمعه ۱۲ تیر = Friday, July 3 — پرتغال / کرواسی  02:30 ایران = 23:00 UTC روز قبل
    ["r16m12", "por", "cro", "2026-07-02T23:00:00Z", "استادیوم TBD"],
    // جمعه ۱۲ تیر = Friday, July 3 — سوئیس / الجزایر  06:30 ایران = 03:00 UTC
    ["r16m13", "sui", "alg", "2026-07-03T03:00:00Z", "استادیوم TBD"],
    // جمعه ۱۲ تیر = Friday, July 3 — استرالیا / مصر  21:30 ایران = 18:00 UTC
    ["r16m14", "aus", "egy", "2026-07-03T18:00:00Z", "استادیوم TBD"],
    // شنبه ۱۳ تیر = Saturday, July 4 — آرژانتین / کیپ‌ورد  01:30 ایران = 22:00 UTC روز قبل
    ["r16m15", "arg", "cpv", "2026-07-03T22:00:00Z", "استادیوم TBD"],
    // شنبه ۱۳ تیر = Saturday, July 4 — کلمبیا / غنا  05:00 ایران = 01:30 UTC
    ["r16m16", "col", "gha", "2026-07-04T01:30:00Z", "استادیوم TBD"],
  ].map(function (x) {
    return {
      id: x[0],
      stage: "R16",
      home: x[1],
      away: x[2],
      dt: x[3],
      venue: x[4],
    };
  });

  const R16_MATCH_BY_ID = {};
  R16_MATCHES.forEach(function (m) {
    R16_MATCH_BY_ID[m.id] = m;
    MATCH_BY_ID[m.id] = m; // به MATCH_BY_ID هم اضافه می‌کنیم تا سرور بتواند نتایج را ثبت کند
  });

  /* ============================================================
     بازی‌های مرحلهٔ یک‌هشتم نهایی (Round of 16 — ۸ بازی)
     تاریخ‌ها میلادی و بر اساس UTC — مرورگر به ساعت محلی تبدیل می‌کند
     در کامنت هر خط، ساعت به وقت برلین (CEST = UTC+2) آمده است
     ============================================================ */
  const R8_MATCHES = [
    // Saturday, July 4 — کانادا / مراکش — 19:00 برلین = 17:00 UTC
    ["r8m1", "can", "mar", "2026-07-04T17:00:00Z", "استادیوم TBD"],
    // Saturday, July 4 — پاراگوئه / فرانسه — 23:00 برلین = 21:00 UTC
    ["r8m2", "par", "fra", "2026-07-04T21:00:00Z", "استادیوم TBD"],
    // Sunday, July 5 — برزیل / نروژ — 22:00 برلین = 20:00 UTC
    ["r8m3", "bra", "nor", "2026-07-05T20:00:00Z", "استادیوم TBD"],
    // Monday, July 6 — مکزیک / انگلیس — 02:00 برلین = 00:00 UTC
    ["r8m4", "mex", "eng", "2026-07-06T00:00:00Z", "استادیوم TBD"],
    // Monday, July 6 — اسپانیا / پرتغال — 21:00 برلین = 19:00 UTC
    ["r8m5", "esp", "por", "2026-07-06T19:00:00Z", "استادیوم TBD"],
    // Tuesday, July 7 — بلژیک / آمریکا — 02:00 برلین = 00:00 UTC
    ["r8m6", "bel", "usa", "2026-07-07T00:00:00Z", "استادیوم TBD"],
    // Tuesday, July 7 — مصر / آرژانتین — 18:00 برلین = 16:00 UTC
    ["r8m7", "egy", "arg", "2026-07-07T16:00:00Z", "استادیوم TBD"],
    // Tuesday, July 7 — سوئیس / کلمبیا — 22:00 برلین = 20:00 UTC
    ["r8m8", "sui", "col", "2026-07-07T20:00:00Z", "استادیوم TBD"],
  ].map(function (x) {
    return {
      id: x[0],
      stage: "R8",
      home: x[1],
      away: x[2],
      dt: x[3],
      venue: x[4],
    };
  });

  const R8_MATCH_BY_ID = {};
  R8_MATCHES.forEach(function (m) {
    R8_MATCH_BY_ID[m.id] = m;
    MATCH_BY_ID[m.id] = m; // برای ثبت پیش‌بینی و نتیجه در سرور
  });

  /* ============================================================
     بازی‌های مرحلهٔ یک‌چهارم نهایی (Quarter-finals — ۴ بازی)
     تاریخ‌ها میلادی و بر اساس UTC — مرورگر به ساعت محلی تبدیل می‌کند
     در کامنت هر خط ساعت به وقت ایران (UTC+3:30) و برلین (CEST = UTC+2) آمده است
     ============================================================ */
  const R4_MATCHES = [
    // Thursday, July 9 — فرانسه / مراکش — 23:30 ایران = 22:00 برلین = 20:00 UTC
    ["r4m1", "fra", "mar", "2026-07-09T20:00:00Z", "استادیوم TBD"],
    // Friday, July 10 — اسپانیا / بلژیک — 22:30 ایران = 21:00 برلین = 19:00 UTC
    ["r4m2", "esp", "bel", "2026-07-10T19:00:00Z", "استادیوم TBD"],
    // Sunday, July 12 — نروژ / انگلیس — 00:30 ایران = 23:00 برلین (شنبه) = 21:00 UTC (شنبه ۱۱ ژوئیه)
    ["r4m3", "nor", "eng", "2026-07-11T21:00:00Z", "استادیوم TBD"],
    // Sunday, July 12 — آرژانتین / سوئیس — 04:30 ایران = 03:00 برلین = 01:00 UTC
    ["r4m4", "arg", "sui", "2026-07-12T01:00:00Z", "استادیوم TBD"],
  ].map(function (x) {
    return {
      id: x[0],
      stage: "R4",
      home: x[1],
      away: x[2],
      dt: x[3],
      venue: x[4],
    };
  });

  const R4_MATCH_BY_ID = {};
  R4_MATCHES.forEach(function (m) {
    R4_MATCH_BY_ID[m.id] = m;
    MATCH_BY_ID[m.id] = m; // برای ثبت پیش‌بینی و نتیجه در سرور
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
  // کلیدِ تطبیق نام گلزن: بی‌اعتنا به علامت‌های حروف، بزرگی/کوچکی، نقطه/خط‌فاصله/فاصله
  // مثال: «Vinícius Júnior» = «Vinicius Junior» = «vinicius  junior»
  function scKey(s) {
    return (s == null ? "" : String(s))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // حذف علامت‌های ترکیبی (é→e, í→i, ç→c, ğ→g, …)
      .toLowerCase()
      .replace(/ø/g, "o").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ð/g, "d")
      .replace(/ı/g, "i").replace(/ß/g, "ss").replace(/æ/g, "ae").replace(/œ/g, "oe")
      .replace(/[’'`´.\-_]/g, " ") // علامت‌های جداکننده → فاصله
      .replace(/[^a-z0-9 ]/g, " ") // هر چیز دیگر → فاصله
      .replace(/\s+/g, " ")
      .trim();
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
    var actual = (res.s || []).map(scKey);
    var predNames = (pred.s || []).filter(Boolean).map(scKey);
    // شمارش با احتساب تکرار: هر گلِ واقعی فقط یک‌بار «مصرف» می‌شود.
    // پس پیش‌بینیِ دو گل برای یک بازیکن (مثلاً مسی در هر دو فیلد) تنها زمانی
    // ۲ بار امتیاز می‌گیرد که آن بازیکن واقعاً ۲ گل زده باشد؛ در غیر این صورت
    // یک‌بار. این کار هم دابل (برِیس) را درست امتیاز می‌دهد و هم قابل سوءاستفاده نیست.
    var pool = actual.slice();
    var hits = 0;
    predNames.forEach(function (n) {
      var idx = pool.indexOf(n);
      if (idx >= 0) {
        hits++;
        pool.splice(idx, 1);
      }
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
    var allMatches = MATCHES.concat(R16_MATCHES).concat(R8_MATCHES).concat(R4_MATCHES);
    var rows = users.map(function (u) {
      var p = preds[u.id] || {};
      var total = 0,
        exact = 0,
        team = 0,
        outcome = 0,
        scorers = 0,
        played = 0;
      allMatches.forEach(function (m) {
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
    R16_MATCHES,
    R16_MATCH_BY_ID,
    R8_MATCHES,
    R8_MATCH_BY_ID,
    R4_MATCHES,
    R4_MATCH_BY_ID,
    r16Team,
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
