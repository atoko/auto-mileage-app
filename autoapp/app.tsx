import React from 'react';
import {Provider} from 'react-redux';
import {
    StatusBar
} from 'react-native';
import CreateStore from "./app/store/component";
import Navigation from "./app/navigation";
import { enableScreens } from 'react-native-screens';
import {NavigationContainer} from "@react-navigation/native";

interface WithStore {
    store: any
}

enableScreens();

const App: (props: WithStore) => React.ReactNode = ({store}) => {
    return (
        <NavigationContainer>
            <Provider store={store}>
                <StatusBar />
                <Navigation/>
            </Provider>
        </NavigationContainer>
    );
};


export default CreateStore(App);
