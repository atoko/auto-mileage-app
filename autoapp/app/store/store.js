import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import * as auth from './authorization/reducer';
import * as profile from './profile/reducer';
import * as vehicles from './vehicles/reducer';
import rootProfileSaga from "./profile/sagas";
import rootAuthSaga from "./authorization/sagas";
import rootVehicleSaga from "./vehicles/sagas";

export default (initialState = {}) => {
    let state = {
        [auth.key]: auth.load(),
        [profile.key]: profile.defaultState(),
        [vehicles.key]: vehicles.defaultState(),
        ...initialState
    };
    const sagaMiddleware = createSagaMiddleware();

    let middlewares = [
        sagaMiddleware
    ];

    const store = createStore(
        combineReducers({
            [auth.key]: auth.default,
            [profile.key]: profile.default,
            [vehicles.key]: vehicles.default
        }),
        state,
        compose(
            applyMiddleware(...middlewares),
            () => {
                    return createStore;
                }
        )
    );

    sagaMiddleware.run(rootAuthSaga);
    sagaMiddleware.run(rootProfileSaga);
    sagaMiddleware.run(rootVehicleSaga);
    return {
        ...store,
        runSaga: sagaMiddleware.run
    };
};
