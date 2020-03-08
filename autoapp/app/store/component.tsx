import React from "react";
import store from "./store";
import {InitializeVehicleStorage} from "../components/api/asyncStorage";

const withRedux = (AppComponent : any) => class AppWithRedux extends React.Component<any> {
    store: any;

    componentDidMount(): void {
        InitializeVehicleStorage();
    }

    constructor(props: any) {
        super(props);
        this.store = store()
    }
    render() {
        return <AppComponent store={this.store}/>;
    }
};
export default (App: any) => withRedux(App)