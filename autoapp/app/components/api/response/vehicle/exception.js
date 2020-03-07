export const VehicleNotFoundCode = "VEHICLE_NOT_FOUND";
export const VehicleNotFound = (timestamp) => ({
    error: {
        rootCauses: [],
        code: VehicleNotFoundCode,
        reason: "id not found",
        timestamp
    }
});
