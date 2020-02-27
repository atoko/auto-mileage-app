// @ts-ignore
import uuidv4 from "uuid/v4"
import {ProfileNotFound} from "../response/profile/exception";
import {MileageData, VehicleData, VehicleRow} from "./dto";
import {ProfileRow} from "../profile/dto";
import {VehicleNotFound} from "../response/vehicle/exception";
import {ProfileVehicleIndexStorage, VehicleStorage} from "../asyncStorage";
import {PROFILE_VEHICLE} from "../profile/dal";

export const VEHICLE_NAMESPACE = (key: string) => `vehicles/${key}`;
export const VEHICLE_ID = (id: string) => VEHICLE_NAMESPACE(id.toString());
export const VEHICLE_MILEAGE = (id: string) => `${VEHICLE_ID(id)}/mileage`;

const updateMileage = async (id: string, mileage: MileageData) : Promise<void> => {
    const vehicleLog = await VehicleStorage.get(VEHICLE_MILEAGE(id));
    const entry = {
        id: uuidv4().substr(0, 8),
        mileage: mileage.current,
        created: Date.now().toString()
    };
    let newLog = [entry];
    if (vehicleLog != null) {
        newLog = [...JSON.parse(vehicleLog), entry]
    }
    await VehicleStorage.set(VEHICLE_MILEAGE(id), JSON.stringify(newLog));
};

export const createVehicle = async (profile : ProfileRow, vehicle: VehicleData) : Promise<VehicleRow>=> {
    let id = uuidv4();
    let profileId = profile.id;
    const newVehicle = { ...vehicle,
        id,
        profileId,
        created: Date.now().toString(),
        versionKey: Date.now().toString()
    };

    try {
        {
            await VehicleStorage.set(VEHICLE_ID(id), JSON.stringify(newVehicle));
        }
        {
            const profileIndex = await ProfileVehicleIndexStorage.get(PROFILE_VEHICLE(profileId));
            let newIndex = [id];
            if (profileIndex != null) {
                newIndex = [id, ...JSON.parse(profileIndex)]
            }
            await ProfileVehicleIndexStorage.set(PROFILE_VEHICLE(profileId), JSON.stringify(newIndex));
        }
        {
            if (vehicle.mileage.current != null) {
                await updateMileage(id, vehicle.mileage);
            }
        }
    } catch (e) {
        console.error("[vehicle/dal]", e)
    }

    return newVehicle;
};

export const updateVehicle = async (profile : ProfileRow, vehicleId: string, vehicle: VehicleData) : Promise<VehicleRow> => {
       const vehicleRow = await VehicleStorage.get(VEHICLE_ID(vehicleId));
       if (vehicleRow !== null) {
           const vehicleSnapshot = JSON.parse(vehicleRow);
           const newVehicle = {
               ...vehicleSnapshot,
               ...vehicle,
               id: vehicleId,
               versionKey: Date.now().toString()
           };

           await VehicleStorage.set(VEHICLE_ID(vehicleId), JSON.stringify(newVehicle));
           {
               if (vehicleSnapshot.mileage.current !==  vehicle.mileage.current) {
                   await updateMileage(vehicleId, vehicle.mileage);
               }
           }
           return newVehicle
       } else {
           throw VehicleNotFound(Date.now());
       }
};

export const readVehicleById = (id : string[]) : Promise<VehicleData> => {
    return VehicleStorage.getMultiple(id.map(VEHICLE_ID)).then((vehicleRows: VehicleRow[] | null) => {
        if (vehicleRows != null) {
            const resultSet = Object.values(vehicleRows).map(JSON.parse);
            return Promise.resolve(resultSet.filter((v: any) => v != null))
        } else {
            return Promise.reject(VehicleNotFound(Date.now()))
        }
    }).catch((e: any) => {
        console.error("[api/vehicle/dal]", e);
        return Promise.reject(VehicleNotFound(Date.now()))
    })
};

export const readVehicleMileageById = async (id : string) : Promise<VehicleData> => {
    try {
        const vehicleMileageRows = await VehicleStorage.get(VEHICLE_MILEAGE(id));
        if (vehicleMileageRows != null) {
            const resultSet = JSON.parse(vehicleMileageRows);
            return resultSet.sort((a: any, b: any) => b.created - a.created);
        } else {
            return Promise.reject(VehicleNotFound(Date.now()))
        }
    }
    catch(e) {
        console.error("[api/vehicle/dal]" ,e);
        throw e;
    }
};


export const readVehiclesByProfileId = (profileId : string) : Promise<Array<VehicleRow|null>> => {
    return new Promise((resolve, reject) => {
        return ProfileVehicleIndexStorage.get(PROFILE_VEHICLE(profileId)).then((profileIndex : string | null) => {
            if (profileIndex != null) {
                let vehicleIds = JSON.parse(profileIndex);
                return VehicleStorage.getMultiple(vehicleIds.map(VEHICLE_ID)).then((vehicles : VehicleRow[] | null) => {
                    if (vehicles !== null) {
                        return resolve(Object.values(vehicles).filter((v: any) => v != null).map((v: any) => JSON.parse(v)))
                    } else {
                        return reject(VehicleNotFound(Date.now()))
                    }
                })
            } else {
                return reject(ProfileNotFound(Date.now()))
            }
        })
    })
};

