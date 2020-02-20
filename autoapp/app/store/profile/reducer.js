import {PROFILE_LOAD} from "./actions";

export const key = "profiles";

export const defaultState = () => ({
    map: {}
});

const loadProfile = (state = {}, action = {}) => {
    const {profile} = action;
    if (profile && profile.id) {
        return {
            map: {
                ...state.map,
                [profile.id]: profile
            }
        }
    } else {
        return state;
    }
};

const reducer = (state = null, action = {}) => {
  const {type} = action;
  switch (type) {
      case PROFILE_LOAD:
          return loadProfile(state, action);
      default:
          return state;
  }
};


export const getProfileMap = (state) => {
    return state[key] && state[key].map;
};

export const getProfileById = (state, id) => {
    return getProfileMap(state) && state[key].map[id];
};


export default reducer;