import usa from "./us/cars";
const makesByYear = () => Object.entries(usa).reduce(((previousValue, currentValue) => {
    const year = currentValue[0];
    const makes = Object.keys(currentValue[1]);
    return {...previousValue, [year]: makes}
}), {});
let _makesByYear: any = null;

export const getMakesByYear = async (year: string): Promise<any> => {
    if (_makesByYear === null) {
        _makesByYear = makesByYear()
    }
    if (_makesByYear[year]) {
        return Promise.resolve(_makesByYear[year])
    } else {
        return Promise.reject({ error: {
            code: "YEAR_NOT_FOUND",
            reason: "No reason"
        }})
    }
};

export const getModelsByYearAndMake = async (year: string, make: string): Promise<any> => {
    if (usa[year] && usa[year][make]) {
        return Promise.resolve(usa[year][make].map((car: any) => car.model))
    }
};