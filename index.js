import io from 'socket.io-client';
import {
    auth,
    db,
    normalizer,
    storage,
    types
} from './src/sockets';
import {
    globals,
    watchers
} from './src/services';

export default {
    initializeApp(query) {
        return new Promise(function (resolve, reject) {
            try {
                globals.set('config', query);
                globals.set('socket', io(query.databaseURL, { query }));;
                globals.get('socket').on('reconnect', watchers.resendAllWatchers);
                resolve(globals.get('socket'));
            } catch (error) {
                reject(error);
            }
        });
    },

    socket() {
        return globals.get('socket');
    },

    onConnect(_callback) {
        globals.get('socket').on('connect', () => setTimeout(_callback, 1000));
    },

    onDisconnect(_callback) {
        globals.get('socket').on('disconnect', _callback);
    },

    auth,
    db,
    normalizer,
    storage,
    types

};