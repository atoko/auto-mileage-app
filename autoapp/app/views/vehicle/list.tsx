import React from "react";
import {connect} from "react-redux";
import {View} from "react-native";
import {Button, Content, List, ListItem, Spinner, Text} from "native-base";

import ListStyleSheet from "./list.style";
import {requestProfileFetch} from "../../store/profile/actions";
import {getAuth} from "../../store/authorization/reducer";
import {getProfileById} from "../../store/profile/reducer";


class Home extends React.PureComponent<any> {

    constructor(props: any) {
        super(props);
        const {navigation} = props;
        navigation.setOptions({
            headerRight: () => (
                <Button
                    transparent
                    onPress={() => {
                        navigation.navigate("Vehicle/Form", {vehicleId: null})
                    }}
                ><Text>+</Text>
                </Button>
            ),
        });
    }

    selectVehicle = (vehicle: any) => () => {
        let {navigation} = this.props;
        navigation.navigate("Vehicle/Detail", {vehicleId: vehicle.id, _vehicle_: vehicle})
    };

    componentDidMount() {
        const {auth, profile, fetchProfile, navigation} = this.props;

        if (navigation) {
            navigation.addListener('focus', () => {
                if (auth.ready === true && (profile === undefined || profile === null)) {
                    fetchProfile(auth.id);
                }
            })
        }
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        const {auth, profile, fetchProfile} = this.props;

        if (auth.ready === true && (profile === undefined || profile === null)) {
            fetchProfile(auth.id);
        }

    }

    renderLoggedIn() {
        const {profile} = this.props;

        if (profile === null || profile === undefined) {
            return <Spinner/>
        }

        return <View>
            <View>
                {/*<Text >customer.home.greeting</Text>*/}
            </View>
            {/*<Text>customer.home.vehicles</Text>*/}
            <List dataArray={Object.values(profile.vehicles)} renderRow={(item) => {
                let vehicle = item;
                return <ListItem key={vehicle.id} button onPress={this.selectVehicle(vehicle).bind(this)}>
                    <Text style={ListStyleSheet.rowText}>
                        {vehicle.year}
                    </Text>
                    <Text style={ListStyleSheet.rowText}>
                        {vehicle.make}
                    </Text>
                    <Text style={ListStyleSheet.rowText}>
                        {vehicle.model}
                    </Text>
                    { vehicle.mileage?.current && <Text style={ListStyleSheet.rowText}>
                        {vehicle.mileage.current}
                    </Text>}
                </ListItem>
            }}>
            </List>
        </View>
    }

    render() {
        const {auth} = this.props;
        if (auth.ready === true) {
            return this.renderLoggedIn()
        } else {
            return <Content>
                <Spinner/>
            </Content>
        }
    }

}

let mapStateToProps = (state: any) => ({
    auth: getAuth(state),
    profile: getProfileById(state, getAuth(state).id)
});
let mapDispatchToProps = (dispatch: (action: any) => {}) => ({
    fetchProfile: (id: String) => dispatch(requestProfileFetch(id)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Home);