# Content Instructie — Optimaal Groeien

Instructies voor de LLM die content schrijft of herschrijft.  
Elke blog post en klantcase wordt opgeslagen als een `.md` bestand met **frontmatter** bovenaan.

---

## Bestandsstructuur

```
src/content/
  blog/
    b2b-leads-genereren-schaalbare-salesfunnel.md
    ai-marketing.md
    ...
  klantcases/
    400-meer-leads-in-slechts-3-maanden-bij-equans.md
    ...
```

> De bestandsnaam = de slug = de URL.  
> Dus `b2b-leads-genereren.md` → `https://optimaalgroeien.nl/blog/b2b-leads-genereren`

---

## Frontmatter (verplicht bovenaan elk bestand)

```yaml
---
title: "B2B Leads Genereren: Zo Bouw Je een Schaalbare Salesfunnel"
slug: "b2b-leads-genereren-schaalbare-salesfunnel"
description: "Ontdek hoe je als B2B bedrijf voorspelbaar leads genereert met een schaalbare salesfunnel. Praktische aanpak voor de technische sector."
date: "2025-03-12"
author: "Stefan Kelderman"
category: "Leadgeneratie"
tags: ["leadgeneratie", "salesfunnel", "b2b"]
heroImage: "https://cdn.prod.website-files.com/.../afbeelding.webp"
heroAlt: "Beschrijving van de afbeelding voor toegankelijkheid"
draft: false
---
```

### Velduitleg

| Veld | Verplicht | Uitleg |
|------|-----------|--------|
| `title` | ✅ | H1 van het artikel. Max ~65 tekens voor SEO. Geen punt aan het einde. |
| `slug` | ✅ | Zelfde als bestandsnaam zonder `.md`. Alleen kleine letters, koppeltekens, geen spaties. |
| `description` | ✅ | Meta description. Tussen 120–155 tekens. Prikkelend, sleutelwoord erin. |
| `date` | ✅ | Publicatiedatum in `YYYY-MM-DD` formaat. |
| `author` | ✅ | Volledige naam. Kies uit: `Stefan Kelderman`, `Bram Bouwknegt`, `Floris Assman` |
| `category` | ✅ | Één categorie. Kies uit de lijst hieronder. |
| `tags` | ✅ | 2–5 tags als array. Kleine letters, koppeltekens. |
| `heroImage` | ✅ | URL van de hoofdafbeelding. Extern (CDN) of lokaal pad (zie Afbeeldingen). |
| `heroAlt` | ✅ | Alt-tekst voor de hero afbeelding. Beschrijvend, niet leeg laten. |
| `draft` | ✅ | `false` = gepubliceerd, `true` = nog niet zichtbaar. |

---

## Categorieën (gebruik exact deze namen)

```
Leadgeneratie
Positionering
Sales
Marketing
Branding
AI & Automatisering
Strategie
Klantcase
```

---

## Opbouw van de content (na frontmatter)

Schrijf de body in standaard Markdown. **Geen H1 in de body** — die staat al in `title`.

```markdown
Introductie: 2–3 alinea's die het probleem schetsen en nieuwsgierig maken.
Geen bullet point als opener — gewone lopende tekst.

## Waarom [onderwerp] cruciaal is voor B2B groei

Leg het probleem uit. Schrijf vanuit de lezer: wat voelt hij/zij?

## De aanpak die werkt

Praktisch, concreet, met voorbeelden uit de technische sector.

### Stap 1: Begin met dit

Details hier.

### Stap 2: Dan dit

Details hier.

## Wat dit betekent voor jouw bedrijf

Verbinding terug naar de lezer. Maak het persoonlijk.

## Conclusie

Krachtige afsluiting. Eén concrete actie die de lezer morgen kan doen.
Eventueel een zachte CTA naar Optimaal Groeien.
```

### Schrijfrichtlijnen

- **Tone of voice**: Direct, nuchter, zonder bullshit. Geen hype. Wel zelfverzekerd.
- **Doelgroep**: Ondernemers en directeuren van B2B bedrijven in de technische sector (industrie, machinebouw, logistiek, bouw). 10–500 medewerkers.
- **Taal**: Nederlands. Geen EN woorden tenzij gangbaar in vak (b.v. "funnel", "leads", "sales").
- **Lengte**: 800–1500 woorden voor blogs. Klantcases 400–700 woorden.
- **Alinea's**: Kort. Max 4–5 zinnen. Witruimte is goed.
- **Koppen**: H2 voor hoofdsecties, H3 voor subsecties. Niet meer dan 3 niveaus diep.
- **Links**: Verwijs intern met relatieve paden: `[leadgeneratie](/blog/b2b-leadgeneratie-2025-funnel-nodig)`
- **Geen**: smiley's, puntjes (...), uitroeptekens (!), superlatieven ("de beste", "uniek", "revolutionair")

---

## Afbeeldingen in de tekst

### Externe afbeeldingen (van oude site)
Gebruik de CDN URL direct:
```markdown
![Beschrijving van de afbeelding](https://cdn.prod.website-files.com/.../afbeelding.webp)
```

### Lokale afbeeldingen (nieuw gemaakt)
Sla op in `/public/images/blog/` en gebruik dit pad:
```markdown
![Beschrijving van de afbeelding](/images/blog/mijn-afbeelding.webp)
```

### Naamconventie voor lokale afbeeldingen
```
/public/images/blog/[slug]-[beschrijving].webp
Voorbeeld: /public/images/blog/b2b-leads-team-overleg.webp
```

---

## Klantcase specifiek

Klantcases gebruiken extra frontmatter velden:

```yaml
---
title: "400% Meer Leads in 3 Maanden bij Equans"
slug: "400-meer-leads-in-slechts-3-maanden-bij-equans"
description: "Hoe Equans in 3 maanden tijd 400% meer gekwalificeerde leads genereerde via een gerichte B2B aanpak."
date: "2025-02-01"
author: "Stefan Kelderman"
category: "Klantcase"
tags: ["leadgeneratie", "b2b", "resultaten"]
heroImage: "https://..."
heroAlt: "Equans team"
draft: false
# Klantcase specifiek:
client: "Equans"
sector: "Technische dienstverlening"
resultaten:
  - label: "Meer leads"
    waarde: "+400%"
  - label: "Tijdsbestek"
    waarde: "3 maanden"
  - label: "Nieuwe klanten"
    waarde: "12"
---
```

---

## Slugs — naamconventie

| Goed | Fout |
|------|------|
| `b2b-leads-genereren` | `B2B Leads Genereren` |
| `ai-marketing-voor-mkb` | `ai_marketing_voor_mkb` |
| `wat-is-een-salesfunnel` | `wat-is-een-salesfunnel?` |
| `400-meer-leads-equans` | `400%-meer-leads-equans` |

Regels:
- Altijd lowercase
- Koppeltekens (`-`), nooit underscores of spaties
- Geen speciale tekens (`%`, `?`, `&`, etc.)
- Max ~60 tekens
- SEO-vriendelijk: sleutelwoord zoveel mogelijk vooraan

---

## Bestaande slugs (niet wijzigen!)

De volgende slugs bestaan al op optimaalgroeien.nl — gebruik exact dezelfde slug om SEO te behouden:

```
acquisitie-uitbesteden-om-te-groeien-met-je-bedrijf
ai-marketing
alles-wat-je-moet-weten-over-linkbuilding
b2b-leadgeneratie-2025-funnel-nodig
b2b-leadgeneratie-hoe-wij-bij-optimaal-groeien
b2b-leads-genereren-schaalbare-salesfunnel
bovenaan-in-google
branding-strategie
conversie-optimalisatie-door-een-cro-specialist
de-beste-business-coach-van-nederland
de-beste-sales-trainer-van-nederland
de-impact-van-seo-ai-op-jouw-online-zichtbaarheid
de-opkomst-van-ai-agents-een-revolutie-voor-jouw-bedrijf
digitale-marketing
employer-branding-strategie
funnel-management
googles-search-generative-experience
groeistrategie-de-beste-aanpak-voor-duurzame-groei-van-jouw-bedrijf
growth-hacking
handige-tips-voor-leads-het-genereren-van-meer
het-beste-marketingbureau-nederland-om-je-online-marketing-aan-uit-te-besteden
het-probleem-achter-tegenvallende-marketingresultaten
hoe-beheer-je-een-sales-funnel
hoe-laat-ik-mijn-sales-ondersteunen
hoe-werkt-marketing-automation
hoe-zet-je-een-marketing-strategie-op
hoe-zet-je-online-marketing-in-voor-jouw-bedrijf-tips-en-strategieen
hoger-in-google
influencer-marketing
is-ai-marketing-de-toekomst
je-website-op-seo-en-google-vindbaarheid-checken-5-essentiele-stappen
lead-magnet
leadgeneratie-bedrijf
lokale-seo-specialist
marketing-automation
marketing-funnel
marketing-strategie
online-marketing-strategie
online-marketing-traineeship-volgen
ontdek-de-kracht-van-ai-marketing-automation-jouw-sleutel-tot-succes
sales-funnel
sales-proces
sales-strategie
salesfunnel-optimaliseren-duurzame-groei
scaling-up-methode
seo-teksten-laten-schrijven
stagelopen-bij-optimaal-groeien
voordelen-van-zoekmachine-optimalisatie
waarom-google-ads-gebruiken
waarom-influencer-marketing
waarom-is-branding-belangrijk
waarom-is-een-social-media-strategie-belangrijk-voor-de-groei-van-jouw-bedrijf
waarom-is-leadgeneratie-belangrijk
waarom-is-personal-branding-relevant-voor-jouw-bedrijf-en-waar-moet-ik-beginnen
waarom-ondernemers-groei-uitstellen
waarom-online-marketing-ondersteuning
wat-is-branded-content
wat-is-de-beste-sales-strategie
wat-is-een-groeistrategie-voor-mijn-bedrijf
wat-is-een-lead-magnet-effectieve-tips-en-strategieen-voor-succes
wat-is-een-marketingstrategie-en-hoe-implementeer-ik-deze
wat-is-een-sales-training
wat-is-een-seo-check
wat-is-growth-hacking-en-wat-kan-het-betekenen-voor-jouw-marketing
website-laten-bouwen
website-optimalisatie
wordpress-seo
zoekmachine-optimalisatie-voor-mkb-bedrijven
```

---

## Voorbeeld — volledig bestand

`src/content/blog/b2b-leads-genereren-schaalbare-salesfunnel.md`

```markdown
---
title: "B2B Leads Genereren: Zo Bouw Je een Schaalbare Salesfunnel"
slug: "b2b-leads-genereren-schaalbare-salesfunnel"
description: "Ontdek hoe je als B2B bedrijf voorspelbaar leads genereert met een schaalbare salesfunnel. Praktisch en specifiek voor de technische sector."
date: "2025-03-12"
author: "Stefan Kelderman"
category: "Leadgeneratie"
tags: ["leadgeneratie", "salesfunnel", "b2b", "technische-sector"]
heroImage: "https://cdn.prod.website-files.com/6745bb245e3e71c210bbc09b/693fc433df79ecada6c002ed_Bellende%20marketeer%20optimaal%20groeien.jpg"
heroAlt: "Marketeer aan het werk voor B2B leadgeneratie"
draft: false
---

In de B2B markt ontstaat een lead zelden na één contactmoment. Beslissers nemen de tijd, vergelijken alternatieven en willen zekerheid. Zonder een heldere structuur blijven marketinginspanningen los van elkaar staan — en dat kost groei.

Een schaalbare salesfunnel brengt daar structuur in. Niet als statisch model, maar als levend systeem dat meeschaalt met je bedrijf.

## Waarom losse acties niet werken in B2B

...

## De opbouw van een schaalbare B2B funnel

...

## Van eerste contact naar klant

...

## Conclusie

Een voorspelbare stroom nieuwe klanten begint met structuur. Niet met meer budget of meer acties, maar met een funnel die elke lead op het juiste moment het juiste biedt.

Wil je weten waar jouw funnel nu lekt? [Plan een gratis analyse](/contact).
```

---

## Checklist voor elke post

- [ ] Frontmatter volledig ingevuld (alle verplichte velden)
- [ ] Slug = bestandsnaam = URL (geen spaties, lowercase)
- [ ] Geen H1 in de body (staat in `title`)
- [ ] Description tussen 120–155 tekens
- [ ] HeroImage URL werkt (test de link)
- [ ] HeroAlt is beschrijvend (niet leeg)
- [ ] Draft staat op `false` als het klaar is
- [ ] Intern gelinkt naar minimaal 1 andere blog of pagina
