import PushNotificationIOS from "@react-native-community/push-notification-ios";

var PushNotification = require("react-native-push-notification");

export const enableNotifications = () => {
    PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function(token: any) {
            console.log("TOKEN:", token);
        },

        // (required) Called when a remote or local notification is opened or received
        onNotification: function(notification: any) {
            console.log("NOTIFICATION:", notification);

            // process the notification

            // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
            notification.finish(PushNotificationIOS.FetchResult.NoData);
        },

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
            alert: true,
            badge: true,
            sound: true
        },

        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - Specified if permissions (ios) and token (android and ios) will requested or not,
         * - if not, you must call PushNotificationsHandler.requestPermissions() later
         */
        requestPermissions: true
    });
}
