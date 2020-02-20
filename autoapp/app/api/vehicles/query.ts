import {readVehicleById} from "../../components/api/vehicle/dal";
import {MethodNotSupported, UnknownException} from "../../components/api/response/exception";
import {ProfileNotFound, ProfileNotFoundCode} from "../../components/api/response/profile/exception";

export default (request: any, response: any): any => {
    if (request.method === "GET") {
        readVehicleById(request.query.id).then((vehicle) => {
            response.status(200).json({
                data: {
                    vehicles: [
                        vehicle
                    ]
                }
            })
        }).catch((error) => {
            if (error.code === ProfileNotFoundCode) {
                response.status(404).json(ProfileNotFound(Date.now()));
            } else {
                console.error(error);
                response.status(500).json(UnknownException(Date.now()));
            }
        })
    } else {
        response.status(400).json(MethodNotSupported(Date.now()))
    }
}