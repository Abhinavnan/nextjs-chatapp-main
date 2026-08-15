import zod from "zod";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";
import { updatePassword, getUserDetailsByEmail } from "@/components/lib/services/userServices";
import { parseZodError } from "@/components/util/utility-functions";
import { httpError } from "@/components/lib/error/errorModel";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";

const changePasswordSchema = zod.object({ 
    oldPassword: zod.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,16}$/, 'Incorrect current password'),
    password: zod.string().min(6, 'Password must be at least 6 characters long')
            .max(16, 'Password must be at most 16 characters long')
            .regex(/[A-Za-z]/, 'Password must contain at least one letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    
});

const PATCH = withErrorHandler(async (request: NextRequest) => {
    const response = NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });
    const { userId, email } = await validateTokenServerSide(true);
    const body = await request.json();
    const { oldPassword, password, confirmPassword } = body;
    if(password !== confirmPassword){
        throw new httpError('Passwords do not match\nPlease try again', 400);
    }
    const parsedInputs = changePasswordSchema.safeParse(body);
    if(!parsedInputs.success){
        throw new httpError(parseZodError(parsedInputs), 400);
    }
    const {password: hashedPassword} = await getUserDetailsByEmail(email);
    const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
    if(!isMatch){
        throw new httpError('Incorrect current password\nPlease try again', 400);
    }
    await updatePassword(userId, password);
    return response;
});

export { PATCH };