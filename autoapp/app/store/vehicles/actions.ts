import {MileageData, VehicleData} from "../../components/api/vehicle/dto";

export const VEHICLE_FETCH_REQUEST = "VEHICLE_FETCH_REQUEST";
export const requestVehicleFetch = (id: string) => ({
    type: VEHICLE_FETCH_REQUEST,
    id
});

export const VEHICLE_LOAD = "VEHICLE_LOAD";
export const vehicleLoadAction = (vehicle: VehicleData) => ({
    type: VEHICLE_LOAD,
    vehicle
});

export const VEHICLE_MILEAGE_LOAD = "VEHICLE_MILEAGE_LOAD";
export const vehicleMileageLoadAction = (id: string, vehicleMileage: MileageData) => ({
    type: VEHICLE_MILEAGE_LOAD,
    vehicleMileage
});

export const VEHICLE_FETCH_ERROR = "VEHICLE_FETCH_ERROR";
export const vehicleFetchErrorAction = (error: any) => ({
    type: VEHICLE_FETCH_ERROR,
    error
});
