import {VEHICLE_FETCH_ERROR, VEHICLE_FETCH_REQUEST, VEHICLE_LOAD} from "./actions";

export const key = "vehicles";

export const defaultState = () => ({
    map: {},
    isFetching: null
});

const loadVehicle = (state = {}, action = {}) => {
    const {vehicle} = action;

    if (vehicle && vehicle.id) {
        return {
            map: {
                ...state.map,
                [vehicle.id]: vehicle
            },
            isFetching: false
        }
    } else {
        return state;
    }
};

const reducer = (state = null, action = {}) => {
  const {type} = action;
  switch (type) {
      case VEHICLE_LOAD:
          return loadVehicle(state, action);
      case VEHICLE_FETCH_REQUEST:
          return {...state, isFetching: true};
      case VEHICLE_FETCH_ERROR:
          return { ...state, isFetching: false};
      default:
          return state;
  }
};


export const getVehicleMap = (state) => {
    return state[key] && state[key].map;
};

export const getVehicleById = (state, id) => {
    return getVehicleMap(state) && state[key].map[id];
};

export const getVehicleIsFetching = (state, id) => {
    return state[key] && state[key].isFetching;
};

export default reducer;