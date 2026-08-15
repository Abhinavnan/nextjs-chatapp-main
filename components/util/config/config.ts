const baseUrl = process.env.NEXT_INTERNAL_BASE_URL || 'http://localhost:3000';
const mongoDBConnectionURL = process.env.MONGODB_CONNECTION_URL;
const awsRegion = process.env.AWS_REGION;
const s3BucketName = process.env.AWS_S3_BUCKET_NAME
const resendApiKey = process.env.RESEND_API_KEY;
const jwtSecret = process.env.JWT_SECRET as string;
const isProduction = process.env.NODE_ENV === 'production';
const resendInternalMail = process.env.INTERNAL_EMAIL_ADDRESS || 'example@example.com';
const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 86400 } as const;
const webSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3000';

export {
    baseUrl, mongoDBConnectionURL, awsRegion, s3BucketName, resendApiKey, jwtSecret, isProduction, resendInternalMail, cookieOptions,
    webSocketUrl
};