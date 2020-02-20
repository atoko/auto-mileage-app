export default (getStorage) => {
    let inMemoryStorage= {};

    function isSupported() {
        // try {
        //     const testKey = "__some_random_key_you_are_not_going_to_use__";
        //     getStorage().setItem(testKey, testKey);
        //     getStorage().removeItem(testKey);
        //     return true;
        // } catch (e) {
        //     return false;
        // }
    }

    function clear() {
        // if (isSupported()) {
        //     getStorage().clear();
        // } else {
        //     inMemoryStorage = {};
        // }
    }

    function getItem(name) {
        // if (isSupported()) {
        //     return getStorage().getItem(name);
        // }
        // if (inMemoryStorage.hasOwnProperty(name)) {
        //     return inMemoryStorage[name];
        // }
        // return null;
    }

    function key(index) {
        // if (isSupported()) {
        //     return getStorage().key(index);
        // } else {
        //     return Object.keys(inMemoryStorage)[index] || null;
        // }
    }

    function removeItem(name) {
        // if (isSupported()) {
        //     getStorage().removeItem(name);
        // } else {
        //     delete inMemoryStorage[name];
        // }
    }

    function setItem(name, value) {
        // if (isSupported()) {
        //     getStorage().setItem(name, value);
        // } else {
        //     inMemoryStorage[name] = String(value);
        // }
    }

    function length() {
        // if (isSupported()) {
        //     return getStorage().length;
        // } else {
        //     return Object.keys(inMemoryStorage).length;
        // }
    }

    return {
        getItem,
        setItem,
        removeItem,
        clear,
        key,
        get length() {
            return length();
        },
    };
}