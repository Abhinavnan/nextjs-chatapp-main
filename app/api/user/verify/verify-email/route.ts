import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/components/lib/database/mongoose";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { httpError } from "@/components/lib/error/errorModel";
import { verifyOTP, generateToken } from "@/components/lib/services/authServices";
import { User } from "@/components/lib/database/databaseModels";
import { logger } from "@/components/lib/logger";
import { updateUserCache } from "@/components/lib/services/userServices";

const PATCH = withErrorHandler(async (request: NextRequest) => {
    const { userId } = await verifyOTP(request);
    let userData;
    try{
        await connectToDatabase();
        const user = await User.findById(userId);
        if(!user){
            throw new httpError('User not found', 404);
        }
        user.verified = true;
        await user.save();
        userData = user.toObject({getters: true});
        updateUserCache(userData);
    }catch(err){
        logger.error('Error updating user verification status to database', err);
        throw new httpError('Error verifying account.\nPlease try again', 500);
    }
    const response = NextResponse.json({ message: 'Account verified successfully' }, { status: 200 });
    await generateToken(request, response, userData);
    response.cookies.delete('otpToken');
    return response;
});

export { PATCH };