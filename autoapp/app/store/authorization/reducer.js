import { combineReducers } from "redux";
import * as actions from "./actions";
import storageFactory from "../storageFactory";
import {authLoginAction} from "./actions";
import uuidv4 from "uuid/v4"
const isServer = typeof window === 'undefined';
const localStore = storageFactory(!isServer && (() => localStorage));
const sessionStore = storageFactory(!isServer && (() => sessionStorage));

let id = (state = null, action) => {
    switch (action.type) {
        case actions.AUTH_LOGOUT:
            return null;
        case actions.AUTH_LOGIN:
            return action.id;
        default:
            return state;
    }
};

let token = (state = null, action) => {
    switch (action.type) {
        case actions.AUTH_LOGOUT:
            return null;
        case actions.AUTH_LOGIN:
            return action.token;
        default:
            return state;
    }
};


let expires = (state = null, action) => {
    switch (action.type) {
        case actions.AUTH_LOGOUT:
            return null;
        case actions.AUTH_LOGIN:
            return action.expires;
        default:
            return state;
    }
};


let ready = (state = null, action) => {
    switch (action.type) {
        case actions.AUTH_LOGOUT:
            return false;
        case actions.AUTH_LOGIN:
            return true;
        default:
            return state;
    }
};

let fetching = (state = false, action) => {
    switch (action.type) {
        case actions.AUTH_VERIFY_REQUEST:
            return true;
        case actions.AUTH_LOGOUT:
        case actions.AUTH_LOGIN:
            return false;
        default:
            return state;
    }
}

export const key = "auth";
const reducer = combineReducers({
    id,
    token,
    expires,
    ready,
    fetching,
});
export default reducer;

const storageKey = "tuneapp/v1/auth";
export const save = state => {
    if (!isServer) {
        let saved = { ...state };
        saved.ready = null;
        try {
            const stringAuth = JSON.stringify(saved);
            localStore.setItem(storageKey, stringAuth);
            sessionStore.setItem(storageKey, stringAuth);
        } catch (e) {}
    }
};
export const load = () => {
    if (!isServer) {
        try {
            const local = localStore.getItem(storageKey);
            const session = sessionStore.getItem(storageKey);
            if (session !== null) {
                return JSON.parse(session) || reducer(undefined, {});
            } else {
                return JSON.parse(local) || reducer(undefined, {});
            }
        } catch(e) {}

        return reducer(undefined, authLoginAction(
            "local",
            "local",
            null
        ));
    }
};

export const getAuth = state => {
    return state[key];
};