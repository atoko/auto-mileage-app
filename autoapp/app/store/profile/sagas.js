import {all, call, delay, fork, put, race, take, select} from "redux-saga/effects";
import {PROFILE_FETCH_REQUEST, profileLoadAction} from "./actions";
import {readProfileById} from "../../components/api/profile/dal";
import {readVehiclesByProfileId} from "../../components/api/vehicle/dal";
import {vehicleLoadAction} from "../vehicles/actions";

const PROFILES_ROOT = `/api/profiles`;
export const PROFILE_GET_BY_ID_ENDPOINT = (id) => `${PROFILES_ROOT}/id/${id}/`;
export const PROFILE_POST_NEW_ENDPOINT = () => `${PROFILES_ROOT}/new`;

function* fetchProfile(id) {
    try {
        //load local profile
        let {auth} = yield select();
        let profile = yield readProfileById(id);
        if (profile) {
            let vehicles = []
            try {
                vehicles = yield readVehiclesByProfileId(id);
            } catch(e){}

            yield put(profileLoadAction({ ...profile, vehicles }));
            if(vehicles.length) {
                for (let i = 0; i < vehicles.length; i++) {
                    yield put(vehicleLoadAction(vehicles[i]));
                }
            }
        }

    } catch(e) {
        console.error("Error fetching profile:", e)
    }
}

function* watchFetchRequests() {
    while (true) {
        let action = yield take(PROFILE_FETCH_REQUEST);
        let batch = [action.id];
        while (true) {
            const { debounced, latestAction } = yield race({
                debounced: delay(16),
                latestAction: take(PROFILE_FETCH_REQUEST)
            });

            if (debounced) {
                console.log("[profile/saga] fetch")
                yield fork(fetchProfile, batch[0]);
                break
            }

            batch.push(latestAction.id);
            action = latestAction
        }
    }
}

export default function* rootProfileSaga() {
    yield all([
        watchFetchRequests()
    ]);
}
