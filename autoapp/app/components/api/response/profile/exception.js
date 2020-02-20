export const ProfileNotFoundCode = "PROFILE_NOT_FOUND";
export const ProfileNotFound = (timestamp) => ({
    error: {
        rootCauses: [],
        code: ProfileNotFoundCode,
        reason: "id not found",
        timestamp
    }
});