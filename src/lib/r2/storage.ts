import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getR2BucketName, getR2Client } from "./client";

export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
) {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string) {
  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
}

export async function getObject(key: string) {
  const client = getR2Client();

  return client.send(
    new GetObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
    }),
  );
}
