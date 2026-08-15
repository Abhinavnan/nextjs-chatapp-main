import zod from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { deleteFileFromS3 } from "@/components/lib/services/s3Services";
import connectToDatabase from "@/components/lib/database/mongoose";
import { User } from "@/components/lib/database/databaseModels";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { httpError } from "@/components/lib/error/errorModel";
import { logger } from "@/components/lib/logger";
import { parseZodError } from "@/components/util/utility-functions";
import { getUserDetailsByEmail, updateUserDetails, updateUserCache, uploadProfilePicture } from "@/components/lib/services/userServices";
import { UserDetails } from "@/components/util/types";
import { sendOTP } from "@/components/lib/services/authServices";

const registrationFields = ['name', 'email', 'password', 'confirmPassword'];

const UserSchema = zod.object({
    name: zod.string().min(3, 'Name must be at least 3 characters long').trim(),
    email: zod.string().email('Invalid email address').trim(),
    password: zod.string().min(6, 'Password must be at least 6 characters long')
        .max(16, 'Password must be at most 16 characters long')
        .regex(/[A-Za-z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const POST = withErrorHandler(async (req: Request) => {
    const formData = await req.formData();
    let userData: Record<string, any> = {verified: false}
    registrationFields.forEach((field) => userData[field] = formData.get(field) as string);
    const parsedData = UserSchema.safeParse(userData);
    if(!parsedData.success){
        throw new httpError(parseZodError(parsedData), 400);
    }else{
        userData = {...userData, ...parsedData.data};
    }
    const {password, confirmPassword, name, email} = userData;
    if(password !== confirmPassword){
        throw new httpError('Passwords do not match', 400);
    }
    const existingUser = await getUserDetailsByEmail(email);
    if(existingUser?.verified){
        throw new httpError('User with this email already exists\nPlease try to login insted', 400);
    }
    const profilePicture = formData.get('profilePicture') as File;
    if(profilePicture instanceof File){
        userData.profilePicture = await uploadProfilePicture({name, email, profilePicture});
    }
    userData.password = await bcrypt.hash(password, 12);
    if(existingUser){
        userData.id = existingUser.id;
        await updateUserDetails(userData as UserDetails);
    }else{
        try{
            await connectToDatabase();
            const user = new User(userData);
            await user.save();
            userData = user.toObject({getters: true});
            updateUserCache(user);
        }catch(err){
            logger.error('Error inserting User into database/n', err);
            if(userData.profilePicture){
                deleteFileFromS3(userData.profilePicture).catch(() => logger.warn('Error deleting file from S3'));
            };
            throw new httpError('Error creating user\nPlease try again', 500);
        }
    }
    const response = NextResponse.json({message: 'User created successfully.\nPlease check your email to verify your account.'}, {status: 201});
    await sendOTP(response, userData as UserDetails);
    return response;
});

export { POST }