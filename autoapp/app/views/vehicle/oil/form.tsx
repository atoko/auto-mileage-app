import {connect} from "react-redux";
import React from "react";
import moment from "moment";
import {Platform, TouchableOpacity} from "react-native";
import PushNotification from "react-native-push-notification";
import {Button, Card, CardItem, Container, Content, H2, Icon, Input, Text, View} from "native-base";
import DatePicker from "@react-native-community/datetimepicker"

import {getAuth} from "../../../store/authorization/reducer";
import {getVehicleById, getVehicleIsFetching} from "../../../store/vehicles/reducer";
import {vehicleLoadAction} from "../../../store/vehicles/actions";
import {VehiclePutResponse} from "../../../api/vehicles/update";
import {UpdateVehicleOil} from "../../../api/vehicles/oil/put";

const TODAY = new Date(Date.now());
const IS_IOS = Platform.OS === 'ios';

class VehicleMileageForm extends React.PureComponent<any, any> {
    state = {
        showDatePicker: false,
        mileageCurrent: undefined,
        notificationDate: undefined,
        versionKey: null
    };

    onSave = (event?: any) => {
        const {auth, navigation, route} = this.props;
        const {mileageCurrent, notificationDate} = this.state;
        const {vehicleId} = route?.params;

        this.setState({
            saving: true
        });

        if (notificationDate) {
            //this.setNotification(new Date(notificationDate as unknown as number))
        } else {
            PushNotification.cancelLocalNotifications({
                id: vehicleId
            })
        }

        UpdateVehicleOil(
            {
                authentication: auth.token,
                vehicleId
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
    synchronizeState = () => {
        const {vehicleIsLoading, vehicle} = this.props;
        if (!vehicleIsLoading && vehicle) {
            this.setState({
                versionKey: vehicle?.versionKey
            })
        }
    }
    componentDidUpdate() {
        if (this.props.vehicle?.versionKey !== this.state.versionKey) {
            this.synchronizeState();
        }
    }
    componentDidFocus = (): void => {
        this.synchronizeState();
    }
    componentDidMount() {
        const {navigation} = this.props;
        if (navigation) {
            navigation.addListener('focus', this.componentDidFocus);
        }
        this.synchronizeState();
    }
    componentWillUnmount() {
        const {navigation} = this.props;
        if (navigation) {
            navigation.removeListener('focus', this.componentDidFocus)
        }
    }
    render() {
        const {vehicleId} = this.props.route?.params || {};
        const {vehicle = {}} = this.props;
        const {vehicleMileage = []} = vehicle;
        // const {editing, editingMileage} = this.state;

        const lastOil = vehicleMileage.filter(({type}: any) => type === "oil")[0];

        return <Container>
            <Content>
                <Card>
                    <CardItem header bordered>
                        <Icon name={"counter"} type={"MaterialCommunityIcons"}></Icon>
                        <Input
                            editable={false}
                        >
                            Current Mileage
                        </Input>
                        <Input
                            placeholder={"#"}
                            keyboardType={"number-pad"}
                            editable={false}
                            defaultValue={vehicleId ? vehicle?.mileage?.current : ""}
                            onChangeText={(text) =>
                                this.setState({mileageCurrent: text})
                            }
                        />
                    </CardItem>
                    {
                        vehicleId && <CardItem bordered>

                            <Input
                                editable={false}
                            >
                                Current Date
                            </Input>
                            { <Input
                                editable={false}
                            >
                                {
                                    moment.unix(TODAY.getTime() as unknown as number / 1000).format("ll")
                                }
                            </Input>
                            }
                        </CardItem>
                    }
                    <CardItem>

                        <Button
                            large
                            onPress={this.onSave}
                        >
                            <Text>Save</Text>
                        </Button>
                    </CardItem>
                </Card>
            </Content>
            <CardItem bordered>
                <Input editable={false}>
                    Last updated:
                </Input>
                {
                    vehicleId && lastOil && <Input
                        editable={false}
                    >
                        <Text>
                            {moment.unix(parseInt(lastOil.created) / 1000).format("lll")}
                        </Text>
                    </Input>
                }
            </CardItem>
        </Container>
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