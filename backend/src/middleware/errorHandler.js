export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}:`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });

    res.status(statusCode).json({
        status: 'error',
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
