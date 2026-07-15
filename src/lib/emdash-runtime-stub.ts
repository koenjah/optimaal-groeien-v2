export async function getDb(): Promise<never> {
  throw new Error('EmDash is disabled for this build.');
}
