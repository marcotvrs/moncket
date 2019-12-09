import { globals } from "../";
import { auth } from "../../sockets";

const responseHandler = (resolve, reject, response) => {
    if (response.status === 200) return resolve(response.data);
    if (response.status === 440) auth().executeTokenExpiresCallbacks();
    return reject(response.error);
};

export default {
    sockets: (_event, _params) => {
        return new Promise((resolve, reject) => {
            if (!globals.get("socket")) return reject("There is open connection with the server.");
            globals.get("socket").emit(
                _event,
                {
                    token: localStorage.getItem("@moncket-token"),
                    ..._params
                },
                response => responseHandler(resolve, reject, response)
            );
        });
    },
    http: (_event, _params) => {
        return new Promise((resolve, reject) => {
            fetch(`${globals.get("config").databaseURL}${_event}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    projectId: globals.get("config").projectId,
                    token: localStorage.getItem("@moncket-token")
                },
                body: JSON.stringify(_params)
            })
                .then(e => {
                    try {
                        return e.json();
                    } catch (error) {
                        return reject(error);
                    }
                })
                .then(response => responseHandler(resolve, reject, response));
        });
    }
};
