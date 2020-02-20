export const VEHICLE_FETCH_REQUEST = "VEHICLE_FETCH_REQUEST";
export const requestVehicleFetch = (id) => ({
    type: VEHICLE_FETCH_REQUEST,
    id
});

export const VEHICLE_LOAD = "VEHICLE_LOAD";
export const vehicleLoadAction = (vehicle) => ({
    type: VEHICLE_LOAD,
    vehicle
});

export const VEHICLE_FETCH_ERROR = "VEHICLE_FETCH_ERROR";
export const vehicleFetchErrorAction = (vehicle) => ({
    type: VEHICLE_FETCH_ERROR,
    error
});
