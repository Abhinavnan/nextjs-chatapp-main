import zod from "zod";
import bycrypt from 'bcryptjs';
import { NextResponse, NextRequest } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { getUserDetailsByEmail } from "@/components/lib/services/userServices";
import { httpError } from "@/components/lib/error/errorModel";
import { generateToken, sendOTP } from '@/components/lib/services/authServices';
import { parseZodError } from "@/components/util/utility-functions";

const LoginSchema = zod.object({
    email: zod.string().email('Invalid email address'),
    password: zod.string().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,16}$/, 'Incorrect password'),
});

const POST = withErrorHandler(async (request: NextRequest) => {
    const { email, password } = await request.json();
    const parsedInputs = LoginSchema.safeParse({ email, password });
    if(!parsedInputs.success){
        throw new httpError(parseZodError(parsedInputs), 400);
    }
    const user = await getUserDetailsByEmail(email);
    if(!user){
        throw new httpError('User with this email does not exist\nPlease try to register instead', 400);
    };
    const { verified } = user;
    if(!verified){
        const response = NextResponse.json({ message: 'Account not verified\nPlease check your email to verify your account', verified }, 
            { status: 201 });
        await sendOTP(response, user);
        return response;
    }
    const isMatch = await bycrypt.compare(password, user.password);
    if(!isMatch){
        throw new httpError('Invalid email or password\nPlease try again', 400);
    }
    const response = NextResponse.json({ message: 'Login successful', verified}, { status: 201 });
    await generateToken(request, response, user);
    return response;
});

export { POST };