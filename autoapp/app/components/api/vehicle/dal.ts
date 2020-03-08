// @ts-ignore
import uuidv4 from "uuid/v4"
import {encode} from "blurhash";
import Base64Binary from "../utils/base64-binary";
import {Image} from "react-native";

import {ProfileNotFound} from "../response/profile/exception";
import {MileageData, VehicleData, VehicleRow} from "./dto";
import {ProfileRow} from "../profile/dto";
import {VehicleNotFound, VehicleNotFoundCode} from "../response/vehicle/exception";
import {ProfileVehicleIndexStorage, VehicleStorage} from "../asyncStorage";
import {PROFILE_VEHICLE} from "../profile/dal";

export const VEHICLE_NAMESPACE = (key: string) => `vehicles/${key}`;
export const VEHICLE_ID = (id: string) => VEHICLE_NAMESPACE(id.toString());
export const VEHICLE_MILEAGE = (id: string) => `${VEHICLE_ID(id)}/mileage`;
export const VEHICLE_IMAGE = (id: string) => `${VEHICLE_ID(id)}/image`;
export const VEHICLE_THUMBNAIL = (id: string) => `${VEHICLE_ID(id)}/thumbnail`;

const HASH_IMAGE = (data: string) => data.slice(128, 128 + 32);
const BASE_64_IMAGE = (data: string) => `data:image/png;base64,${data}`;
const createBlurhash = async (imageData: string) => {
    return new Promise(((resolve, reject) => {
        Image.getSize(BASE_64_IMAGE(imageData), (width, height) => {
            console.debug("[api/vehicle/dal] read width and height of upload", width, height);
            const imageBuffer = new Uint8ClampedArray(Base64Binary.decodeArrayBuffer(imageData))
            const blurHash = encode(imageBuffer, width, height, 7, 7)
            resolve(blurHash)
        }, (error) => {
            console.debug(["[api/vehicle/dal] image processing error: ", JSON.stringify(error)])
            reject({
                error: {
                    code: "IMAGE_PROCESSING_FAILED",
                    reason: error,
                    timestamp: Date.now()
                }
            })
        });
    }))
}

const updateImageData = async (id: string, imageData: string) : Promise<void> => {
    console.debug("[api/vehicle/dal] writing image data");
    await VehicleStorage.set(VEHICLE_IMAGE(id), imageData);
    await VehicleStorage.set(VEHICLE_THUMBNAIL(id), imageData);
};

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
    let {imageData} = vehicle;

    delete vehicle.imageData;

    const newVehicle = { ...vehicle,
        id,
        profileId,
        created: Date.now().toString(),
        versionKey: Date.now().toString()
    };

    if (imageData) {
        newVehicle.imageData = HASH_IMAGE(imageData)
        //newVehicle.imageData = await createBlurhash(imageData)
    }

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
        {
            if (imageData) {
                await updateImageData(id, imageData)
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
           const {imageData} = vehicle;

           delete vehicle.imageData;
           const newVehicle = {
               ...vehicleSnapshot,
               ...vehicle,
               id: vehicleId,
               versionKey: Date.now().toString()
           } as VehicleRow;

           if (imageData) {
               newVehicle.imageData = HASH_IMAGE(imageData)
               //newVehicle.imageData = await createBlurhash(imageData)
           }

           await VehicleStorage.set(VEHICLE_ID(vehicleId), JSON.stringify(newVehicle));
           {
               if (vehicle.mileage && vehicleSnapshot.mileage.current !==  vehicle.mileage.current) {
                   await updateMileage(vehicleId, vehicle.mileage);
               }
           }
           {
               const { imageData : currentImageHash } = vehicleSnapshot;
               const { imageData : newImageHash } = newVehicle;

               console.debug(`[api/vehicle/dal] comparing imageData: 
                    previous: ${currentImageHash}
                    new: ${newImageHash}
                    raw: ${imageData?.slice(0, 32)}
               `);

               if (imageData && currentImageHash !== newImageHash) {
                   await updateImageData(vehicleId, imageData);
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

export const readVehicleImageById = async (id : string) : Promise<string> => {
    try {
        const vehicleImage = await VehicleStorage.get(VEHICLE_IMAGE(id));
        if (vehicleImage != null) {
            return vehicleImage;
        } else {
            throw VehicleNotFound(Date.now())
        }
    }
    catch(e) {
        const {error} = e;
        if (error) {
            const {code} = error;
            if (code !== VehicleNotFoundCode) {
                console.error(`[vehicle/api/dal] ${JSON.stringify(e)}`)
            }
        } else {
            console.error(`[vehicle/api/dal] ${JSON.stringify(e)}`)
        }
        throw e;
    }
};

export const readVehicleThumbnailById = async (ids : string[]) : Promise<string> => {
    try {
        const vehicleImage = await VehicleStorage.getMultiple(ids.map(VEHICLE_IMAGE));
        if (vehicleImage != null) {
            return vehicleImage.filter((v: any) => v != null);
        } else {
            throw VehicleNotFound(Date.now())
        }
    }
    catch(e) {
        const {error} = e;
        if (error) {
            const {code} = error;
            if (code !== VehicleNotFoundCode) {
                console.error(`[vehicle/api/dal] ${JSON.stringify(e)}`)
            }
        } else {
            console.error(`[vehicle/api/dal] ${JSON.stringify(e)}`)
        }
        throw e;
    }
};


export const readVehicleMileageById = async (id : string) : Promise<MileageData[]> => {
    try {
        const vehicleMileageRows = await VehicleStorage.get(VEHICLE_MILEAGE(id));
        if (vehicleMileageRows != null) {
            const resultSet = JSON.parse(vehicleMileageRows) as MileageData[];
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


export const readVehiclesByProfileId = async (profileId : string) : Promise<Array<VehicleRow|null>> => {
    return new Promise(async (resolve, reject) => {
        const profileIndex = await ProfileVehicleIndexStorage.get(PROFILE_VEHICLE(profileId));
        if (profileIndex != null) {
            let vehicleIds = JSON.parse(profileIndex);
            const vehicles = await VehicleStorage.getMultiple(vehicleIds.map(VEHICLE_ID));
            const vehicleThumbnails = await VehicleStorage.getMultiple(vehicleIds.map(VEHICLE_THUMBNAIL));
            if (vehicles !== null) {
                return resolve(Object.values(vehicles).filter((v: any) => v != null).map((v: any) => {
                    const vehicleData = JSON.parse(v);
                    const {id: vehicleId} = vehicleData;
                    let imageThumbnail = null;
                    if (vehicleThumbnails[vehicleId]) {
                        imageThumbnail = vehicleThumbnails[vehicleId]
                    }
                    return { ...vehicleData, imageThumbnail }
                }))
            } else {
                return reject(VehicleNotFound(Date.now()))
            }
        } else {
            return reject(ProfileNotFound(Date.now()))
        }

    })
};
