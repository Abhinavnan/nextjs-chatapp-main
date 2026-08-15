import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { awsRegion, s3BucketName } from "@/components/util/config/config";
import { logger } from "@/components/lib/logger";
import { httpError } from "@/components/lib/error/errorModel";

const s3Client = new S3Client({ region: awsRegion });

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml', 'image/avif'];
const MAX_SIZE = 1048576; // 1MB

async function uploadFileToS3(file: File, fileName: string, folder?: string, metadata?: Record<string, string>): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type)) {
        logger.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.\nfileName: ' + fileName);
        throw new httpError('Invalid file type.Alowed file types are JPEG, PNG, SVG and WebP.', 400);
    }
    if (file.size > MAX_SIZE) {
        logger.error('File too large. Maximum size is 1MB.\nfileName: ' + fileName);
        throw new httpError('File too large. Maximum size is 1MB.', 400);
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = file.name.split('.').pop();
    const key = `${folder}/${fileName}-${randomUUID()}.${extension}`;
    let result;
    try {
        result = await s3Client.send(
            new PutObjectCommand({
                Bucket: s3BucketName,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                Metadata: metadata
            })
        );
    } catch (error) {
        logger.error('Error uploading file to S3', error);
        throw new httpError('Error uploading file', 500);
    }
    logger.success('File uploaded to S3', result);
    return `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${key}`;
}

async function deleteFileFromS3(fileUrl: string): Promise<void> {
    const key = fileUrl.split(`.amazonaws.com/`)[1];
    if (!key) return;
    try {
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: s3BucketName,
                Key: key,
            })
        );
    } catch (error) {
        logger.error('Error deleting file from S3', error);
        throw new httpError('Error deleting file', 500);
    }
    logger.success('File deleted from S3', { Key: key });
}

export { uploadFileToS3, deleteFileFromS3 };