import { call } from "../../services";

let _CALLBACKS = {};

const auth = () => {
    return {
        onTokenExpires: _callback => {
            _CALLBACKS[new Date().getTime()] = _callback;
        },
        executeTokenExpiresCallbacks: () => {
            try {
                let keys = Object.keys(_CALLBACKS);
                for (let i = 0; i < keys.length; i++) _CALLBACKS[keys[i]]();
            } catch (error) {
                return error;
            }
        },
        currentUser: () => {
            try {
                let currentUser = JSON.parse(localStorage.getItem("@moncket-currentUser"));
                if (currentUser) return currentUser;
                return {};
            } catch (error) {
                return {};
            }
        },
        signIn: (email, password, expiresIn) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let data = await call.http("/moncket/auth/signIn", {
                        email,
                        password,
                        expiresIn
                    });
                    localStorage.setItem("@moncket-token", data.token);
                    localStorage.setItem("@moncket-currentUser", JSON.stringify(data.user));
                    resolve(data.user);
                } catch (error) {
                    reject(error);
                }
            });
        },
        signOut: () => {
            return new Promise((resolve, reject) => {
                try {
                    localStorage.removeItem("@moncket-token");
                    localStorage.removeItem("@moncket-currentUser");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        sendPasswordResetEmail: email => {
            return call.http("/moncket/auth/sendPasswordResetEmail", { email });
        },
        resetPassword: (verificationCode, email, password) => {
            return call.http("/moncket/auth/resetPassword", {
                verificationCode,
                email,
                password
            });
        }
    };
};

export default auth;
