import React from 'react';
import {Button, Text, TextInput, View} from "react-native";
import PushNotification from "react-native-push-notification";
import NewVehicle from "../../api/vehicles/new";
import {getAuth} from "../../store/authorization/reducer";
import {connect} from "react-redux";
import {getVehicleById, getVehicleIsFetching} from "../../store/vehicles/reducer";
import {requestVehicleFetch, vehicleLoadAction} from "../../store/vehicles/actions";
import {Container, Content, Input, Item, Toast} from "native-base";
import {VehicleData, VehicleResponse} from "../../components/api/vehicle/dto";
import UpdateVehicle from "../../api/vehicles/update";

class VehicleForm extends React.Component<any> {
    state = {
        error: null,
        editing: false,
        loading: false,
        saving: false,
        year: "",
        make: "",
        name: "",
        model: "",
        versionKey: null
    };
    props: any;

    constructor(props: any) {
        super(props);
    }
    onSubmit = (event: any) => {
        const {auth, navigation, loadVehicleToStore} = this.props;
        const {year, make, model, name} = this.state;

        this.setState({
            saving: true
        });
        NewVehicle(
            {
                authentication: auth.token,
                body: {
                    year,
                    make,
                    model,
                    name
                }
            }
        ).then((vehicle) => {
            if (vehicle.data) {
                const {vehicles} = vehicle.data;
                const {id: vehicleId} = vehicles;
                loadVehicleToStore(vehicles);
                navigation.replace("Vehicle/Detail", { vehicleId })
            } else {
                this.setState({
                    error: vehicle.error,
                    saving: false
                })
            }
        });
    };
    onSave = (event?: any) => {
        const {auth, navigation, loadVehicleToStore, route} = this.props;
        const {year, make, model, name} = this.state;
        const {vehicleId} = route?.params;

        this.setState({
            saving: true
        });
        UpdateVehicle(
            {
                authentication: auth.token,
                vehicleId,
                body: {
                    year,
                    make,
                    model,
                    name
                }
            }
        ).then((vehicle) => {
            if (vehicle.data) {
                const {vehicles} = vehicle.data;
                const {id: vehicleId} = vehicles;
                loadVehicleToStore(vehicles);
                navigation.replace("Vehicle/Detail", { vehicleId })
            } else {
                this.setState({
                    error: vehicle.error,
                    saving: false
                })
            }
        });
    };
    loadVehicle(vehicleId: string) {
        const {fetchVehicle} = this.props;
        fetchVehicle(vehicleId);
    }
    updateNavigation() {
        const {navigation} = this.props;
        const {editing, versionKey} = this.state;
        if (versionKey !== null) {
            navigation.setOptions({
                headerRight: () => (
                    <Button onPress={() => {
                        if (!editing) {
                            this.setState({
                                editing: true
                            })
                        } else {
                            this.onSave();
                        }
                    }} title={!editing ? "Edit" : "Save"} />
                ),
            });
        }
    }
    synchronizeState(vehicle: VehicleResponse) {
        this.setState((...state) => {
            return {
                year: vehicle.year,
                make: vehicle.make,
                name: vehicle.name,
                model: vehicle.model,
                versionKey: vehicle.versionKey
            }
        })
    }
    componentDidMount() {
        const {auth, vehicle, fetchVehicle, navigation, route} = this.props;
        const {vehicleId} = route?.params;

        if (navigation) {
            navigation.addListener('focus', () => {
                if (auth.ready === true) {
                    if (vehicleId) {
                        this.loadVehicle(vehicleId);
                    } else {
                        this.setState({
                            editing: true
                        });
                    }
                }

                if (vehicle) {
                    this.synchronizeState(vehicle);
                }
            })
        }
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        const {error: prevError} = prevState;
        const {error} = this.state;
        const {auth, vehicle, fetchVehicle, vehicleIsFetching} = this.props;
        const {vehicleId} = this.props.route?.params;

        if (prevState.editing !== this.state.editing) {
            this.updateNavigation()
        }

        if (vehicleIsFetching === false) {
            this.updateNavigation();
        }

        //versionKwt
        if (prevProps.vehicle === null || prevProps.vehicle === undefined) {
            if (vehicle) {
                this.synchronizeState(vehicle);
            }
        }

        if (error !== prevError) {
            const {code} = error as any;
            Toast.show({
                text: `${code} ${(error as any)?.rootCauses.map((rc: any) => rc.code)}`,
                type: "danger"
            })
        }

    }

    render() {
        const {vehicle, auth} = this.props;
        return <Container>
            <Content>
                <Item stackedLabel>
                    <Input placeholder='Name'
                       onChangeText={ (text) =>
                         this.setState({name: text})
                    }
                        defaultValue={vehicle?.name}
                    />
                </Item>
                <Item stackedLabel>
                    <Input placeholder='Make' onChangeText={ (text) =>
                        this.setState({make: text})
                    }

                       defaultValue={vehicle?.make}
                    />
                </Item>
                <Item stackedLabel>
                    <Input placeholder='Year' onChangeText={ (text) =>
                        this.setState({year: text})
                    }

                       defaultValue={vehicle?.year}
                    />
                </Item>
                <Item stackedLabel>
                    <Input placeholder='Model' onChangeText={ (text) =>
                        this.setState({model: text})
                    }

                       defaultValue={vehicle?.model}
                    />
                </Item>
                { this.state.versionKey === null && <Button
                    title={vehicle?.id ? "Save" : "Create"}
                    onPress={this.onSubmit}
                >
                    <Text>vehicle.form.submit</Text>
                </Button> }

                <Button title={"Notification"} onPress={() => {
                    PushNotification.localNotificationSchedule({
                        id: vehicle ? `vehicle/{vehicle.id}` : "vehicle/new",
                        /* iOS and Android properties */
                        title: "My Notification Title", // (optional)
                        message: "My Notification Message", // (required)
                        playSound: false, // (optional) default: true
                        soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played),
                        userInfo: {
                            id: auth.id,
                        },
                        date: new Date(Date.now() + 8 * 1000) // in 60 secs
                    });
                }} />
            </Content>
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
    fetchVehicle: (id: String) => dispatch(requestVehicleFetch(id)),
    loadVehicleToStore: (vehicle: any) => dispatch(vehicleLoadAction(vehicle))
});
export default connect(mapStateToProps, mapDispatchToProps)(VehicleForm);