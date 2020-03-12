import {connect} from "react-redux";
import React from "react";

import {getAuth} from "../../../store/authorization/reducer";
import {getVehicleById, getVehicleIsFetching} from "../../../store/vehicles/reducer";
import {vehicleLoadAction} from "../../../store/vehicles/actions";
import {Button, Card, CardItem, Container, H2, Icon, Input, Text, View} from "native-base";
import UpdateVehicle, {VehiclePutResponse} from "../../../api/vehicles/update";
import {UpdateVehicleMileage} from "../../../api/vehicles/mileage/put";

class VehicleMileageForm extends React.PureComponent<any, any> {
    onSave = (event?: any) => {
        const {auth, navigation, loadVehicleToStore, route} = this.props;
        const {mileageCurrent} = this.state;
        const {vehicleId} = route?.params;

        this.setState({
            saving: true
        });
        UpdateVehicleMileage(
            {
                authentication: auth.token,
                vehicleId,
                body: {
                    mileage: {
                        current: mileageCurrent,
                        notificationDate: this.state.notificationDate
                    }
                }
            }
        ).then((vehicle: VehiclePutResponse) => {
            if (vehicle.data) {
                const {vehicles} = vehicle.data;
                navigation.pop();
            } else {
                this.setState({
                    error: vehicle.error,
                    saving: false
                })
            }
        });
    };
    render() {
        const {vehicleId} = this.props.route?.params || {};
        const {vehicle = {}} = this.props;
        const {vehicleMileage = []} = vehicle;
        // const {editing, editingMileage} = this.state;

        const lastMileage = vehicleMileage[0];

        return <Card>
            <CardItem header bordered>
                <Icon name={"counter"} type={"MaterialCommunityIcons"}></Icon>
                <Input
                    editable={false}
                >
                    <H2>Mileage</H2>
                </Input>
                <View>


                </View>
                <Input
                    placeholder={"#"}
                    keyboardType={"number-pad"}
                    editable={true}
                    defaultValue={vehicleId ? vehicle?.mileage?.current : ""}
                    onChangeText={(text) =>
                        this.setState({mileageCurrent: text})
                    }
                />
            </CardItem>
            {/*<CardItem bordered>*/}
            {/*    <Input editable={false}>*/}
            {/*        Last updated:*/}
            {/*    </Input>*/}
            {/*    {*/}
            {/*        vehicleId && lastMileage && <Input*/}
            {/*            editable={false}*/}
            {/*        >*/}
            {/*            <Text>*/}
            {/*                {moment.unix(parseInt(lastMileage.created) / 1000).format("lll")}*/}
            {/*            </Text>*/}
            {/*        </Input>*/}
            {/*    }*/}
            {/*</CardItem>*/}
            {/*{*/}
            {/*    vehicleId && <CardItem bordered>*/}
            {/*        <Input*/}
            {/*            editable={false}*/}
            {/*        >*/}
            {/*            Next reminder:*/}
            {/*        </Input>*/}
            {/*        {*/}
            {/*            this.state.notificationDate &&*/}
            {/*            <Input*/}
            {/*                editable={false}*/}
            {/*            >*/}
            {/*                <Text>*/}
            {/*                    {moment.unix(parseInt(this.state.notificationDate as unknown as string) / 1000).format("ll")}*/}
            {/*                </Text>*/}
            {/*            </Input>*/}
            {/*        }*/}
            {/*    </CardItem>*/}
            {/*}*/}
            <CardItem>

                <Button
                    large
                    onPress={this.onSave}
                >
                    <Text>Save</Text>
                </Button>
            </CardItem>
        </Card>
    }
}

const mapStateToProps = (state: any, props: any) => {
    const {vehicleId} = props.route?.params || {};
    return {
        auth: getAuth(state),
        vehicle: getVehicleById(state, vehicleId),
        vehicleIsFetching: getVehicleIsFetching(state),
        vehicleId
    }
};
const mapDispatchToProps = (dispatch: (action: any) => {}) => ({
    loadVehicleToStore: (vehicle: any) => dispatch(vehicleLoadAction(vehicle))
});
export default connect(mapStateToProps, mapDispatchToProps)(VehicleMileageForm);