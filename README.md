# G16-CarMatch


CarMatch är en webbapplikation som hjälper användare att hitta sin perfekta bil genom 
en personlig sökupplevelse med matchningsprocentberäkning baserat på användarens preferenser.

**Översikt**


* Söka efter bilar baserat på flera anpassningsbara kriterier
* Se sökresultat med personliga matchningsprocent
* Jämföra flera fordon sida vid sida
* Skapa användarkonton för att spara favoritfordon

**Projektstruktur**

Projektet följer en klient-server-arkitektur med tydlig separation mellan frontend och backend:

**Backend**

Backend är byggd med Node.js och Express, och tillhandahåller RESTful API:er för:

Bilsökning med matchningsprocentberäkningar
Användarautentisering (inloggning/registrering)


**Viktiga Backend-komponenter:**

* Server: backend/server.js - Huvudsaklig applikationsstartpunkt
* Databas: backend/config/db.js - PostgreSQL-anslutningshantering
* Modeller: backend/models/ - Dataåtkomstlager
* Rutter: backend/routes/ - API-endpoints

**Frontend**

Frontend är byggd med HTML, CSS och vanilla JavaScript, och tillhandahåller ett responsivt och interaktivt användargränssnitt:

* HTML-sidor för sökning, resultat, inloggning, etc.
* CSS-styling med responsiv design
* JavaScript för dynamisk klientsidafunktionalitet

**Viktiga Frontend-komponenter:**

* Sökformulär: formulär för att ange sökkriterier
* Resultatsida: Visar matchande bilar med matchningsprocent
* Autentisering: Inloggnings- och registreringsfunktionalitet


**Installation och konfiguration**

* Navigera till backend-katalogen: cd backend
* Starta servern: node server.js
* Servern startar på port 3000 (http://localhost:3000)
* Säkerställ att backend-servern körs
* Öppna frontend/index.html i en webbläsare

**API-dokumentation**

Sök-API
* Endpoint: GET /api/search


Autentiserings-API
* Registrera: POST /api/auth/register
* Logga in: POST /api/auth/login


**Nuvarande begränsningar**

* För närvarande finns endast några BMW-fordonsdata tillgänglig
* Lösenordslagring är inte korrekt hashad (endast för utveckling)

