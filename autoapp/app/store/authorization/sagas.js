import {call, put, all, select, takeLatest, takeEvery} from 'redux-saga/effects';
import {
    AUTH_LOGIN, AUTH_LOGOUT,
    AUTH_VERIFY_REQUEST,
    authLoginAction,
    authLogoutAction,
    requestAuthVerify
} from "./actions";
import {getAuth, save} from "./reducer";
const isServer = typeof window === 'undefined';
export const AUTH_ROOT = `/io/v5/accounts`;
export const VALIDATE_URL = `${AUTH_ROOT}/me/token`;

function* watchVerify() {
    yield takeLatest(AUTH_VERIFY_REQUEST, function*(action) {
            const {token} = action;
            const authorization = `Bearer ${token}`;

            try {
                const response = yield call(fetch, VALIDATE_URL, {
                    method: 'POST',
                    headers: { authorization }
                });

                if (response.status === 200) {
                    let json = yield response.json();
                    let {id, token, expires} = json.data.authentication;
                    yield put(authLoginAction(id, token, expires));
                } else {
                    yield put(authLogoutAction())
                }
            } catch (e) {
                yield put(authLogoutAction())
            }
        }
    );
}


function* watchLogins() {
    yield takeLatest(AUTH_LOGIN, function*() {
        const state = yield select();
        const auth = getAuth(state);
        save(auth);
    });
}


function* watchLogouts() {
    yield takeEvery(AUTH_LOGOUT, function*() {
        const state = yield select();
        const {router} = state;

        if (!isServer && router.route !== "/logout") {
            save(getAuth(state));
            router.replace('/logout');
        }
    });
}


const allowedPaths = ["/", "/logout"];
function* verifyInitialLoad() {
    const state = yield select();
    const { router } = state;
    const { id, token, expires } = getAuth(state);
    if (token) {
        //yield put(requestAuthVerify(token));
        yield put(authLoginAction(id, token, expires));
    } else {
        if (allowedPaths.findIndex((path) => path === router.route) === -1) {
            //yield put(authLogoutAction());
        }
    }
}

export default function* rootAuthSaga() {
    yield all([
        watchVerify(),
        watchLogins(),
        watchLogouts(),
        verifyInitialLoad()
    ]);
}
