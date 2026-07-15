import { definePlugin, PluginRouteError } from 'emdash';
import {
  DEFAULT_TRACKING_SETTINGS,
  TRACKING_PLUGIN_ID,
  sanitizeStoredTrackingSettings,
  validateTrackingSettings,
} from './shared';

async function readSettings(kv: {
  get<T>(key: string): Promise<T | null>;
}) {
  const [enabled, type, id] = await Promise.all([
    kv.get<boolean>('settings:enabled'),
    kv.get<string>('settings:type'),
    kv.get<string>('settings:id'),
  ]);

  return sanitizeStoredTrackingSettings({
    enabled: enabled ?? DEFAULT_TRACKING_SETTINGS.enabled,
    type: type ?? DEFAULT_TRACKING_SETTINGS.type,
    id: id ?? DEFAULT_TRACKING_SETTINGS.id,
  });
}

export function createPlugin() {
  return definePlugin({
    id: TRACKING_PLUGIN_ID,
    version: '1.0.0',
    routes: {
      settings: {
        handler: async (ctx) => {
          if (ctx.request.method === 'GET') {
            return readSettings(ctx.kv);
          }

          if (ctx.request.method !== 'PUT') {
            throw new PluginRouteError('METHOD_NOT_ALLOWED', 'Deze aanvraag is niet toegestaan.', 405);
          }

          let settings;
          try {
            settings = validateTrackingSettings(ctx.input);
          } catch (error) {
            throw PluginRouteError.badRequest(
              error instanceof Error ? error.message : 'De trackinginstellingen zijn niet geldig.',
            );
          }

          await Promise.all([
            ctx.kv.set('settings:enabled', settings.enabled),
            ctx.kv.set('settings:type', settings.type),
            ctx.kv.set('settings:id', settings.id),
          ]);

          return settings;
        },
      },
    },
    admin: {
      entry: 'og-tracking/admin',
      pages: [{ path: '/tracking', label: 'Google tracking', icon: 'chart-line' }],
    },
  });
}
