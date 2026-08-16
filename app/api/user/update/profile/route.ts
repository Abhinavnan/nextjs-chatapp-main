import zod from "zod";
import { NextResponse, NextRequest, connection } from "next/server";
import { sendOTP } from "@/components/lib/services/authServices";
import { UserDetails } from "@/components/util/types";
import { httpError } from "@/components/lib/error/errorModel";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { updateUserDetails, uploadProfilePicture } from "@/components/lib/services/userServices";
import { parseZodError } from "@/components/util/utility-functions";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";

const updationFields = ['name', 'email', 'about'];

const updateUserSchema = zod.object({
    name: zod.string().min(3, 'Name must be at least 3 characters long').trim(),
    email: zod.string().email('Invalid email address').trim(),
    about: zod.preprocess((val) => (!val ? null : val), zod.string().min(20, 'About must be at least 20 characters long')
        .max(150, 'About must be at most 150 characters long').trim().optional()),
});

const PATCH = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const response = NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
    let userData = await validateTokenServerSide(request);
    const oldEmail = userData.email;
    const formData = await request.formData();
    updationFields.forEach((field) => userData[field] = formData.get(field) as string);
    const parsedInputs = updateUserSchema.safeParse(userData);
    const profilePicture = formData.get('profilePicture') as File;
    if (!parsedInputs.success) {
        throw new httpError(parseZodError(parsedInputs), 400);
    } else {
        userData = { ...userData, ...parsedInputs.data };
    }
    if (profilePicture instanceof File) {
        userData.profilePicture = await uploadProfilePicture({ ...userData, profilePicture });
    }
    if (userData.email !== oldEmail || !userData.verified) {
        userData.verified = false;
        await sendOTP(response, userData as UserDetails);
    }
    await updateUserDetails(userData as UserDetails);
    return response;
});

export { PATCH };