import {VEHICLE_FETCH_ERROR, VEHICLE_FETCH_REQUEST, VEHICLE_LOAD} from "./actions";

export const key = "vehicles";

interface VehicleStore {
    map: object,
    isFetching: boolean | null
}

export const defaultState: () => VehicleStore = () => ({
    map: {},
    isFetching: null
});

const loadVehicle = (state: VehicleStore = defaultState(), action: any = {}) => {
    let {vehicle} = action;

    if (vehicle && vehicle.id) {
        // @ts-ignore
        const currentVehicle = state.map[vehicle.id];
        if (currentVehicle !== undefined) {
            vehicle = { ...currentVehicle, ...vehicle }
        }
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

const reducer = (state: any = null, action: any = {}) => {
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


export const getVehicleMap = (state: any) => {
    return state[key] && state[key].map;
};

export const getVehicleById = (state: any, id: string) => {
    return getVehicleMap(state) && state[key].map[id];
};

export const getVehicleIsFetching = (state: any) => {
    return state[key] && state[key].isFetching;
};

export default reducer;