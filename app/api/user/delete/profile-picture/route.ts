import { NextResponse } from "next/server";
import { deleteFileFromS3 } from "@/components/lib/services/s3Services";
import { User } from "@/components/lib/database/databaseModels";
import connectToDatabase from "@/components/lib/database/mongoose";
import { logger } from "@/components/lib/logger";
import { httpError } from "@/components/lib/error/errorModel";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { updateUserCache } from "@/components/lib/services/userServices";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";

const DELETE = withErrorHandler(async () => {
    const response = NextResponse.json({ message: 'Profile picture deleted successfully' }, { status: 200 });
    const userData = await validateTokenServerSide(true);
    const { userId, profilePicture } = userData;
    try{
        await connectToDatabase();
        await User.updateOne({ _id: userId }, { $set: { profilePicture: null } }, { runValidators: true });
        updateUserCache(userData);
    }catch(err){
        logger.error('Error updating user profile picture to database', err);
        throw new httpError('Error deleting profile picture.\nPlease try again', 500);
    }
    deleteFileFromS3(profilePicture).catch(() => logger.warn('Error deleting file from S3', { Key: profilePicture }));
    return response;
});

export { DELETE };