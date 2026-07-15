import { getPluginSettings } from 'emdash';
import {
  TRACKING_PLUGIN_ID,
  sanitizeStoredTrackingSettings,
  type GoogleTrackingSettings,
} from '../plugins/og-tracking/shared';

export async function getGoogleTrackingSettings(): Promise<GoogleTrackingSettings> {
  try {
    return sanitizeStoredTrackingSettings(await getPluginSettings(TRACKING_PLUGIN_ID));
  } catch {
    return sanitizeStoredTrackingSettings({});
  }
}

export function buildTagManagerScript(id: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});`;
}

export function buildGoogleTagScript(id: string): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`;
}
