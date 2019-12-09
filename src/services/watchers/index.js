import { call, hash, globals } from "../";
import { auth } from "../../sockets";

let _WATCHERS = {};

export default {
    send: (_event, _params, _callbackSuccess, _callbackError) => {
        try {
            let _hash = hash();
            _WATCHERS[_hash] = {
                open: () => {
                    globals.get("socket").on(`${_event}/${_hash}`, response => {
                        if (response.status === 200) return _callbackSuccess(response.data);
                        if (response.status === 440) auth().executeTokenExpiresCallbacks();
                        if (typeof _callbackError === "function") return _callbackError(response.error);
                    });
                    globals.get("socket").emit(_event, {
                        ..._params,
                        hash: _hash,
                        token: localStorage.getItem("@moncket-token")
                    });
                },
                close: () => globals.get("socket").removeListener(`${_event}/${_hash}`)
            };
            _WATCHERS[_hash].open();
            return {
                removeListener: async function() {
                    await call.sockets(`${_event}/removeListener`, { hash: _hash });
                    await _WATCHERS[_hash].close();
                    delete _WATCHERS[_hash];
                }
            };
        } catch (error) {
            return error;
        }
    },

    resendAllWatchers: () => {
        try {
            setTimeout(() => {
                let keys = Object.keys(_WATCHERS);
                keys.forEach(key => {
                    _WATCHERS[key].close();
                    _WATCHERS[key].open();
                });
            }, 2000);
        } catch (error) {
            return error;
        }
    }
};
