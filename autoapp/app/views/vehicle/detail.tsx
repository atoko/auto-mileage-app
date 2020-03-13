import React from 'react';
import {connect} from "react-redux";
import PushNotification from "react-native-push-notification";
import ImagePicker from "react-native-image-picker";
import {
    ActionSheet,
    Button,
    Card,
    CardItem,
    Container,
    Content, Fab,
    H2, Icon,
    Input, Picker,
    Text,
    Toast, View
} from "native-base";
import moment from "moment";
import {Dimensions, Image, TouchableOpacity} from "react-native";

import NewVehicle from "../../api/vehicles/new";
import UpdateVehicle, {VehiclePutResponse} from "../../api/vehicles/update";
import {UpdateVehicleImageData} from "../../api/vehicles/imageData/put";
import {VehicleResponse} from "../../components/api/vehicle/dto";

import {getMakesByYear, getModelsByYearAndMake} from "../../api/cars/query";

import {getAuth} from "../../store/authorization/reducer";
import {getVehicleById, getVehicleIsFetching} from "../../store/vehicles/reducer";
import {requestVehicleFetch, vehicleLoadAction} from "../../store/vehicles/actions";

const CAR_YEARS = [...Array(25).keys()].map(y => (2020 - y).toString());
const BASE_64_IMAGE = (data: string) => `data:image/jpeg;base64,${data}`;

class VehicleForm extends React.Component<any> {
    state = {
        error: null,
        editing: false,
        loading: false,
        saving: false,
        actionOpen: false,
        year: "",
        make: "",
        model: "",
        mileageCurrent: "",
        oiledDate: null,
        notificationData: null,
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
        const {year, make, model, mileageCurrent, imageFull} = this.state;

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
                    imageData: imageFull
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
    showNotificationDialog() {
        ActionSheet.show(
            {
                options: [
                    "In 3 months",
                    "In 6 months",
                    "Next year",
                    "Custom",
                    "Cancel"
                ],
                cancelButtonIndex: 4,
                title: "Remind me.."
            },
            buttonIndex => {
                const min1 = new Date(Date.now() + 60 * 1000) // in 60 secs;
                const mon5 = new Date(Date.now() + 13140000 * 1000) // in 60 secs;
                const ny = new Date(Date.now() + 31798835 * 1000) // in 60 secs;
                let ops = [min1, mon5, ny];
                if (buttonIndex < 3) {
                    this.setNotification(ops[buttonIndex])
                } else if(buttonIndex === 4) {

                } else {}
            }
        )
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
        const {navigation, route} = this.props;
        const {editing, versionKey} = this.state;
        const {vehicleId} = route?.params;

            navigation.setOptions({
                headerRight: () => (
                    <Button
                        transparent
                        style={{
                            marginRight: 8
                        }}
                        onPress={() => {
                            if (vehicleId) {
                                if (!editing) {
                                    this.setState({
                                        editing: true
                                    })
                                } else {
                                    this.onSave();
                                }
                            } else {
                                this.onSubmit();
                            }
                    }}>
                        <Text>
                            {vehicleId ?
                                !editing ? "Edit"
                                    : "Save"
                                : "Create"
                            }
                        </Text>
                    </Button>
                ),
            });
    }

    synchronizeState(vehicle: VehicleResponse) {
        console.info("[vehicle/detail] image obtained", vehicle.imageFull?.slice(0, 10));
        console.info("[vehicle/detail] mileage obtained", vehicle.mileage?.current);
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

        getMakesByYear(vehicle.year).then(async (makes) => {
            this.setState({ makes });
            const models = await getModelsByYearAndMake(this.state.year, vehicle.make);
            this.setState({ models });
        }).catch(() => {})
    }
    componentDidFocus = () => {
        const {auth, vehicle, route} = this.props;
        const {vehicleId} = route?.params;

        if (auth.ready === true) {
            if (vehicleId) {
                this.loadVehicle(vehicleId);
            } else {
                const year = CAR_YEARS[Math.floor(Math.random() * CAR_YEARS.length)];
                this.setState({
                    editing: true,
                    year
                });

                getMakesByYear(year).then(async (makes) => {
                    const make = makes[Math.floor(Math.random() * makes.length)];
                    this.setState({ makes, make });

                    const models = await getModelsByYearAndMake(year, make);
                    const model = models[Math.floor(Math.random() * models.length)];
                    this.setState({ models, model});
                }).catch(() => {})
            }
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
                if (vehicle.imageFull) {
                    this.synchronizeState(vehicle)
                }
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
        const haveImage = imageFull !== null && imageFull !== undefined;

        return <Card style={{
            padding: 8
        }}>
            <TouchableOpacity onPress={this.displayImagePicker.bind(this)}>
                {haveImage && <Image
                    style={{width: width - 20, height: width / 2, resizeMode: 'cover'}}
                    source={{uri: BASE_64_IMAGE(imageFull as unknown as string)} }
                /> }
                {!haveImage && <View
                    style={{width: width - 20, height: width / 2, backgroundColor: '#bababa'}}
                />}
            </TouchableOpacity>
        </Card>
    }
    renderForm() {
        const {vehicle} = this.props;
        const {editing} = this.state;
        return <Card>
            <CardItem>
                <Picker
                    placeholder='Year'
                    onValueChange={(year) => {
                        this.setState({year}, () => {
                            getMakesByYear(year).then((makes) => {
                                let {make} = this.state;
                                if (makes.indexOf(make) === -1) {
                                    make = makes[0];
                                }
                                this.setState({ makes, make });
                            })
                        })
                    }}
                    enabled={editing}
                    selectedValue={this.state.year}
                    mode={"dropdown"}
                >
                    {CAR_YEARS.map((y) => {
                        return <Picker.Item key={y} label={y} value={y}/>
                    })}
                </Picker>
                <Picker
                    placeholder='Make'
                    onValueChange={(make) => {
                        this.setState({make}, () => {
                            getModelsByYearAndMake(this.state.year, make).then((models) => {
                                this.setState({ models, model: models[0] });
                            })
                        })
                    }}
                    enabled={editing}
                    selectedValue={this.state.make}
                >
                    { this.state.makes?.map((make) => {
                        return <Picker.Item key={make} label={make} value={make} />
                    })}
                </Picker>
            </CardItem>
            <CardItem>
                <Picker
                    placeholder='Model'
                    onValueChange={(model) => {
                        this.setState({model}, () => {

                        })
                    }}
                    enabled={editing}
                    selectedValue={this.state.model}
                >
                    { this.state.models?.map((model) => {
                        return <Picker.Item key={model} label={model} value={model} />
                    })}
                </Picker>

            </CardItem>
        </Card>
    }
    renderDatePicker() {

    };
    renderMileage() {
        const {vehicleId} = this.props.route?.params || {};
        const {vehicle = {}} = this.props;
        const {vehicleMileage = []} = vehicle;
        const {editing} = this.state;

        const lastMileage = vehicleMileage[0];

        return <Card><CardItem header bordered>
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
                editable={!vehicleId || editing}
                defaultValue={vehicleId ? vehicle?.mileage?.current : ""}
                onChangeText={(text) =>
                    this.setState({mileageCurrent: text})
                }
            />
        </CardItem>
            <CardItem>
                <Input>
                    <Text>
                        Next reminder:
                    </Text>
                </Input>
            </CardItem>
        </Card>
    }
    renderOil() {
        const {vehicleId} = this.props.route?.params || {};
        const {vehicle = {}} = this.props;
        const {vehicleMileage = []} = vehicle;
        const {editing} = this.state;

        const lastMileage = vehicleMileage[0];

        return  <CardItem header bordered>
            <Icon name={"oil"} type={"MaterialCommunityIcons"}></Icon>
            <Input
                editable={false}
            >
                <H2>Oil change</H2>
            </Input>
            <View>
            </View>
            <Input
                placeholder={"#"}
                keyboardType={"number-pad"}
                editable={!vehicleId || editing}
                defaultValue={vehicleId ? vehicle?.mileage?.current : ""}
                onChangeText={(text) =>
                    this.setState({mileageCurrent: text})
                }
            />
        </CardItem>
    }
    renderLog() {
        return null;
    }
    renderActionButton() {
        const {navigation, vehicle} = this.props;
        return <Fab
            direction="up"
            style={{backgroundColor: '#5067FF'}}
            active={this.state.actionOpen}
            position="bottomRight"
            onPress={() => {this.setState({
                actionOpen: !this.state.actionOpen
            })}}
        >
                <Icon name={"notebook-multiple"} type={"MaterialCommunityIcons"}></Icon>
                <Button style={{ backgroundColor: '#34A34F' }}
                    onPress={() => {
                        navigation.navigate("Vehicle/Oil/Form", {vehicleId: vehicle?.id})
                    }}
                >
                    <Icon name={"oil"} type={"MaterialCommunityIcons"} />
                </Button>
                <Button style={{ backgroundColor: '#34A34F' }}
                    onPress={() => {
                        navigation.navigate("Vehicle/Mileage/Form", {vehicleId: vehicle?.id})
                    }}
                >
                    <Icon name={"counter"} type={"MaterialCommunityIcons"} />
                </Button>
        </Fab>
    }
    render() {
        return <Container>
            <Content>
                {this.renderForm()}
                {this.renderImage()}
                <Card>
                    {this.renderMileage()}
                    {this.renderOil()}
                </Card>
                {this.renderLog()}
            </Content>
            {this.renderActionButton()}
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