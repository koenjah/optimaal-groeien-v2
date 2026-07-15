export async function getEmDashEntry() {
  return { entry: null, error: null, isPreview: false, cacheHint: {} };
}

export async function getEmDashCollection() {
  return { entries: [], error: null, cacheHint: {} };
}

export function extractPlainText() {
  return '';
}

export async function getPluginSettings() {
  return {};
}
