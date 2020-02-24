// @ts-ignore
import uuidv4 from "uuid/v4"
import {ProfileNotFound} from "../response/profile/exception";
import {VehicleData, VehicleRow} from "./dto";
import {ProfileData, ProfileRow} from "../profile/dto";
import {VehicleNotFound} from "../response/vehicle/exception";
import {VehicleStorage} from "../asyncStorage";

interface Dictionary<T> {
    [key: string]: T;
}

let profileIndex : Dictionary<string[]> = {
    "local": [
        "12345"
    ]
};

export const createVehicle = (profile : ProfileRow, vehicle: VehicleData) : Promise<VehicleRow>=> {
    return new Promise((resolve, reject) => {
        let id = uuidv4();

        resolve(new Promise((resolve, reject) => {
            const newVehicle = { ...vehicle,
                id,
                profileId: profile.id,
                created: Date.now().toString(),
                versionKey: Date.now().toString()
            };
            VehicleStorage.set(id.toString(), JSON.stringify(newVehicle)).then(() => {
                if (newVehicle.profileId in profileIndex) {
                    profileIndex[newVehicle.profileId] = [
                        ...profileIndex[newVehicle.profileId],
                        id
                    ];
                } else {
                    profileIndex[newVehicle.profileId] = [
                        id
                    ];
                }
                resolve(newVehicle);
            }).catch((e: any) => {
                console.error(e)
            });
        }))
    })
};

export const updateVehicle = (profile : ProfileRow, vehicleId: string, vehicle: VehicleData) : Promise<VehicleRow> => {
    return new Promise((resolve, reject) => {
       return new Promise((resolve, reject) => {
           if (vehicleId in inMemory) {
               const newVehicle = {
                   ...inMemory[vehicleId],
                   ...vehicle,
                   id: vehicleId,
                   profileId: profile.id,
                   versionKey: Date.now().toString()
               };

               VehicleStorage.set(vehicleId, newVehicle).then(() => {
                   const newVehicle = inMemory[vehicleId];
                   if (newVehicle.profileId in profileIndex) {
                       if (profileIndex[newVehicle.profileId].indexOf(vehicleId) === -1) {
                           profileIndex[newVehicle.profileId] = [
                               ...profileIndex[newVehicle.profileId],
                               vehicleId
                           ];
                       }
                   } else {
                       profileIndex[newVehicle.profileId] = [
                           vehicleId
                       ];
                   }
                   resolve(inMemory[vehicleId] as VehicleRow)
               });
           } else {
               throw VehicleNotFound(Date.now());
           }
       })
    })
};

export const updateVehicleNotification = (profile : ProfileRow, vehicleId: string, timestamp: string) : Promise<VehicleRow> => {
    return new Promise((resolve, reject) => {
        resolve(new Promise((resolve, reject) => {
            if (vehicleId in inMemory) {
                inMemory[vehicleId] = {
                    ...inMemory[vehicleId],
                    ...vehicle,
                    id: vehicleId,
                    profileId: profile.id,
                    versionKey: Date.now().toString()
                };
            } else {
                throw VehicleNotFound(Date.now());
            }

            resolve(new Promise((resolve, reject) => {
                const newVehicle = inMemory[vehicleId];
                if (newVehicle.profileId in profileIndex) {
                    if (profileIndex[newVehicle.profileId].indexOf(vehicleId) === -1) {
                        profileIndex[newVehicle.profileId] = [
                            ...profileIndex[newVehicle.profileId],
                            vehicleId
                        ];
                    }
                } else {
                    profileIndex[newVehicle.profileId] = [
                        vehicleId
                    ];
                }
                resolve(inMemory[vehicleId] as VehicleRow)
            }))
        }))
    })
}

export const readVehicleById = (id : string) : Promise<VehicleData> => {
    return VehicleStorage.get(id.toString()).then((vehicleRow: VehicleRow) => {
        if (vehicleRow != null) {
            return new Promise((resolve, reject) => resolve(vehicleRow))
        } else {
            return Promise.reject(VehicleNotFound(Date.now()))
        }
    }).catch(() => {
        return Promise.reject(VehicleNotFound(Date.now()))
    })
};
export const readVehiclesByProfileId = (profileId : string) : Promise<Array<VehicleRow|null>> => {
    return new Promise((resolve, reject) => {
        if (profileId in profileIndex) {
            let vehicleIds = profileIndex[profileId];

            return VehicleStorage.getMultiple(vehicleIds).then((vehicles : VehicleRow[] | null) => {
                console.info(vehicles);
                if (vehicles !== null) {
                    return resolve(Object.values(vehicles).filter((v) => v != null))
                } else {
                    return reject(VehicleNotFound(Date.now()))
                }
            })
        } else {
            return reject(ProfileNotFound(Date.now()))
        }
    })
};

