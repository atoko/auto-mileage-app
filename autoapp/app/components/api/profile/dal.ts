// @ts-ignore
import uuidv4 from "uuid/v4"
import {ProfileNotFound} from "../response/profile/exception";
import {ProfileData, ProfileResponse, ProfileRow} from "./dto";
import {readVehiclesByProfileId} from "../vehicle/dal";

interface Dictionary<T> {
    [key: string]: T;
}
let inMemory : Dictionary<ProfileRow> = {
    "local": {
        created: Date.now().toString(),
        id: "local",
        name: "fulano",
        phone: "7874210686"
    }
};
export const createProfile = (profile : ProfileData) : Promise<ProfileData>=> {
    return new Promise((resolve, reject) => {
        resolve(new Promise((resolve, reject) => {
            let id = uuidv4();
            inMemory[id] = {
                ...profile,
                id,
                created: Date.now().toString()
            };

            resolve(inMemory[id] as ProfileData)
        }))
    })
};
export const readProfileById = (id : string) : Promise<ProfileResponse> => {
    return new Promise((resolve, reject) => {
        console.log(JSON.stringify(inMemory));
        if (id in inMemory) {
            resolve(readVehiclesByProfileId(id).then((vehicles) => {
                let profile = inMemory[id];
                return new Promise((resolve, reject) => resolve({
                    ...profile,
                    vehicles
                }))
            }));
        } else {
            reject(ProfileNotFound(Date.now()))
        }
    })
};

