export async function sleep(ms: number): Promise<void> {
  const jitter = Math.random() * 1000;
  return await new Promise((res) => setTimeout(res, ms + jitter));
}
