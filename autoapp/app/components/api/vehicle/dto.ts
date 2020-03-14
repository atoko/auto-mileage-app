// @ts-ignore
global.window = null;
const microValidator = require('micro-validator').default;

export interface OilData {
    lastChange: number
}

export interface MileageData {
    current: string,
    notificationDate?: string | null
}

export interface VehicleData {
    make: string;
    model: string;
    year: string;
    mileage: MileageData;
    oil: OilData;
    imageData?: string | null;
}

export interface VehicleRow extends VehicleData {
    id: string;
    profileId: string;
    created: string;
    versionKey: string;
}

export interface VehicleResponse extends VehicleRow {
    imageFull?: string | null;
    imageThumbnail?: string | null;
}

export const VehicleRequestValidation = (vehicle: VehicleData) => {
    return {
        ...microValidator.validate({
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
        }, vehicle),
        ...MileageRequestValidation(vehicle.mileage)
    };
};

export const MileageRequestValidation = (mileage: MileageData) => {
    return microValidator.validate({
        current: {
            required: {
                errorMsg: `current mileage required`
            },
            regex: {
                pattern: /^(0|[1-9][0-9]*)$/,
                errorMsg: 'mileage must be numeric'
            }
        },
    }, mileage);
};