import zod from "zod";
import { revalidateTag } from 'next/cache';
import { NextResponse, NextRequest, connection } from "next/server";
import connectToDatabase from "@/components/lib/database/mongoose";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { httpError } from "@/components/lib/error/errorModel";
import { User } from "@/components/lib/database/databaseModels";
import { logger } from "@/components/lib/logger";
import { parseZodError } from "@/components/util/utility-functions";
import { getReceiverIndexByEmail } from "@/components/lib/services/contactServices";
import { sendAPICall } from "@/components/lib/services/utilityServices";

const emailSchema = zod.string().email('Invalid email address').trim().max(25, 'Email id maximum character length in 25');

const PATCH = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const { userId, email: userEmail } = await validateTokenServerSide(request);
    const { email } = await request.json();
    const parsedInputs = emailSchema.safeParse(email);
    if (!parsedInputs.success) {
        throw new httpError(parseZodError(parsedInputs), 400);
    }
    const normalizedEmail = parsedInputs.data;
    if (userEmail === normalizedEmail) {
        throw new httpError('You cannot add yourself as a contact', 400);
    }
    const { receiverIndex, receiver, contactsLength } = await getReceiverIndexByEmail(userId, normalizedEmail);
    if (receiverIndex !== -1) {
        return NextResponse.json({ index: receiverIndex }, { status: 200 });
    }
    try {
        await connectToDatabase();
        await User.updateOne({ _id: userId }, { $addToSet: { contacts: receiver.id } }, { runValidators: true, context: 'query' });
        revalidateTag(`user-contacts-${userId}`, { expire: 0 });
    } catch (err) {
        logger.error('Error adding contact to database', err);
        throw new httpError('Error adding contact.\nPlease try again', 500);
    }
    sendAPICall(userId, 'patch', '/contact/update-user-contacts')
        .then(() => logger.info('User contacts updated on websocket server', { userId, contactEmail: normalizedEmail }))
        .catch((err) => logger.error('Error updating user contacts on websocket server', err));

    return NextResponse.json({ index: contactsLength }, { status: 200 });
});

export { PATCH };


