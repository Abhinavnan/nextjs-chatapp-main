export class httpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 500, type?: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
        this.cause = type;
    }
}

export const hybridError = (message: string, code: number, isHttpError: boolean) => {
    if (isHttpError) throw new httpError(message, code);
    throw new Error(message);
};