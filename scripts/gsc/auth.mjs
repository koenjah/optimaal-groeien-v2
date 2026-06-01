import http from 'node:http';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { ensureGscDir, loadOAuthConfig, makeOAuthClient, saveToken, SCOPE, TOKEN_PATH } from './client.mjs';

const port = Number(process.env.GSC_OAUTH_PORT ?? 8787);
const host = '127.0.0.1';
const redirectUri = `http://${host}:${port}/oauth2callback`;

await ensureGscDir();

const config = await loadOAuthConfig();
const client = makeOAuthClient(config, redirectUri);

const authUrl = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [SCOPE],
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', redirectUri);
    if (url.pathname !== '/oauth2callback') {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      throw new Error(error);
    }
    if (!code) {
      throw new Error('Missing OAuth code.');
    }

    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      console.warn('No refresh token returned. If future calls fail, revoke the app grant and rerun auth.');
    }

    await saveToken(tokens);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Google Search Console gekoppeld</h1><p>Je kunt dit tabblad sluiten en terug naar Codex.</p>');
    console.log(`Saved OAuth token to ${TOKEN_PATH}`);
    server.close();
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(String(error.stack ?? error));
    console.error(error);
    server.close();
  }
});

server.listen(port, host);
await once(server, 'listening');

console.log(`Open this URL to authorize Google Search Console access:\n${authUrl}\n`);

if (process.platform === 'darwin') {
  execFile('open', [authUrl], () => {});
}

await once(server, 'close');
