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
import {UpdateVehicleMileage} from "../../../api/vehicles/mileage/put";

const TODAY = new Date(Date.now());
const IS_IOS = Platform.OS === 'ios';

class VehicleMileageForm extends React.PureComponent<any, any> {
    state = {
        showDatePicker: false,
        mileageCurrent: undefined,
        notificationDate: undefined,
        versionKey: null
    };

    setNotification(notificationDate: Date) {
        const {vehicle, auth} = this.props;
        const {year, make, model} = vehicle;
        const notificationId = parseInt(`0x${vehicle.id.slice(0, 8)}`);

        PushNotification.localNotificationSchedule({
            id: notificationId as unknown as string,
            title: "Update alert", // (optional)
            message: `Time to update the mileage for ${year} ${make} ${model}`, // (required)
            playSound: false, // (optional) default: true
            soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played),
            userInfo: {
                id: auth.id,
                vehicleId: vehicle.id
            },
            date: notificationDate
        });
    }

    onSave = (event?: any) => {
        const {auth, navigation, route} = this.props;
        const {mileageCurrent, notificationDate} = this.state;
        const {vehicleId} = route?.params;

        this.setState({
            saving: true
        });

        if (notificationDate) {
            this.setNotification(new Date(notificationDate as unknown as number))
        } else {
            PushNotification.cancelLocalNotifications({
                id: vehicleId
            })
        }

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
    synchronizeState = () => {
        const {vehicleIsLoading, vehicle} = this.props;
        if (!vehicleIsLoading && vehicle) {
            this.setState({
                mileageCurrent: vehicle?.mileage?.current,
                notificationDate: vehicle?.mileage?.notificationDate,
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

        const isSame = (vehicle?.mileage?.current === this.state.mileageCurrent) &&
            (vehicle?.mileage?.notificationDate === this.state.notificationDate);
        const lastMileage = vehicleMileage.filter(({type}: any) => type === "mileage")[0];

        return <Container>
            <Content>
                <Card>
                    <CardItem header bordered>
                        <Icon name={"counter"} type={"MaterialCommunityIcons"}></Icon>
                        <Input
                            editable={false}
                        >
                            <H2>Mileage</H2>
                        </Input>
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
                    {
                        vehicleId && <CardItem bordered>

                            <Input
                                editable={false}
                            >
                                Remind me:
                            </Input>
                            {
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({showDatePicker: true});
                                    }}
                                >
                                    { this.state.notificationDate && <Input
                                        editable={false}
                                    >
                                        {
                                            moment.unix(parseInt(this.state.notificationDate as unknown as string) / 1000).format("ll")
                                        }
                                    </Input>
                                    }
                                    { !this.state.notificationDate && !this.state.showDatePicker && <Button
                                        onPress={() => {
                                            const theDate = this.props.vehicle?.mileage.notificationDate || TODAY.getTime()
                                            this.setState({showDatePicker: true, notificationDate: theDate});
                                        }}
                                    >
                                        <Text>Set reminder</Text>
                                    </Button>
                                    }
                                </TouchableOpacity>
                            }
                            { (this.state.notificationDate || (IS_IOS && this.state.showDatePicker )) &&
                                <Button
                                    danger
                                    small
                                    onPress={() => {
                                        this.setState({notificationDate: null, showDatePicker: false})
                                    }}
                                >
                                    <Text>X</Text>
                                </Button>
                            }
                        </CardItem>
                    }
                    {
                        (this.state.showDatePicker) && <DatePicker
                            display={"default"}
                            minimumDate={TODAY}
                            value={this.state?.notificationDate ? new Date(this.state.notificationDate) : TODAY}
                            onChange={({nativeEvent, type}: {
                                nativeEvent: { timestamp: number }, type: any
                            }, timestamp) => {
                                const newState = {} as any;

                                if (!IS_IOS) {
                                    if (type === "set") {
                                        newState.notificationDate = timestamp.getTime();
                                    }
                                } else {
                                    newState.notificationDate = timestamp.getTime();
                                }
                                this.setState({...newState, showDatePicker: IS_IOS})
                            }}
                        />
                    }
                    <CardItem>

                        <Button
                            large
                            onPress={this.onSave}
                            disabled={isSame}
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
                    vehicleId && lastMileage && <Input
                        editable={false}
                    >
                        <Text>
                            {moment.unix(parseInt(lastMileage.created) / 1000).format("lll")}
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