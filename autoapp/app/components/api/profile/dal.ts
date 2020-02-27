// @ts-ignore
import uuidv4 from "uuid/v4"
import {ProfileNotFound} from "../response/profile/exception";
import {ProfileData, ProfileResponse, ProfileRow} from "./dto";

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

export const PROFILE_NAMESPACE = (key: string) => `profiles/${key}`;
export const PROFILE_ID = (id: string) => PROFILE_NAMESPACE((id));
export const PROFILE_VEHICLE = (id: string) => `${PROFILE_ID(id)}/vehicles`;

export const createProfile = (profile : ProfileData) : Promise<ProfileData>=> {
    return new Promise((resolve) => {
        resolve(new Promise((resolve) => {
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
        if (id in inMemory) {
                let profile = inMemory[id];
                return resolve(new Promise((resolve) => resolve({
                    ...profile
                })))
        } else {
            reject(ProfileNotFound(Date.now()))
        }
    })
};

