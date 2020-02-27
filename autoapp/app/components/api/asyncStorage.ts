import AsyncStorageFactory from '@react-native-community/async-storage';
import LegacyStorage from '@react-native-community/async-storage-backend-legacy';
import {ProfileRow, ProfileVehicleRow} from "./profile/dto";
import {VehicleRow} from "./vehicle/dto";

const legacyStorage = new LegacyStorage();

export const ProfileStorage =  AsyncStorageFactory.create<ProfileRow>(legacyStorage);
export const ProfileVehicleIndexStorage = AsyncStorageFactory.create<ProfileVehicleRow>(legacyStorage);
export const VehicleStorage =  AsyncStorageFactory.create<VehicleRow>(legacyStorage);
