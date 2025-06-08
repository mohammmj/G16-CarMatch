# G16-CarMatch

CarMatch är en webbapplikation som hjälper användare att hitta sin perfekta bil genom en personlig sökupplevelse med matchningsprocentberäkning baserat på användarens preferenser.

## Översikt

CarMatch erbjuder en komplett bilsökningsupplevelse med följande funktioner:

* **Avancerad bilsökning** - Söka efter bilar baserat på flera anpassningsbara kriterier
* **Intelligent matchning** - Se sökresultat med personliga matchningsprocent baserat på dina preferenser
* **Jämförelse** - Jämföra flera fordon sida vid sida i detaljerade tabeller
* **Favorithantering** - Spara och hantera dina favoritfordon
* **Användarhantering** - Skapa användarkonton, logga in och hantera din profil
* **Responsiv design** - Fungerar perfekt på både desktop och mobila enheter

## Projektstruktur

Projektet följer en modern klient-server-arkitektur med tydlig separation mellan frontend och backend:

* **Backend** - Node.js server med Express och PostgreSQL
    * config/db.js - Databasanslutning
    * models/ - Användar- och favorithantering
    * routes/ - API-endpoints för autentisering, sökning och favoriter
    * server.js - Huvudserver

* **Frontend** - HTML5, CSS3 och vanilla JavaScript
    * css/style.css - Huvudstil
    * js/ - Modulärt JavaScript för alla funktioner
    * HTML-sidor för alla delar av applikationen

## Backend

Backend är byggd med **Node.js** och **Express**, och tillhandahåller RESTful API:er för:

### Huvudfunktioner:
* **Bilsökning** med intelligent matchningsprocentberäkning
* **Användarautentisering** (registrering/inloggning)
* **Profilhantering** (uppdatera användarnamn/lösenord)
* **Favorithantering** (lägg till/ta bort/visa favoriter)

### Viktiga Backend-komponenter:

* **Server**: backend/server.js - Huvudsaklig applikationsstartpunkt med CORS-stöd
* **Databas**: backend/config/db.js - PostgreSQL-anslutningshantering med connection pooling
* **Modeller**: backend/models/ - Dataåtkomstlager för användare och favoriter
* **Rutter**: backend/routes/ - API-endpoints organiserade efter funktion

### Matchningsalgoritm

CarMatch använder en sofistikerad viktad matchningsalgoritm som:
* Tilldelar viktprocent till olika kriterier (märke 15%, pris 20%, etc.)
* Beräknar hur väl varje bil matchar användarens kriterier
* Genererar en procentuell matchningspoäng
* Sorterar resultat efter matchningskvalitet

## Frontend

Frontend är byggd med **HTML5**, **CSS3** och **vanilla JavaScript**, och tillhandahåller ett responsivt och interaktivt användargränssnitt:

### Huvudsidor:
* **Startsida** (index.html) - Avancerat sökformulär med dynamiska fält
* **Sökresultat** (search_results.html) - Responsiva bilkort med matchningsprocent
* **Jämförelse** (comp.html) - Sida-vid-sida jämförelse av upp till 3 bilar
* **Favoriter** (favorites.html) - Hantera sparade bilar
* **Profil** (profile.html) - Användarprofilhantering
* **Autentisering** - Separata sidor för inloggning och registrering

### Viktiga Frontend-funktioner:

* **Dynamiskt sökformulär** - Modeller uppdateras baserat på valt märke
* **Responsiva bilkort** - Visar matchningsprocent, detaljer och handlingar
* **Favorithantering** - Lägg till/ta bort favoriter med realtidsuppdatering
* **Jämförelsefunktion** - Välj upp till 3 bilar för detaljerad jämförelse
* **Användarautentisering** - Säker session-hantering med localStorage
* **Blocket-integration** - Direktlänkar till Blocket för att hitta riktiga annonser

## Installation och konfiguration

### Förutsättningar
* Node.js (v14 eller senare)
* PostgreSQL-databas
* Modern webbläsare

### Backend-installation

1. **Navigera till backend-katalogen:**
   cd backend

2. **Installera beroenden:**
   npm install express pg cors

3**Starta servern:**
   node server.js

   Servern startar på port 3000 (http://localhost:3000)

### Frontend-installation

1. **Säkerställ att backend-servern körs**

2. **Öppna frontend:**
    * Öppna frontend/index.html i en webbläsare


## API-dokumentation

### Sökning
* **GET** /api/search - Söka efter bilar med valfria parametrar
    * Parametrar: brand, model, year, horsepower, minPrice, maxPrice, seats, fuelType, engineType
    * Returnerar: Array av bilar med matchningsprocent

### Autentisering
* **POST** /api/auth/register - Registrera ny användare
* **POST** /api/auth/login - Logga in användare
* **GET** /api/auth/profile - Hämta användardata
* **PUT** /api/auth/update-profile - Uppdatera användardata

### Favoriter
* **GET** /api/favorites - Hämta användarens favoriter
* **POST** /api/favorites - Lägg till bil i favoriter
* **DELETE** /api/favorites/:carId - Ta bort bil från favoriter
* **GET** /api/favorites/check/:carId - Kontrollera om bil är favorit
* **GET** /api/favorites/count - Hämta antal favoriter

## Säkerhet och begränsningar

### Säkerhetsnoteringar
* Lösenordslagring är för närvarande inte korrekt hashad (endast för utveckling)
* Enkel Bearer-token autentisering (användar-ID som token)

### Begränsningar
* För närvarande finns endast BMW, Audi, Mercedes-Benz, Volvo, Volkswagen, Porsche, Tesla och Toyota fordonsdata tillgänglig
* Bildata kommer från en databas

## Teknisk arkitektur

### Backend-teknologier:
* **Node.js** - JavaScript runtime
* **Express** - Webbserver framework
* **PostgreSQL** - Relationsdatabas
* **CORS** - Cross-Origin Resource Sharing

### Frontend-teknologier:
* **HTML5** - Semantisk markup
* **CSS3** - Modern styling med CSS Grid/Flexbox
* **Vanilla JavaScript** - Ingen externa ramverk
* **Bootstrap 5** - UI-komponenter och responsiv design

### Databasschema:
* **users** - Användardata (id, username, password, timestamps)
* **cars** - Bildata (alla bilspecifikationer)
* **favorites** - Kopplingar mellan användare och favoriserade bilar

## Funktionalitetsöversikt

### För icke-inloggade användare:
* Söka efter bilar med alla kriterier
* Se sökresultat med matchningsprocent
* Jämföra upp till 3 bilar
* Registrera nytt konto

### För inloggade användare:
* Alla funktioner ovan plus:
* Spara bilar som favoriter
* Hantera favoritlista
* Uppdatera profilinformation
* Persistent session mellan besök

## Utvecklingsanteckningar

Projektet är uppbyggt med fokus på:
* **Modularitet** - Tydlig separation av ansvar
* **Skalbarhet** - Lätt att lägga till nya funktioner
* **Underhållsbarhet** - Välorganiserad kod med kommentarer
* **Användarupplevelse** - Responsiv design och intuitiv navigation
* **API-design** - RESTful principer och konsekvent felhantering

## Framtida förbättringar

* Säker lösenordshashning (bcrypt)
* JWT-baserad autentisering
* Avancerade sökfilter
* E-postnotifieringar
---

**Utvecklad av:** Grupp 16  
**År:** 2025  
**Teknologi:** Node.js, Express, PostgreSQL, HTML5, CSS3, JavaScript