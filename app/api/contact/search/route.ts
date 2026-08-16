import { NextResponse, NextRequest, connection } from "next/server";
import connectToDatabase from "@/components/lib/database/mongoose";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { httpError } from "@/components/lib/error/errorModel";
import { User } from "@/components/lib/database/databaseModels";
import { logger } from "@/components/lib/logger";
import { Contact } from "@/components/util/types";
import { getUserContacts } from "@/components/lib/services/contactServices";

const GET = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const { userId } = await validateTokenServerSide(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = Number(searchParams.get('limit') || 10);
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedLimit = limit < 20 ? limit : 20;
    const { contactList, contactIdIndexMap } = await getUserContacts(userId);
    const existingContacts = contactIdIndexMap.keys();
    const filteredContacts = contactList.filter(({ name, email }) =>
        name.toLowerCase().includes(normalizedQuery) || email.toLowerCase().includes(normalizedQuery)).slice(0, normalizedLimit)
        .map(({ id, about, ...rest }) => ({ ...rest }));
    const quertyLimit = normalizedLimit - filteredContacts.length;
    if (quertyLimit === 0) {
        return NextResponse.json(filteredContacts, { status: 200 });
    }
    let contactsFromDatabase: Contact[] = [];
    try {
        await connectToDatabase();
        contactsFromDatabase = await User.find({
            verified: true, _id: { $nin: [...existingContacts, userId] },
            $or: [{ name: { $regex: normalizedQuery, $options: 'i' } }, { email: { $regex: normalizedQuery, $options: 'i' } }]
        },
            'name email profilePicture').limit(quertyLimit).lean();
    } catch (err) {
        logger.error('Error getting contacts from database', err);
        throw new httpError('Error getting contacts.\nPlease try again', 500);
    }
    return NextResponse.json({ message: [...filteredContacts, ...contactsFromDatabase] }, { status: 200 });
});

export { GET }