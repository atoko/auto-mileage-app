import AsyncStorageFactory from '@react-native-community/async-storage';
import LegacyStorage from '@react-native-community/async-storage-backend-legacy';
import {ProfileRow, ProfileVehicleRow} from "./profile/dto";
import {VehicleRow} from "./vehicle/dto";
import NewVehicle from "../../api/vehicles/new";

const legacyStorage = new LegacyStorage();

export const ProfileStorage =  AsyncStorageFactory.create<ProfileRow>(legacyStorage);
export const ProfileVehicleIndexStorage = AsyncStorageFactory.create<ProfileVehicleRow>(legacyStorage);
export const VehicleStorage =  AsyncStorageFactory.create<VehicleRow>(legacyStorage);

const INIT_FLAG = "_FLAG_INITIALIZED";
(async () => {
    let isInitialized = await VehicleStorage.get(INIT_FLAG);
    isInitialized = JSON.parse(isInitialized);
    if (isInitialized == null) {
        await NewVehicle({
            authentication: "local",
            body: {
                make: "Mazda",
                model: "3",
                year: "2019",
                mileage: {
                    current: "0"
                }
            }
        });
        await VehicleStorage.set(INIT_FLAG, "true");
    }
})();
