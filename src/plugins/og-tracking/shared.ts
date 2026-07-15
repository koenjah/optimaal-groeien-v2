export const TRACKING_PLUGIN_ID = 'og-tracking';

export type GoogleTrackingType = 'gtm' | 'google-tag';

export interface GoogleTrackingSettings {
  enabled: boolean;
  type: GoogleTrackingType;
  id: string;
}

export const DEFAULT_TRACKING_SETTINGS: GoogleTrackingSettings = {
  enabled: false,
  type: 'gtm',
  id: '',
};

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,}$/;
const GOOGLE_TAG_ID_PATTERN = /^(?:G|GT|AW)-[A-Z0-9]{5,}$/;

export function normalizeTrackingId(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function isGoogleTrackingType(value: unknown): value is GoogleTrackingType {
  return value === 'gtm' || value === 'google-tag';
}

export function isValidTrackingId(type: GoogleTrackingType, id: string): boolean {
  return type === 'gtm' ? GTM_ID_PATTERN.test(id) : GOOGLE_TAG_ID_PATTERN.test(id);
}

export function validateTrackingSettings(value: unknown): GoogleTrackingSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('De trackinginstellingen zijn niet geldig.');
  }

  const input = value as Record<string, unknown>;
  const type = isGoogleTrackingType(input.type) ? input.type : DEFAULT_TRACKING_SETTINGS.type;
  const id = normalizeTrackingId(input.id);
  const enabled = input.enabled === true;

  if (id && !isValidTrackingId(type, id)) {
    throw new Error(
      type === 'gtm'
        ? 'Gebruik een geldig Tag Manager-ID, bijvoorbeeld GTM-ABC1234.'
        : 'Gebruik een geldig Google tag-ID dat begint met G-, GT- of AW-.',
    );
  }

  if (enabled && !id) {
    throw new Error('Vul eerst een Google-ID in voordat je tracking activeert.');
  }

  return { enabled, type, id };
}

export function sanitizeStoredTrackingSettings(value: unknown): GoogleTrackingSettings {
  try {
    const settings = validateTrackingSettings(value);
    return settings.id && isValidTrackingId(settings.type, settings.id)
      ? settings
      : { ...settings, enabled: false };
  } catch {
    return { ...DEFAULT_TRACKING_SETTINGS };
  }
}
