// @ts-ignore
global.window = null;
const microValidator = require('micro-validator').default;

export interface VehicleData {
    name: string;
    make: string;
    model: string;
    year: string;
}

export interface VehicleRow extends VehicleData {
    id: string;
    profileId: string;
    created: string;
    versionKey: string;
}

export interface VehicleResponse extends VehicleRow {

}

export const VehicleRequestValidation = (vehicle: VehicleData) => {
    return microValidator.validate({
        year: {
            required: {
                errorMsg: `year required`
            }
        },
        model: {
            required: {
                errorMsg: `model required`
            }
        },
        make: {
            required: {
                errorMsg: `make required`
            }
        },
    }, vehicle);
}