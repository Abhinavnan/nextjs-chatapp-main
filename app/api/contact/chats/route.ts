import zod from "zod";
import { NextResponse, NextRequest, connection } from "next/server";
import { withErrorHandler } from "@/components/lib/error/withErrorHandler";
import { validateTokenServerSide } from "@/components/lib/actions/authAction";
import { getReceiverDetailsByIndex, getMessages } from "@/components/lib/services/contactServices";
import { parseZodError } from "@/components/util/utility-functions";
import { httpError } from "@/components/lib/error/errorModel";

const cursorSchema = zod.object({
    cursor: zod.string().length(24, 'Invalid cursor'),
    index: zod.coerce.number().min(0, 'Index must be a non-negative number').int('Index must be an integer'),
    limit: zod.coerce.number().min(1, 'Limit must be a positive number').int('Limit must be an integer').max(20, 'Limit should not exceed 20'),
})

const GET = withErrorHandler(async (request: NextRequest) => {
    await connection();
    const { userId } = await validateTokenServerSide(request);
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    const parsedParams = cursorSchema.safeParse(params);
    if (!parsedParams.success) {
        throw new httpError(parseZodError(parsedParams), 400);
    }
    const { cursor, index, limit } = parsedParams.data;
    const receiverData = await getReceiverDetailsByIndex(userId, index);
    const messages = await getMessages(userId, receiverData.id, cursor, limit);
    const response = NextResponse.json(messages, { status: 200 });
    return response;
});

export { GET };