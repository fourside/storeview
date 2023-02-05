import {
  S3,
  PutObjectCommand,
  type PutObjectCommandInput,
  type DeleteObjectCommandInput,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Env } from "./env";
import type { ImageData } from "./type";

export async function uploadImagesToR2(images: ImageData[]): Promise<void> {
  const r2Client = createR2Client();
  for (const image of images) {
    const { image: buffer, mimeType, fileName } = image;
    const input: PutObjectCommandInput = {
      Bucket: Env.cloudflareBucketName,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
    };
    await r2Client.send(new PutObjectCommand(input));
  }
}

export async function removeImagesInR2(imageFilenames: string[]): Promise<void> {
  const r2Client = createR2Client();
  for (const filename of imageFilenames) {
    const input: DeleteObjectCommandInput = {
      Bucket: Env.cloudflareBucketName,
      Key: filename,
    };
    await r2Client.send(new DeleteObjectCommand(input));
  }
}

export async function uploadZipToR2(fileName: string, zip: Buffer): Promise<{ bucketKey: string }> {
  const r2Client = createR2Client();
  const bucket = Env.cloudflareBucketName;
  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: fileName,
    Body: zip,
    ContentType: "application/zip",
  };
  await r2Client.send(new PutObjectCommand(input));
  return { bucketKey: fileName };
}

function createR2Client(): S3 {
  return new S3({
    endpoint: `https://${Env.cloudflareAccountId}.r2.cloudflarestorage.com`,
    region: "auto",
    credentials: {
      accessKeyId: Env.cloudflareAccessKeyId,
      secretAccessKey: Env.cloudflareSecretAccessKey,
    },
  });
}
