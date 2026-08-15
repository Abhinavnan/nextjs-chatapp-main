import { NextRequest, NextResponse } from 'next/server';
import { httpError } from './errorModel';
import { logger } from '@/components/lib/logger';
import { deleteAllCookies } from '@/components/lib/services/utilityServices';

type RouteHandler = (req: NextRequest, context?: any) => Promise<Response>;

function withErrorHandler(handler: RouteHandler): RouteHandler {
    return async (req: NextRequest, context?: any) => {
        try { 
            return await handler(req, context);
        } catch (error) {
            if (error instanceof httpError) {
                const response = NextResponse.json({ message: error.message }, { status: error.statusCode });
                if (error.cause === 'authError') {
                    deleteAllCookies(req, response);
                }
                return response;
            }
            if (error instanceof Error) {
                logger.error('Unhandled error', error);
                return NextResponse.json({ message: error.message }, { status: 500 });
            }
            logger.error('Unknown error', error);
            return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
        }
    };
}

export { withErrorHandler };