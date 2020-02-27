import {all, call, delay, fork, put, race, take} from "redux-saga/effects";
import {VEHICLE_FETCH_REQUEST, vehicleFetchErrorAction, vehicleLoadAction, vehicleMileageLoadAction} from "./actions";
import {readVehicleById, readVehicleMileageById} from "../../components/api/vehicle/dal";

const PROFILES_ROOT = `/api/vehicles`;
export const VEHICLES_GET_BY_PROFILE_ID_ENDPOINT = (id: string) => `${PROFILES_ROOT}/profile/${id}`;

function* fetchVehiclesByProfileId(id: string) {
    try {
        let response = yield call(fetch, VEHICLES_GET_BY_PROFILE_ID_ENDPOINT(id), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 200) {
            let json = yield response.json();

            const {vehicles} = json.data;
            if (Array.isArray(vehicles) && vehicles.length > 0) {
                for (let i =  0; i < vehicles.length; i++) {
                    yield put(vehicleLoadAction(vehicles[i]));
                }
            }
        }
    } catch(e) {
        console.error("[vehicle/saga] Error fetching profile vehicles:", e);
        yield put(vehicleFetchErrorAction(e));
    }
}

function* fetchVehicleById(ids: string[]) {
    try {
        //load local profile
        let vehicles = yield call(readVehicleById, ids);
        console.debug("[vehicle/saga] loaded", vehicles);
        if (Array.isArray(vehicles) && vehicles.length > 0) {
            for (let i =  0; i < vehicles.length; i++) {
                let vehicleMileage = yield call(readVehicleMileageById, vehicles[i].id);
                console.debug("[vehicle/saga] loaded", vehicleMileage, "mileage");
                yield put(vehicleLoadAction({ ...vehicles[i], vehicleMileage }));
            }
        } else {
            if (vehicles) {
                let vehicleMileage = yield call(readVehicleMileageById, vehicles.id);
                console.debug("[vehicle/saga] loaded", vehicleMileage, "mileage");
                yield put(vehicleLoadAction({ ...vehicles, vehicleMileage }));
            }
        }
    } catch(e) {
        console.error("[vehicle/saga] Error fetching vehicle:", e);
        yield put(vehicleFetchErrorAction(e));
    }
}


function* watchFetchRequests() {
    while (true) {
        let action = yield take(VEHICLE_FETCH_REQUEST);
        let batch = [action.id];
        while (true) {
            const { debounced, latestAction } = yield race({
                debounced: delay(16),
                latestAction: take(VEHICLE_FETCH_REQUEST)
            });

            if (debounced) {
                yield fork(fetchVehicleById, batch);
                break
            }

            batch.push(latestAction.id);
            action = latestAction
        }
    }
}

export default function* rootVehicleSaga() {
    yield all([
        watchFetchRequests()
    ]);
}
