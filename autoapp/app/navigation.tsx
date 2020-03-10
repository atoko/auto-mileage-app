import React from "react";
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
                    options={{
                        headerTitle: " Vehicle List",
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="Vehicle/Form"
                    component={VehicleViews.detail}
                    options={{
                        title: ""
                    }}
                />
                <Stack.Screen
                    name="Vehicle/Detail"
                    component={VehicleViews.detail}
                    options={{
                        title: ""
                    }}
                />
            </Stack.Navigator>
        </Root>

export default Navigation