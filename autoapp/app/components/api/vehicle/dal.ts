// @ts-ignore
import uuidv4 from "uuid/v4"
import {ProfileNotFound} from "../response/profile/exception";
import {VehicleData, VehicleRow} from "./dto";
import {ProfileData, ProfileRow} from "../profile/dto";
import {VehicleNotFound} from "../response/vehicle/exception";

interface Dictionary<T> {
    [key: string]: T;
}
let inMemory : Dictionary<VehicleRow> = {
    "12345": {
        id: "12345",
        profileId: "local",
        name: "Taurus",
        make: "mi",
        model: "azul",
        year: "1993",
        created: Date.now().toString(),
        versionKey: Date.now().toString()
    }
};
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
            inMemory[id] = newVehicle;
            resolve(new Promise((resolve, reject) => {
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
                resolve(inMemory[id] as VehicleRow)
            }))
        }))
    })
};

export const updateVehicle = (profile : ProfileRow, vehicleId: string, vehicle: VehicleData) : Promise<VehicleRow>=> {
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
};

export const readVehicleById = (id : string) : Promise<VehicleData> => {
    return new Promise((resolve, reject) => {
        if (id in inMemory) {
            return resolve(new Promise((resolve, reject) => resolve(inMemory[id])))
        } else {
            return reject(VehicleNotFound(Date.now()))
        }
    })
};
export const readVehiclesByProfileId = (profileId : string) : Promise<Array<VehicleRow|null>> => {
    return new Promise((resolve, reject) => {
        if (profileId in profileIndex) {
            let vehicles = profileIndex[profileId].map((vehicleId) => {
                if (vehicleId in inMemory) {
                    return inMemory[vehicleId]
                } else {
                    return null
                }
            }).filter((vehicle) => vehicle !== null);
            return resolve(vehicles)
        } else {
            return reject(ProfileNotFound(Date.now()))
        }
    })
};

