# Google Search Console local tools

This folder contains small local scripts for reading Google Search Console data.
Credentials and OAuth tokens live in `.gsc/`, which is git-ignored.

## Setup option A: service account

1. Enable the Google Search Console API in a Google Cloud project.
2. Create a service account and save its JSON key as `.gsc/service-account.json`.
3. Add the service account email as a user in Search Console for the property.
4. Run `npm run gsc:sites` to confirm it can see the property.

## Setup option B: OAuth desktop app

1. Enable the Google Search Console API in a Google Cloud project.
2. Create an OAuth desktop client and save the downloaded JSON as `.gsc/oauth-client.json`.
3. Run `npm run gsc:auth` and approve the `webmasters.readonly` scope.
4. Run `npm run gsc:sites` to confirm the Google account can see the property.

## Useful commands

```bash
npm run gsc:sites
npm run gsc:sitemaps
npm run gsc:check
npm run gsc:inspect -- https://optimaalgroeien.nl/privacybeleid/
npm run gsc:analytics -- --dimensions page --days 28 --limit 25
```
