import React from "react";
import {connect} from "react-redux";
import {Image, View} from "react-native";
import {Button, Card, Content, List, ListItem, Spinner, Text} from "native-base";

import ListStyleSheet from "./list.style";
import {requestProfileFetch} from "../../store/profile/actions";
import {getAuth} from "../../store/authorization/reducer";
import {getProfileById} from "../../store/profile/reducer";

const BASE_64_IMAGE = (data: string) => `data:image/jpeg;base64,${data}`;

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
            <List style={ListStyleSheet.listContainer} dataArray={Object.values(profile.vehicles)} renderRow={(item) => {
                let vehicle = item;
                const width = 64;
                const {imageThumbnail} = vehicle;
                const imageExists = imageThumbnail !== null && imageThumbnail !== undefined;
                return <ListItem style={ListStyleSheet.rowContainer} key={vehicle.id} onPress={this.selectVehicle(vehicle).bind(this)}>
                    <View style={{flex: 1, flexDirection: "row"}}>
                        <View>
                            {imageExists && <Image
                                style={{width, height: width, resizeMode: 'center'}}
                                source={ {uri: BASE_64_IMAGE(imageThumbnail as unknown as string)} }
                            /> }
                            {!imageExists && <View
                                style={{width, height: width, backgroundColor: '#888888'}}
                            />}
                        </View>
                        <View style={ListStyleSheet.rowDescription}>
                            <View style={{ flex: 1, alignItems: "stretch"}}>
                                <Text style={{ ...ListStyleSheet.rowText, fontSize: 20}}>
                                    {vehicle.make}
                                </Text>
                                <Text style={ListStyleSheet.rowText}>
                                    {vehicle.model}
                                </Text>
                                <Text style={{ ...ListStyleSheet.rowText, fontSize: 10}}>
                                    {vehicle.year}
                                </Text>
                            </View>
                        </View>
                    </View>
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