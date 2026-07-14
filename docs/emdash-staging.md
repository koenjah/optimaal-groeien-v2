# EmDash CMS: staging en veilige uitrol

De CMS-versie staat los van de live website totdat alle controles hieronder zijn afgerond.

## Huidige onderdelen

- Live Worker: `optimaal-groeien`
- Live D1: `optimaal-groeien-leads` (`c282d443-d328-45ca-b334-ba6bdf901814`)
- Staging Worker: `optimaal-groeien-emdash-staging`
- Staging D1: `duidelijkdag_family` (`d63dd757-5070-46c1-9a62-da000bfd53d4`)
- Staging media: `optimaal-groeien-emdash-staging-media`
- Staging URL: `https://optimaal-groeien-emdash-staging.koenjah.workers.dev`

De staging-D1 was leeg en nergens aan gekoppeld voordat hij hiervoor in gebruik werd genomen. De tabellen van de AI-scan en EmDash hebben verschillende namen. De twee bindings op staging mogen daarom veilig naar dezelfde D1 wijzen.

Staging heeft geen `send_email`-binding. Een test op staging kan dus nooit per ongeluk een echt contactbericht versturen.

## Beheerlogin met Cloudflare Access

Zonder `CF_ACCESS_TEAM_DOMAIN` gebruikt een EmDash-build de normale passkey-login. Dat is de huidige stagingfallback.

Voor de definitieve omgeving wordt Cloudflare Access gebruikt:

```bash
CF_ACCESS_TEAM_DOMAIN="jouw-team.cloudflareaccess.com" ENABLE_EMDASH=true npm run build
```

De Worker moet daarnaast de runtimevariabele `CF_ACCESS_AUDIENCE` krijgen met de AUD-tag van de Access-applicatie. De Access-regel staat alleen deze adressen toe:

- `marketing@optimaalgroeien.nl`
- `koenjah@gmail.com`

EmDash maakt een toegestane gebruiker bij de eerste login automatisch aan als admin. Cloudflare Access bepaalt wie de CMS-login mag bereiken; EmDash blijft alle beheer-API's zelf ook controleren.

## Lokale controles

Gebruik de projectspecifieke Node-versie uit `.nvmrc`:

```bash
nvm use
```

Deze versie is minimaal Node `22.18.0`, zoals ook in `package.json` staat.

```bash
npm run lint
npm run build
npm run build:emdash
```

Controleer na `build:emdash` ook de echte deployconfig:

```bash
jq '{name,account_id,compatibility_flags,d1_databases,r2_buckets,send_email,images}' dist/server/wrangler.json
```

## Staging deployen en testen

```bash
npm run deploy:staging:emdash
npm run test:staging:emdash
```

Open daarna `/_emdash/admin/setup` en maak de eerste beheerder aan met een passkey. Test voor een productie-uitrol minimaal:

1. Inloggen en uitloggen.
2. Een conceptblog maken, aanpassen en verwijderen.
3. Een tag maken en aan het conceptblog koppelen.
4. Een afbeelding uploaden en weer verwijderen.
5. Publiceren en controleren dat titel, tekst, afbeelding en tags goed op de publieke pagina staan.
6. Controleren dat bestaande websitepagina's, formulieren en AI-scan nog werken.

## Productieregels

Een productie-uitrol mag pas na een geslaagde, ingelogde stagingtest.

1. Maak direct voor de deploy een nieuwe Worker-back-up, D1-logische back-up en Git bundle.
2. Leg de actieve Worker-versie en deployment-ID vast.
3. Maak voor productie een aparte R2-bucket: `optimaal-groeien-emdash-media`.
4. Bouw met `ENABLE_EMDASH=true`, Worker `optimaal-groeien`, de live D1 voor zowel `DB` als `EMDASH_DB`, en de productie-mediabucket.
5. Controleer de gegenereerde `wrangler.json` voordat er wordt geupload.
6. Gebruik bij de deploy `--keep-vars`, zodat bestaande Worker-instellingen behouden blijven.
7. Vergelijk na de deploy de status, redirects en inhoud van de belangrijkste live pagina's met de nulmeting.

## Terugzetten

Bij een fout eerst de vorige Cloudflare Worker-deployment herstellen. Dat zet de code en bindings snel terug zonder de D1-data te wissen.

De D1-back-up is alleen nodig als CMS-data zelf verkeerd is gewijzigd. Herstel nooit blind de hele database: vergelijk eerst de tabellen en herstel alleen de getroffen rijen. De media in R2 staat los van de Worker-deployment en blijft bij een code-rollback bewaard.

De lokale back-up van 14 juli 2026 staat buiten de repository in:

`/Users/gebruiker/Documents/STEFAN/backups/optimaal-groeien/20260714-120909/`

Controleer bij herstel eerst `SHA256SUMS` in die map.
