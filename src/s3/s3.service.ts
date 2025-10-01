import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.SPACES_BUCKET!;
    this.region = process.env.SPACES_REGION!;
    this.client = new S3Client({
      region: 'us-east-1',
      endpoint: `https://${this.region}.digitaloceanspaces.com`,
      credentials: {
        accessKeyId: process.env.SPACES_KEY_ID!,
        secretAccessKey: process.env.SPACES_SECRET_KEY!,
      },
    });
  }

  async copyFile(sourceKey: string, destinationKey: string) {
    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: destinationKey,
      CopySource: `${this.bucket}/${sourceKey}`,
    });
    return await this.client.send(command);
  }

  async getFile(key: string) {
    console.log('getFile', {
      key,
      bucket: this.bucket,
    });

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await this.client.send(command);
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    console.log('uploadFile', {
      key,
      bucket: this.bucket,
      file: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer.length,
    });

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private',

      Metadata: {
        originalName: file.originalname,
      },
    });

    await this.client.send(command);
    return key;
  }

  async uploadString(content: string, key: string, contentType = 'text/plain') {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: Buffer.from(content, 'utf8'),
      ContentType: contentType,
      ACL: 'private',
    });
    await this.client.send(command);
    return key;
  }

  async getPresignedUrl(key: string, expiresIn: number = 60 * 5) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn,
    });

    return url;
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async deleteFiles(keys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });

    await this.client.send(command);
  }

  async deleteFolder(folder: string) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: folder,
    });

    const files = await this.client.send(command);
    if (!files.Contents) return;

    await this.deleteFiles(files.Contents.map((file) => file.Key!));
  }
}
