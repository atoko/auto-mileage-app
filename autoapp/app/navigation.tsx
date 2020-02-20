import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import {Root} from "native-base";
import * as VehicleViews from "./views/vehicle";
const Stack = createNativeStackNavigator();
export const Navigation = () =>
        <Root>
            <Stack.Navigator>
                <Stack.Screen
                    name="Vehicle/List"
                    component={VehicleViews.list}
                />
                <Stack.Screen
                    name="Vehicle/Form"
                    component={VehicleViews.detail}
                />
                <Stack.Screen
                    name="Vehicle/Detail"
                    component={VehicleViews.detail}
                />
            </Stack.Navigator>
        </Root>

export default Navigation