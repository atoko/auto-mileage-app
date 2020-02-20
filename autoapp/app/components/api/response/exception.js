export const MethodNotSupported = (timestamp) => ({
    error: {
        rootCauses: [],
        code: "METHOD_NOT_SUPPORTED",
        timestamp
    }
});

export const Unauthorized = (timestamp) => ({
    error: {
        rootCauses: [],
        code: "UNAUTHORIZED",
        timestamp
    }
});

export const UnknownException = (timestamp) => ({
    error: {
        rootCauses: [],
        code: "STRAY_CAT_ERROR",
        timestamp
    }
});
