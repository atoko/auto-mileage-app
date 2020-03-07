import {readProfileById} from "../../../components/api/profile/dal";
import {MethodNotSupported, UnknownException} from "../../../components/api/response/exception";
import {VehicleRow} from "../../../components/api/vehicle/dto";
import {updateVehicle} from "../../../components/api/vehicle/dal";
import {ProfileRow} from "../../../components/api/profile/dto";

export interface VehiclePutRequest {
    authentication: string,
    vehicleId: string,
    body: {
        imageData? : string | null
    }
}

export interface VehiclePutResponse {
    status: number,
    error?: any,
    data?: { vehicles: VehicleRow }
}

export const UpdateVehicleImageData = (request: VehiclePutRequest): Promise<VehiclePutResponse> => {
    if (true) {
        return new Promise((resolve, reject) => {
            if (request.authentication) {
                const { imageData } = request.body;
                const profileId = request.authentication;
                return readProfileById(profileId).then((profileData: ProfileRow) => {
                    return updateVehicle(
                        profileData,
                        request.vehicleId,
                        { imageData }
                    ).then((newVehicle: VehicleRow) => {
                        resolve({
                            status: 200,
                            data: {
                                vehicles: newVehicle
                            }
                        })
                    })
                }).catch((exception: any) => {
                    let {error} = exception;
                    let {code, reason} = error || {code: null, reason: null};

                    if (code && reason) {
                        resolve({
                            status: 409,
                            error
                        })
                    } else {
                        console.debug(exception);
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

export default UpdateVehicleImageData;