export const Env = Object.freeze({
  cloudflareBucketName:
    process.env.NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL ?? notSetVariable("NEXT_PUBLIC_CLOUDFLARE_PUBLIC_BUCKET_URL"),
});

function notSetVariable(name: string): never {
  throw new Error(`not set variable: ${name}`);
}
