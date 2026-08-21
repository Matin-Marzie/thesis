import crypto from 'crypto';
import { DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucket = process.env.CDN_BUCKET_NAME;
const publicUrl = process.env.CDN_PUBLIC_URL?.replace(/\/$/, '');

if (!process.env.CDN_ENDPOINT || !process.env.CDN_ACCESS_KEY_ID || !process.env.CDN_SECRET_ACCESS_KEY || !bucket || !publicUrl) {
  throw new Error('CDN R2 configuration is incomplete');
}

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.CDN_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CDN_ACCESS_KEY_ID,
    secretAccessKey: process.env.CDN_SECRET_ACCESS_KEY,
  },
});

// Keep media namespaces stable so database URLs and cleanup remain predictable.
export const CDN_PREFIXES = {
  reels: 'reels',
  profilePictures: 'profile_pictures',
};

export const createObjectKey = (prefix, userId, fileName = '') => {
  const extension = fileName.includes('.') ? `.${fileName.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')}` : '';
  return `${prefix}/${userId}/${Date.now()}-${crypto.randomUUID()}${extension}`;
};

export const publicObjectUrl = (key) => `${publicUrl}/${key}`;

// Ownership checks prevent users from attaching or deleting another user's media.
export const isOwnedObjectUrl = (url, prefix, userId) =>
  typeof url === 'string' && url.startsWith(`${publicUrl}/${prefix}/${userId}/`);

export const presignUpload = async ({ key, contentType, expiresIn = 900 }) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(client, command, { expiresIn });
};

// Verify that the client completed the direct upload before writing its URL to the database.
export const headObject = (key) => client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

export const deleteObject = (key) => client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

export const deletePrefix = async (prefix) => {
  let continuationToken;
  do {
    const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }));
    await Promise.all((listed.Contents || []).map(({ Key }) => Key && deleteObject(Key)));
    continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (continuationToken);
};

export const getBucketName = () => bucket;
