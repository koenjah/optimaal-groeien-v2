# EmDash CMS: veilige uitrol

Dit document beschrijft de vaste staging- en productieomgeving. Staging gebruikt eigen opslag en kan de live website of live CMS-data niet wijzigen.

## Omgevingen

| Onderdeel | Productie | Staging |
| --- | --- | --- |
| Website | `https://optimaalgroeien.nl` | `https://cms-staging.optimaalgroeien.nl` |
| CMS | `https://optimaalgroeien.nl/beheer/` | `https://cms-staging.optimaalgroeien.nl/_emdash/admin/` |
| Worker | `optimaal-groeien` | `optimaal-groeien-emdash-staging` |
| D1 | `optimaal-groeien-scans` | `optimaal-groeien-cms-staging` |
| R2 | `optimaal-groeien-emdash-media` | `optimaal-groeien-cms-staging-media` |
| KV | `optimaal-groeien-cms-sessions` | `optimaal-groeien-cms-staging-sessions` |
| E-mail verzenden | Ja, naar marketing | Uitgeschakeld |

Beide omgevingen staan in het losse Cloudflare-account voor Optimaal Groeien. Het account-ID is `c6b2726f6f179cede41f156972fd951a`.

De standaard Wrangler-login op een computer kan naar een ander Cloudflare-account wijzen. Daarom controleert ieder deploycommando eerst via de Cloudflare API of de expliciete sleutel toegang heeft tot het juiste account, de juiste Worker en de juiste D1-database. Zonder die controle stopt de deploy.

## Toegang

Cloudflare Access staat alleen deze adressen toe:

1. `koenjah@gmail.com`
2. `marketing@optimaalgroeien.nl`

De beheerder vult het e-mailadres in en ontvangt een code van zes cijfers. EmDash maakt een toegestane gebruiker bij de eerste login automatisch aan als admin. De CMS-API controleert de gebruiker daarna nog een tweede keer.

## Veilig bouwen

Gebruik Node uit `.nvmrc`:

```bash
nvm use
npm ci
npm run lint
```

Een staging-build:

```bash
npm run build:staging:emdash
```

Na een stagingdeploy controleert dit commando ook echt maken, publiceren, openbare SEO, sitemapgedrag, slugbescherming en opruimen van een tijdelijk artikel:

```bash
npm run test:staging:lifecycle
```

Hiervoor is een geldige Cloudflare Access-cookie nodig via `CF_ACCESS_COOKIE` of het lokale testcookiebestand. Het testartikel wordt na een geslaagde test definitief verwijderd.

Voor een echte deploy moet een expliciete Cloudflare-inlog in de omgeving staan:

```bash
export CLOUDFLARE_API_TOKEN='...'
```

Een Global API Key werkt ook met `CLOUDFLARE_API_KEY` en `CLOUDFLARE_EMAIL`, maar een beperkte API-token heeft de voorkeur.

Een productie-build:

```bash
npm run build:production:emdash
```

Beide buildcommando's controleren automatisch de Worker-naam, het Cloudflare-account, D1, R2, KV, Access en de e-mailbinding. De build stopt als een productie- en stagingonderdeel door elkaar staan.

Iedere build rendert daarnaast de belangrijkste CMS-zijbalkcomponenten. De build stopt als een update van `@cloudflare/kumo` niet compatibel is met EmDash. De Kumo-versie staat daarom bewust vast op `2.3.0`.

## Staging testen

Deploy eerst alleen staging:

```bash
npm run deploy:staging:emdash
npm run test:staging:emdash
```

Zonder login-cookie controleert de smoketest of Cloudflare Access actief is. Met een geldige `CF_ACCESS_COOKIE` controleert hij ook de beheerpagina en alle belangrijke lees-API's.

Voor een volledige uitroltest zijn op 15 juli 2026 deze stappen echt uitgevoerd:

1. Inloggen met een echte e-mailcode.
2. Een blog als concept maken.
3. Titel en tekst aanpassen.
4. Een tag maken en koppelen.
5. Een PNG uploaden, tonen en weer verwijderen.
6. SEO-velden opslaan.
7. Het blog publiceren en op de openbare blogpagina teruglezen.
8. Een nieuwe conceptwijziging maken en controleren dat deze alleen in de preview stond.
9. De conceptwijziging weggooien.
10. Het blog eerst naar de prullenbak verplaatsen en daarna definitief verwijderen.
11. Controleren dat content, prullenbak, tag en media weer leeg waren.

De preview-route accepteert alleen een geldig en tijdelijk ondertekend token. De preview krijgt `noindex` en `Cache-Control: private, no-store`. Zonder token geeft dezelfde route 404.

De beveiligde handleiding staat op `/_emdash/admin/handleiding/`. De CMS toont hiervoor een ronde helpknop. Bekende slugs van de bestaande website worden bij maken of aanpassen geblokkeerd voordat zij een onduidelijke URL-botsing kunnen veroorzaken.

De openbare sitemap bevat de bloglijst en alle 90 bestaande blogs. Beheerpagina's zoals `/beheer/` en `/admin/` worden niet opgenomen. Een nieuw CMS-artikel of een nieuwe CMS-pagina wordt na publicatie automatisch aan de sitemap-index toegevoegd. Content met de instelling `Niet indexeren` blijft bewust buiten de sitemap.

## Productie deployen

Een productie-uitrol mag alleen na een geslaagde stagingtest.

Gebruik altijd een expliciet deploycommando. Het algemene `npm run deploy` stopt bewust met een melding, zodat productie en staging niet per ongeluk worden verwisseld.

1. Maak een actuele Git bundle, Worker-back-up en logische D1-back-up.
2. Noteer de actieve Worker-versie.
3. Controleer dat de Git-werkmap schoon is en dat de juiste commit op GitHub staat.
4. Voer `npm run build:production:emdash` uit.
5. Controleer `dist/server/wrangler.json` nog één keer.
6. Deploy met `npm run deploy:production:emdash`. Dit gebruikt `--keep-vars`.
7. Voer `npm run test:production` uit.
8. Log echt in en controleer dashboard, blogs, pagina's, media, tags en gebruikers.

Het vaste back-upcommando is:

```bash
npm run backup:production
```

Dit commando stopt zonder expliciete Cloudflare-inlog. Het bewaart de sleutel niet. De back-up bevat checksums en wordt buiten de repository opgeslagen onder `Documents/STEFAN/backups/optimaal-groeien/`.

`/api/health` controleert zonder persoonsgegevens te tonen of de website, D1 en de CMS-schema's bereikbaar zijn. GitHub voert iedere ochtend automatisch de openbare productiecontroles uit. Bij een mislukte run verschijnt een fout in GitHub Actions.

De gecontroleerde back-up direct voor deze uitrol staat buiten de repository:

`/Users/gebruiker/Documents/STEFAN/backups/optimaal-groeien/predeploy-20260715T042710Z/`

De back-up bevat 52 uitleesbare D1-tabellen. Alleen Cloudflares afgeschermde interne `_cf_KV`-tabel kan niet logisch worden uitgelezen. Alle kritieke tabellen en aantallen zijn wel gecontroleerd.

Deze map bevat onder meer de Worker-code, Worker-instellingen, versies, deployments, een Git bundle, R2- en KV-metadata en een logische kopie van alle 52 bereikbare D1-tabellen. Controleer `SHA256SUMS` voordat een back-up wordt gebruikt.

## Terugzetten

Bij een fout zet je eerst de vorige Cloudflare Worker-versie terug. Dat verandert geen D1-rijen en verwijdert geen R2-media.

Gebruik de D1-back-up alleen als gegevens zelf verkeerd zijn gewijzigd. Herstel nooit blind de hele database. Vergelijk eerst de getroffen tabel en herstel alleen de juiste rijen.

R2-media en D1-data blijven bestaan als alleen de Worker-code wordt teruggezet.

## Bekende grens

De bestaande blogs uit de repository blijven live en ongewijzigd. Nieuwe CMS-blogs verschijnen daarnaast in hetzelfde blogoverzicht. De bestaande statische blogs zijn nog niet naar EmDash geïmporteerd en zijn daarom nog niet via het CMS te bewerken. Maak geen nieuw CMS-item met een slug die al door een bestaande pagina of blog wordt gebruikt.
