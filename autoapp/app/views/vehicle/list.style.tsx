import {StyleSheet} from "react-native";

const ListStyleSheet = StyleSheet.create({
    listContainer: {
    },
    rowContainer: {
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        marginLeft: 0
    },
    rowText: {
        fontSize: 14,
        width: "100%"
    },
    rowDescription: {
        marginLeft: 18,
        flexGrow: 1
    }
});

export default ListStyleSheet;