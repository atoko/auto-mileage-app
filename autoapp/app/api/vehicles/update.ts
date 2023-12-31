import {readProfileById} from "../../components/api/profile/dal";
import {MethodNotSupported, UnknownException} from "../../components/api/response/exception";
import {VehicleData, VehicleRequestValidation, VehicleRow} from "../../components/api/vehicle/dto";
import {createVehicle, updateVehicle} from "../../components/api/vehicle/dal";

export interface VehiclePutRequest {
    authentication: string,
    vehicleId: string,
    body: VehicleData
}

export interface VehiclePutResponse {
    status: number,
    error?: any,
    data?: { vehicles: VehicleRow }
}

const UpdateVehicle = (request: VehiclePutRequest): Promise<VehiclePutResponse> => {
    if (true) {
        return new Promise((resolve, reject) => {
            if (request.authentication) {
                const vehicle = request.body;
                const errors = VehicleRequestValidation(vehicle);
                const errorFields = Object.keys(errors);
                if (errorFields.length > 0) {
                    return resolve({
                        status: 400,
                        error: {
                            rootCauses: errorFields.map((field) => {
                                const fieldErrors = errors[field];
                                return {
                                    code: `INVALID_FIELD_${field.toUpperCase()}`,
                                    reason: fieldErrors.toString()
                                }
                            }),
                            code: "INVALID_REQUEST",
                            timestamp: Date.now()
                        }
                    });
                }

                const profileId = request.authentication;
                return readProfileById(profileId).then((profileData) => {
                    return updateVehicle(profileData, request.vehicleId, vehicle).then((newVehicle) => {
                        resolve({
                            status: 200,
                            data: {
                                vehicles: newVehicle
                            }
                        })
                    })
                }).catch((exception) => {
                    let {error} = exception;
                    let {code, reason} = error || {code: null, reason: null};

                    if (code && reason) {
                        resolve({
                            status: 409,
                            error
                        })
                    } else {
                        console.debug(JSON.stringify(exception));
                        resolve({
                            ...UnknownException(Date.now()),
                            status: 500
                        })
                    }
                });
            } else {
                return {
                    ...MethodNotSupported(Date.now()),
                    status: 500
                }
            }
        })
    } else {
        return Promise.resolve({
            ...MethodNotSupported(Date.now()),
            status: 405
        });
    }
}

export default UpdateVehicle;