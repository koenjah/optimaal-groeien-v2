import assert from 'node:assert/strict';
import {
  isValidTrackingId,
  normalizeTrackingId,
  sanitizeStoredTrackingSettings,
  validateTrackingSettings,
} from '../src/plugins/og-tracking/shared';
import {
  buildGoogleTagScript,
  buildTagManagerScript,
} from '../src/lib/google-tracking';

assert.equal(normalizeTrackingId('  gtm-abc1234  '), 'GTM-ABC1234');
assert.equal(isValidTrackingId('gtm', 'GTM-ABC1234'), true);
assert.equal(isValidTrackingId('google-tag', 'G-ABC1234567'), true);
assert.equal(isValidTrackingId('google-tag', 'GT-ABC12345'), true);
assert.equal(isValidTrackingId('google-tag', 'AW-123456789'), true);
assert.equal(isValidTrackingId('gtm', 'G-ABC1234567'), false);
assert.equal(isValidTrackingId('google-tag', 'not-a-tag'), false);

assert.deepEqual(validateTrackingSettings({
  enabled: true,
  type: 'gtm',
  id: ' gtm-abc1234 ',
}), {
  enabled: true,
  type: 'gtm',
  id: 'GTM-ABC1234',
});

assert.throws(
  () => validateTrackingSettings({ enabled: true, type: 'gtm', id: '' }),
  /Vul eerst een Google-ID/,
);
assert.throws(
  () => validateTrackingSettings({ enabled: false, type: 'google-tag', id: 'fout' }),
  /geldig Google tag-ID/,
);
assert.deepEqual(
  sanitizeStoredTrackingSettings({ enabled: true, type: 'gtm', id: 'ongeldig' }),
  { enabled: false, type: 'gtm', id: '' },
);

const tagManagerScript = buildTagManagerScript('GTM-ABC1234');
assert.match(tagManagerScript, /googletagmanager\.com\/gtm\.js/);
assert.match(tagManagerScript, /GTM-ABC1234/);

const googleTagScript = buildGoogleTagScript('G-ABC1234567');
assert.match(googleTagScript, /window\.dataLayer/);
assert.match(googleTagScript, /gtag\('config',"G-ABC1234567"\)/);

console.log('Google tracking unit tests passed');
