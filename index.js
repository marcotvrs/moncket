import io from "socket.io-client";
import { auth, db, normalizer, storage, types } from "./src/sockets";
import { globals, watchers } from "./src/services";

const moncket = {
    initializeApp(config) {
        globals.set("config", config);
    },

    connect(_callback) {
        return new Promise(function(resolve, reject) {
            try {
                globals.set("socket", io(globals.get("config").databaseURL, { query: globals.get("config") }));
                globals.get("socket").on("reconnect", watchers.resendAllWatchers);
                moncket.onConnect(_callback);
                resolve(globals.get("socket"));
            } catch (error) {
                reject(error);
            }
        });
    },

    disconnect(_callback) {
        return new Promise(function(resolve, reject) {
            try {
                globals.get("socket").disconnect();
                moncket.onDisconnect(_callback);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },

    onConnect(_callback) {
        try {
            if (_callback instanceof Function) globals.get("socket").on("connect", () => setTimeout(_callback, 1000));
        } catch (error) {
            console.error("moncket.onConnect", "There is open connection with the server.", error.message);
        }
    },

    onDisconnect(_callback) {
        try {
            if (_callback instanceof Function) globals.get("socket").on("disconnect", _callback);
        } catch (error) {
            console.error("moncket.onDisconnect", "There is open connection with the server.", error.message);
        }
    },

    auth,
    db,
    normalizer,
    storage,
    types
};

export default moncket;
