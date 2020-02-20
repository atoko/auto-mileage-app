import {VehicleData, VehicleResponse} from "../vehicle/dto";

// @ts-ignore
global.window = null;

const microValidator = require('micro-validator').default;

export interface ProfileData {
    name: string;
    phone: string;
}

export interface ProfileRow extends ProfileData {
    id: string;
    created: string;
}

export interface ProfileResponse extends ProfileRow {
    vehicles?: Array<VehicleResponse | null>
}

export const ProfileRequestValidation = (profile: ProfileData) => {
    return microValidator.validate({
        name: {
            required: {
                errorMsg: `name required`
            }
        },
        email: {
            email: {
                errorMsg: `email invalid`
            }
        },
        phone: {
            required: {
                errorMsg: `phone required`
            },
            regex: {
                pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                errorMsg: `pattern invalid`
            }
        }
    }, profile);
}