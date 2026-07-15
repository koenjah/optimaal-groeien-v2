import { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Save, Tag, TriangleAlert } from 'lucide-react';
import type { GoogleTrackingSettings, GoogleTrackingType } from './shared';
import { DEFAULT_TRACKING_SETTINGS } from './shared';
import './tracking-admin.css';

const SETTINGS_ENDPOINT = '/_emdash/api/plugins/og-tracking/settings';

async function parseResponse(response: Response): Promise<GoogleTrackingSettings> {
  const body = await response.json().catch(() => null) as {
    data?: GoogleTrackingSettings;
    error?: { message?: string };
  } | null;

  if (!response.ok || !body?.data) {
    throw new Error(body?.error?.message || 'De instellingen konden niet worden geladen.');
  }

  return body.data;
}

function GoogleTrackingPage() {
  const [settings, setSettings] = useState<GoogleTrackingSettings>(DEFAULT_TRACKING_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetch(SETTINGS_ENDPOINT)
      .then(parseResponse)
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Laden is mislukt.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const chooseType = (type: GoogleTrackingType) => {
    setSettings((current) => ({ ...current, type, id: '' }));
    setMessage('');
    setError('');
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(SETTINGS_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-EmDash-Request': '1',
        },
        body: JSON.stringify(settings),
      });
      const saved = await parseResponse(response);
      setSettings(saved);
      setMessage(saved.enabled ? 'Google tracking staat aan.' : 'De instellingen zijn opgeslagen.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Opslaan is mislukt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="og-tracking" aria-busy={loading}>
      <header className="og-tracking__header">
        <div>
          <p className="og-tracking__eyebrow">Instellingen</p>
          <h1>Google tracking</h1>
          <p>Beheer hier de Google-tag voor de hele website.</p>
        </div>
        <a className="og-tracking__site-link" href="/" target="_blank" rel="noreferrer">
          Website openen <ExternalLink aria-hidden="true" size={17} />
        </a>
      </header>

      <div className={`og-tracking__status ${settings.enabled ? 'is-active' : ''}`}>
        {settings.enabled ? <CheckCircle2 aria-hidden="true" /> : <Tag aria-hidden="true" />}
        <div>
          <strong>{settings.enabled ? 'Tracking is actief' : 'Tracking is niet actief'}</strong>
          <span>{settings.enabled ? settings.id : 'Er wordt nu geen Google-tag geladen.'}</span>
        </div>
      </div>

      <section className="og-tracking__form" aria-label="Google tracking instellen">
        <fieldset disabled={loading || saving}>
          <legend>Methode</legend>
          <div className="og-tracking__segments">
            <button
              type="button"
              className={settings.type === 'gtm' ? 'is-selected' : ''}
              aria-pressed={settings.type === 'gtm'}
              onClick={() => chooseType('gtm')}
            >
              Tag Manager
            </button>
            <button
              type="button"
              className={settings.type === 'google-tag' ? 'is-selected' : ''}
              aria-pressed={settings.type === 'google-tag'}
              onClick={() => chooseType('google-tag')}
            >
              Google tag
            </button>
          </div>

          <label className="og-tracking__field" htmlFor="google-tracking-id">
            <span>{settings.type === 'gtm' ? 'Tag Manager-ID' : 'Google tag-ID'}</span>
            <input
              id="google-tracking-id"
              type="text"
              value={settings.id}
              placeholder={settings.type === 'gtm' ? 'GTM-ABC1234' : 'G-ABC1234567'}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setSettings((current) => ({
                ...current,
                id: event.target.value.toUpperCase(),
              }))}
            />
          </label>

          <label className="og-tracking__toggle" htmlFor="google-tracking-enabled">
            <input
              id="google-tracking-enabled"
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => setSettings((current) => ({
                ...current,
                enabled: event.target.checked,
              }))}
            />
            <span className="og-tracking__toggle-control" aria-hidden="true" />
            <span>
              <strong>Tracking aanzetten</strong>
              <small>De tag wordt na opslaan direct op de website geladen.</small>
            </span>
          </label>
        </fieldset>

        {error && (
          <p className="og-tracking__notice is-error" role="alert">
            <TriangleAlert aria-hidden="true" size={18} /> {error}
          </p>
        )}
        {message && (
          <p className="og-tracking__notice is-success" role="status">
            <CheckCircle2 aria-hidden="true" size={18} /> {message}
          </p>
        )}

        <div className="og-tracking__actions">
          <button
            className="og-tracking__save"
            type="button"
            disabled={loading || saving}
            onClick={save}
          >
            <Save aria-hidden="true" size={18} />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </section>
    </main>
  );
}

export const pages = {
  '/tracking': GoogleTrackingPage,
};
