import React from 'react';
import {Button, Text, TextInput, View} from "react-native";
import NewVehicle from "../../api/vehicles/new";
import {getAuth} from "../../store/authorization/reducer";
import {connect} from "react-redux";
import {getVehicleById} from "../../store/vehicles/reducer";
import {requestVehicleFetch, vehicleLoadAction} from "../../store/vehicles/actions";
import {Container, Content, Input, Item} from "native-base";

class VehicleForm extends React.Component<any> {
    state = {
        error: null,
        year: "",
        make: "",
        name: "",
        model: ""
    };
    props: any;

    componentDidMount() {
        const {auth, vehicle, fetchVehicle, navigation} = this.props;
        const {vehicleId} = this.props.route?.params;

        if (navigation) {
            navigation.addListener('focus', () => {
                if (vehicleId) {
                    if (vehicle === undefined || vehicle === null) {
                        if (auth.ready === true) {
                            fetchVehicle(vehicleId);
                        }
                    } else {
                        const {
                            year,
                            make,
                            name,
                            model
                        } = vehicle;
                        this.setState({
                            year,
                            make,
                            name,
                            model
                        });
                    }
                } else {

                }
            })
        }
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        const {auth, vehicle, fetchVehicle} = this.props;
        const {vehicleId} = this.props.route?.params;

        if (vehicleId) {
            if (vehicle === undefined || vehicle === null) {
                if (auth.ready === true) {
                    fetchVehicle(vehicleId);
                }
            } else {
                const {
                    year,
                    make,
                    name,
                    model
                } = vehicle;
                this.setState({
                    year,
                    make,
                    name,
                    model
                });
            }
        } else {

        }
    }
    onSubmit = (event: any) => {
        const {auth, navigation, loadVehicleToStore, vehicleId} = this.props;
        const {year, make, model, name} = this.state;

        if (vehicleId) {

        } else {
            NewVehicle(
                {
                    authentication: auth.token,
                    body: {
                        profileId: auth.id,
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
                        error: vehicle.error
                    })
                }
            });
        }
    };
    render() {
        return <Container>
            <Content>
                <Text>
                    {JSON.stringify(this.state.error)}
                </Text>
                <Item stackedLabel>
                    <Input placeholder='Name' onChangeText={ (text) =>
                        this.setState({name: text})
                    } />
                </Item>
                <Item stackedLabel>
                    <Input placeholder='Make' onChangeText={ (text) =>
                        this.setState({make: text})
                    }/>
                </Item>
                <Item stackedLabel>
                    <Input placeholder='Year' onChangeText={ (text) =>
                        this.setState({year: text})
                    }/>
                </Item>
                <Item stackedLabel>
                    <Input placeholder='Model' onChangeText={ (text) =>
                        this.setState({model: text})
                    }/>
                </Item>
                <Button
                    title={"Create"}
                    onPress={this.onSubmit}
                >
                    <Text>vehicle.form.submit</Text>
                </Button>
            </Content>
        </Container>
    }
}


const mapStateToProps = (state: any, props: any) => {
    const {vehicleId} = props.route?.params;

    return {
        auth: getAuth(state),
        vehicle: getVehicleById(state, vehicleId),
        vehicleId
    }
};
const mapDispatchToProps = (dispatch: (action: any) => {}) => ({
    fetchVehicle: (id: String) => dispatch(requestVehicleFetch(id)),
    loadVehicleToStore: (vehicle: any) => dispatch(vehicleLoadAction(vehicle))
});
export default connect(mapStateToProps, mapDispatchToProps)(VehicleForm);