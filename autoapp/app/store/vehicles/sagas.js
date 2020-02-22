import {all, call, delay, fork, put, race, take, select} from "redux-saga/effects";
import {VEHICLE_FETCH_REQUEST, vehicleFetchErrorAction, vehicleLoadAction} from "./actions";
import {readVehicleById} from "../../components/api/vehicle/dal";

const PROFILES_ROOT = `/api/vehicles`;
export const VEHICLES_GET_BY_PROFILE_ID_ENDPOINT = (id) => `${PROFILES_ROOT}/profile/${id}`;

function* fetchVehiclesByProfileId(id) {
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
            if (typeof vehicles === "Array" && vehicles.length > 0) {
                for (let i =  0; i < vehicles.length; i++) {
                    yield put(vehicleLoadAction(vehicles[i]));
                }
            }
        }
    } catch(e) {
        console.error("Error fetching profile vehicles:", e)

        yield put(vehicleFetchErrorAction());
    }
}

function* fetchVehicleById(id) {
    try {
        //load local profile
        let {auth} = yield select();
        console.debug("vehiclesaga/fetching vehicle", id);
        let vehicle = yield readVehicleById(id);

        console.debug("vehiclesaga/vehicle loaded", vehicle);
        if (vehicle) {
            yield put(vehicleLoadAction({ ...vehicle }));
        }

    } catch(e) {
        console.error("vehiclesaga/Error fetching vehicle:", e)
        yield put(vehicleFetchErrorAction());
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
