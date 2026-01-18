export function successResponse(res, message, data = null, status = 200) {
    return res.status(status).json({ success: true, message, data });
}

export function errorResponse(res, message, status = 400, error = null) {
    const payload = { success: false, message };
    if (error && process.env.NODE_ENV === "development") {
        payload.error = typeof error === "string" ? error : error.message;
    }
    return res.status(status).json(payload);
}
