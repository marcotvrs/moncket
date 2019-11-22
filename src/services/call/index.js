import { globals } from '../';
import { auth } from '../../sockets';

export default (_event, _params) => {
    return new Promise((resolve, reject) => {
        globals.get('socket').emit(_event, {
            token: localStorage.getItem('@moncket-token'),
            ..._params
        }, (response) => {
            if (response.status === 200)
                return resolve(response.data);
            if (response.status === 440)
                auth().executeTokenExpiresCallbacks();
            return reject(response.error);
        });
    });
};