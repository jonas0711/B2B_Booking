# Vejledning til Opsætning og Kørsel af B2B Booking System

Velkommen til B2B Booking Systemet. Denne guide er designet til at hjælpe dig, en bruger uden teknisk erfaring, med at få programmet kørende på din Macbook Pro. Følg venligst hvert trin nøje.

---

### Kort om Applikationen

Dette program er et internt bookingsystem for Nordisk Film. Det giver dig mulighed for at:
- Se en oversigt over alle bookinger i et dashboard.
- Oprette nye bookinger.
- Redigere eksisterende bookinger.

Systemet består af to dele, der skal køre samtidigt i to separate terminalvinduer:
1.  **Backend**: Serveren, der håndterer al logik og data (skrevet i Python).
2.  **Frontend**: Den hjemmeside, du ser og interagerer med i din browser (skrevet i JavaScript).

---

### Del 1: Forberedelse – Installation af Værktøjer

Før du kan køre programmet, skal du installere nogle grundlæggende udviklingsværktøjer. Det gøres nemmest via **Terminalen**.

**Hvad er Terminalen?**
Terminalen er et program på din Mac, hvor du kan indtaste kommandoer for at styre computeren direkte. Du finder den i mappen `Programmer -> Hjælpeprogrammer` eller ved at søge efter "Terminal" med Spotlight (🔍-ikonet øverst til højre på skærmen).

**Trin 1: Åbn Terminal**
1.  Klik på 🔍-ikonet øverst til højre.
2.  Skriv `Terminal` og tryk på Enter.
3.  Et hvidt vindue med tekst vil nu åbne. Her skal du indtaste kommandoerne fra denne guide. Tryk Enter efter hver kommando for at udføre den.

**Trin 2: Installer Homebrew**
Homebrew er et værktøj, der gør det meget nemt at installere anden software på din Mac.
1.  Kopiér hele kommandoen herunder.
2.  Indsæt den i Terminal-vinduet og tryk på Enter.

    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
3.  Installationen kan bede dig om dit computer-password. Det er normalt. Skriv dit password og tryk Enter. **Bemærk:** Du vil ikke kunne se tegnene, mens du skriver. Det er en sikkerhedsfunktion.
4.  Vent til installationen er færdig. Det kan tage et par minutter.

**Trin 3: Installer Git, Python og Node.js**
Nu skal vi bruge Homebrew til at installere de tre programmer, vi skal bruge: Git (til at hente koden), Python (til backend) og Node.js (til frontend).

1.  Indtast følgende kommando i Terminalen og tryk Enter:
    ```bash
    brew install git python node
    ```
2.  Vent til installationen er færdig. Dette kan også tage et par minutter.

---

### Del 2: Hentning af Koden

Nu hvor værktøjerne er installeret, skal du hente selve programkoden fra GitHub.

**Trin 1: Gå til din Skrivebordsmappe**
Vi henter koden til dit skrivebord for nemheds skyld.
1.  Skriv følgende kommando i Terminalen og tryk Enter:
    ```bash
    cd Desktop
    ```

**Trin 2: Klon Projektet fra GitHub**
Denne kommando downloader en kopi af projektet til din computer.
1.  Kør kommandoen i Terminalen:

    ```bash
    git clone https://github.com/jonas0711/B2B_Booking.git
    ```

2.  Når den er færdig, vil der ligge en ny mappe ved navn `B2B` på dit skrivebord.

**Trin 3: Gå ind i Projektmappen**
1.  Skriv følgende i Terminalen for at gå ind i den nye mappe:
    ```bash
    cd B2B
    ```
    Du er nu klar til at starte programmerne.

---

### Del 3: Start Backend-serveren

Backend'en er programmets "hjerne". Den skal startes først.

1.  **Gå til Backend-mappen**. Du står allerede i `B2B`-mappen. Skriv nu:
    ```bash
    cd Backend
    ```
2.  **Installer Python-pakker**. Disse er specifikke hjælpeværktøjer, som backend'en bruger.
    ```bash
    pip3 install -r requirements.txt
    ```
3.  **Start serveren**.
    ```bash
    python3 app.py
    ```
4.  Du vil nu se noget output i terminalen, som indikerer, at serveren kører. Den vil muligvis skrive, at den kører på `http://127.0.0.1:5000`.

**VIGTIGT:** Lad dette terminalvindue være åbent! Hvis du lukker det, stopper backend-serveren, og programmet vil ikke virke.

---

### Del 4: Start Frontend-serveren

Frontend'en er den hjemmeside, du interagerer med. Den skal køre i sit eget, separate terminalvindue.

1.  **Åbn et nyt Terminal-vindue**.
    *   Klik på `Shell` i menubaren øverst på skærmen og vælg `Nyt vindue` -> `Nyt vindue med profil - Basic`.

2.  **Gå til projektmappen i det nye vindue**. Ligesom før skal vi navigere til den korrekte mappe.
    ```bash
    cd Desktop/B2B/Frontend
    ```
3.  **Installer Node-pakker**.
    ```bash
    npm install
    ```
4.  **Start serveren**.
    ```bash
    node server.js
    ```
5.  Du vil nu se en boks af tekst i terminalen, der bekræfter, at frontend-serveren er startet og kører på `http://localhost:3000`.

**VIGTIGT:** Lad også dette terminalvindue være åbent. Hvis du lukker det, stopper hjemmesiden. Du skal altså have **to** terminalvinduer åbne hele tiden.

---

### Del 5: Åbn Applikationen

Nu hvor begge servere kører, kan du endelig åbne programmet.

1.  Åbn din foretrukne webbrowser (f.eks. Safari, Google Chrome).
2.  I adressefeltet øverst skriver du:
    ```
    http://localhost:3000
    ```
3.  Tryk Enter. Du skulle nu se booking-systemets forside.

Tillykke! Du har nu fået programmet til at køre lokalt på din computer.

---

### Afslutning

Når du er færdig med at bruge programmet, kan du stoppe de to servere ved at gå til hvert terminalvindue og trykke på `Control` + `C` på dit tastatur. 
