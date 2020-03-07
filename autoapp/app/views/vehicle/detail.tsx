import React from 'react';
import {connect} from "react-redux";
import PushNotification from "react-native-push-notification";
import ImagePicker from "react-native-image-picker";
import {
    ActionSheet, Body,
    Button,
    Card,
    CardItem,
    Container,
    Content,
    H2,
    Input,
    Text,
    Toast, View
} from "native-base";
import NewVehicle from "../../api/vehicles/new";
import {getAuth} from "../../store/authorization/reducer";
import {getVehicleById, getVehicleIsFetching} from "../../store/vehicles/reducer";
import {requestVehicleFetch, vehicleLoadAction} from "../../store/vehicles/actions";
import {VehicleResponse} from "../../components/api/vehicle/dto";
import UpdateVehicle, {VehiclePutResponse} from "../../api/vehicles/update";

import moment from "moment";
import {Dimensions, Image} from "react-native";
import {UpdateVehicleImageData} from "../../api/vehicles/imageData/put";

const BASE_64_IMAGE = (data: string) => `data:image/jpeg;base64,${data}`;

class VehicleForm extends React.Component<any> {
    state = {
        error: null,
        editing: false,
        loading: false,
        saving: false,
        editingMileage: false,
        year: "",
        make: "",
        model: "",
        mileageCurrent: "",
        notificationDate: null,
        imageData: null,
        imageFull: null,
        versionKey: null
    };
    mileageCurrentInput = React.createRef();
    props: any;

    constructor(props: any) {
        super(props);
    }

    onSubmit = (event?: any) => {
        const {auth, navigation, loadVehicleToStore} = this.props;
        const {year, make, model, mileageCurrent, imageData} = this.state;

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
                    mileage: {
                        current: mileageCurrent
                    },
                    imageData
                }
            }
        ).then((vehicle) => {
            if (vehicle.data) {
                const {vehicles} = vehicle.data;
                const {id: vehicleId} = vehicles;
                loadVehicleToStore(vehicles);
                navigation.replace("Vehicle/Detail", {vehicleId})
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
        const {year, make, model, mileageCurrent} = this.state;
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
                    mileage: {
                        current: mileageCurrent,
                        notificationDate: this.state.notificationDate
                    }
                }
            }
        ).then((vehicle: VehiclePutResponse) => {
            if (vehicle.data) {
                const {vehicles} = vehicle.data;
                const {id: vehicleId} = vehicles;
                loadVehicleToStore(vehicles);
                this.loadVehicle(vehicleId);
                this.setState({
                    error: null,
                    saving: false,
                    editing: false
                })
            } else {
                this.setState({
                    error: vehicle.error,
                    saving: false
                })
            }
        });
    };
    onUploadImage() {
        const {auth, navigation, loadVehicleToStore, route} = this.props;
        const {imageData, imageFull} = this.state;
        const {vehicleId} = route?.params;
        if (vehicleId) {
            this.setState({
                saving: true
            });
            UpdateVehicleImageData(
                {
                    authentication: auth.token,
                    vehicleId,
                    body: {
                        imageData: imageFull
                    }
                }
            ).then((vehicle: VehiclePutResponse) => {
                if (vehicle.data) {
                    const {vehicles} = vehicle.data;
                    const {id: vehicleId} = vehicles;
                    loadVehicleToStore(vehicles);
                    this.loadVehicle(vehicleId);
                    this.setState({
                        error: null,
                        saving: false,
                        editing: false
                    })
                } else {
                    this.setState({
                        error: vehicle.error,
                        saving: false
                    })
                }
            });
        }
    }
    setNotification(notificationDate: Date) {
        const {vehicle, auth} = this.props;
        const {year, make, model, mileageCurrent} = this.state;
        const notificationId = parseInt(`0x${vehicle.id.slice(0, 8)}`);

        PushNotification.localNotificationSchedule({
            id: notificationId as unknown as string,
            title: "Mileage alert", // (optional)
            message: `Alert for ${year} ${make} ${model}`, // (required)
            playSound: false, // (optional) default: true
            soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played),
            userInfo: {
                id: auth.id,
                vehicleId: vehicle.id
            },
            date: notificationDate
        });

        //replace with server put
        this.setState({
            notificationDate: notificationDate.getTime()
        }, this.onSave)
    }

    displayImagePicker() {
        const options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                return;
            } else if (response.error) {
                console.error('ImagePicker Error: ', response.error);
                return;
            } else {
                //

                this.setState({
                    imageFull: response.data,
                }, this.onUploadImage);
            }
        });
    }

    loadVehicle(vehicleId: string) {
        const {fetchVehicle} = this.props;
        fetchVehicle(vehicleId);
    }

    updateNavigation() {
        const {navigation} = this.props;
        const {editing, versionKey} = this.state;
        console.info("[vehicle/detail] ", versionKey);
        if (versionKey !== null) {
            navigation.setOptions({
                headerRight: () => (
                    <Button transparent onPress={() => {
                        if (!editing) {
                            this.setState({
                                editing: true
                            })
                        } else {
                            this.onSave();
                        }
                    }}>
                        <Text>
                            {!editing ? "Edit" : "Save"}
                        </Text>
                    </Button>
                ),
            });
        }
    }

    synchronizeState(vehicle: VehicleResponse) {
        console.info("[vehicle/detail] image obtained", vehicle.imageFull?.slice(0, 10));
        this.setState({
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            mileageCurrent: vehicle.mileage?.current,
            notificationDate: vehicle.mileage?.notificationDate,
            imageData: vehicle.imageData,
            imageFull: vehicle.imageFull,
            versionKey: vehicle.versionKey
        })
    }
    componentDidFocus = () => {
        const {auth, vehicle, route} = this.props;
        const {vehicleId} = route?.params;

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
    }
    componentDidMount() {
        const {navigation} = this.props;
        if (navigation) {
            navigation.addListener('focus', this.componentDidFocus);
        }
    }
    componentWillUnmount() {
        const {navigation} = this.props;
        if (navigation) {
            navigation.removeListener('focus', this.componentDidFocus)
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
        //versionKwt
        if (prevProps.vehicle === null || prevProps.vehicle === undefined) {
            if (vehicle) {
                this.synchronizeState(vehicle);
            }
        }

        if (vehicleIsFetching === false && prevProps.vehicleIsFetching === true) {
            this.updateNavigation();
        }

        if (vehicle) {
            if (this.state.versionKey !== vehicle.versionKey) {
                this.synchronizeState(vehicle);
            }

            if (this.state.imageFull !== vehicle.imageFull) {
                this.synchronizeState(vehicle)
            }
        }

        if (error !== prevError) {
            const {code} = error as any;
            Toast.show({
                text: `${code} ${(error as any)?.rootCauses?.map((rc: any) => rc?.code)}`,
                type: "danger"
            })
        }

    }
    renderImage() {
        const {imageFull} = this.state;
        const {width} = Dimensions.get("window");
        return <View>
            {imageFull !== null && <Image
                style={{width, height: width / 2, resizeMode: 'center'}}
                source={{uri: BASE_64_IMAGE(imageFull as unknown as string)} }
            /> }
            {imageFull === null && <View
                style={{width, height: width / 2, backgroundColor: '#cccccc'}}
            />}
            <Button onPress={this.displayImagePicker.bind(this)}>
                <Text>Upload</Text>
            </Button>
        </View>
    }
    renderForm() {
        const {vehicle} = this.props;
        const {editing} = this.state;
        return <Card>
            <CardItem bordered={editing}>
                <Input
                    placeholder='Make'
                    onChangeText={(text) =>
                        this.setState({make: text})
                    }

                    editable={editing}
                    defaultValue={vehicle?.make}
                />
            </CardItem>
            <CardItem bordered={editing}>
                <Input
                    placeholder='Year'
                    onChangeText={(text) =>
                        this.setState({year: text})
                    }

                    editable={editing}
                    defaultValue={vehicle?.year}
                />
            </CardItem>
            <CardItem bordered={editing}>
                <Input
                    placeholder='Model'
                    onChangeText={(text) =>
                        this.setState({model: text})
                    }

                    editable={editing}
                    defaultValue={vehicle?.model}
                />
            </CardItem>

        </Card>
    }
    renderMileage() {
        const {vehicleId} = this.props.route?.params || {};
        const {vehicle = {}} = this.props;
        const {vehicleMileage = []} = vehicle;
        const {editing, editingMileage} = this.state;

        const lastMileage = vehicleMileage[0];

        return <Card>
            <CardItem header bordered>
                <Input
                    editable={false}
                >
                    <H2>Mileage</H2>
                </Input>
                {
                    vehicleId && <Button
                        small
                        bordered
                        onPress={() => {
                            ActionSheet.show(
                                {
                                    options: [
                                        "In 1 minute",
                                        "In 5 months",
                                        "Next year",
                                        "Custom",
                                        "Cancel"
                                    ],
                                    cancelButtonIndex: 3,
                                    title: "Remind me.."
                                },
                                buttonIndex => {
                                    const min1 = new Date(Date.now() + 60 * 1000) // in 60 secs;
                                    const mon5 = new Date(Date.now() + 13140000 * 1000) // in 60 secs;
                                    const ny = new Date(Date.now() + 31798835 * 1000) // in 60 secs;
                                    let ops = [min1, mon5, ny];
                                    if (buttonIndex < 3) {
                                        this.setNotification(ops[buttonIndex])
                                    }
                                }
                            )
                        }}
                    >
                        <Text>
                            Remind me
                        </Text>
                    </Button>
                }
            </CardItem>
            {
                vehicleId && <CardItem bordered>
                    <Input
                        editable={false}
                    >
                        Next reminder:
                    </Input>
                    {
                        this.state.notificationDate &&
                        <Input
                            editable={false}
                        >
                            <Text>
                                {moment.unix(parseInt(this.state.notificationDate as unknown as string) / 1000).format("ll")}
                            </Text>
                        </Input>
                    }
                </CardItem>
            }
            <CardItem>
                <Input
                    placeholder={"#"}
                    keyboardType={"number-pad"}
                    editable={!vehicleId || editing}
                    ref={this.mileageCurrentInput}
                    defaultValue={vehicleId ? vehicle?.mileage?.current : ""}
                    onChangeText={(text) =>
                        this.setState({mileageCurrent: text})
                    }
                />
                {
                    vehicleId && lastMileage && <Input
                        editable={false}
                    >
                        <Text>
                            {moment.unix(parseInt(lastMileage.created) / 1000).format("lll")}
                        </Text>
                    </Input>
                }
                {/*{*/}
                {/*    vehicleId && false && <Button*/}
                {/*        small*/}
                {/*        bordered*/}
                {/*        onPress={() => {*/}
                {/*            this.setState({*/}
                {/*                editingMileage: !editingMileage*/}
                {/*            });*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <Text>*/}
                {/*            +*/}
                {/*        </Text>*/}
                {/*    </Button>*/}
                {/*}*/}
            </CardItem>
            <CardItem>

                {!vehicleId && <Button
                    large
                    onPress={this.onSubmit}
                >
                    <Text>Create</Text>
                </Button>}
            </CardItem>
        </Card>
    }
    render() {
        return <Container>
            <Content>
                {this.renderImage()}
                {this.renderForm()}
                {this.renderMileage()}
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
    fetchVehicle: (id: string) => dispatch(requestVehicleFetch(id)),
    loadVehicleToStore: (vehicle: any) => dispatch(vehicleLoadAction(vehicle))
});
export default connect(mapStateToProps, mapDispatchToProps)(VehicleForm);