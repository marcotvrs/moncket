const io = require('socket.io-client');

const hash = function () {
    const generator = function () {
        Math.random().toString().substring(2, 15);
    };
    return `${new Date().getTime()}.${generator()}.${generator()}.${generator()}`;
};

const emit = function (_event, _hash, _params) {
    return new Promise(function (resolve, reject) {
        let timeout = setTimeout(function () {
            reject({ error: 'Websocket Timeout Error' });
        }, Moncket.config.defaultTimeout || 12000);
        Moncket.socket.on(`${_event}_${_hash}`, function (data) {
            clearTimeout(timeout);
            Moncket.socket.removeListener(`${_event}_${_hash}`);
            if (!data || data.error)
                return reject(data);
            resolve(data);
        });
        Moncket.socket.emit(_event, Object.assign({ hash: _hash, token: localStorage.getItem('@moncket-token') }, _params));
    });
};

const readAsDataURL = function (_file) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader();
        reader.onloadend = function (e) {
            resolve({
                name: _file.name,
                ext: /[^.]+$/.exec(_file.name),
                type: _file.type,
                dataUrl: e.target.result
            });
        };
        reader.readAsDataURL(_file);
        reader.onerror = reject;
    });
};

const Moncket = {
    socket: {},
    config: {},
    
    initializeApp(_config) {
        return new Promise(function (resolve, reject) {
            try {
                Moncket.config = _config;
                Moncket.socket = io(Moncket.config.databaseURL, {
                    query: Moncket.config
                });
                setTimeout(function () {
                    resolve(Moncket.socket);
                }, 1000);
            } catch (error) {
                reject(error);
            }
        });
    },

    onConnect(_callback) {
        Moncket.socket.on('connect', _callback);
    },

    onDisconnect(_callback) {
        Moncket.socket.on('disconnect', _callback);
    },

    auth() {
        return {
            currentUser: function () {
                try {
                    let currentUser = JSON.parse(localStorage.getItem('@moncket-currentUser'));
                    if (currentUser)
                        return currentUser;
                    return {};
                } catch (error) {
                    return {};
                }
            },
            signInWithEmailAndPassword: function (email, password) {
                return new Promise(async function (resolve, reject) {
                    try {
                        let data = await emit('signInWithEmailAndPassword', hash(), { email, password });
                        localStorage.setItem('@moncket-token', data.token);
                        localStorage.setItem('@moncket-currentUser', JSON.stringify(data.user));
                        resolve(data.user);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            signOut: function () {
                return new Promise(function (resolve, reject) {
                    try {
                        localStorage.removeItem('@moncket-token');
                        localStorage.removeItem('@moncket-currentUser');
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        }
    },

    storage(_path) {
        return {
            upload: async function (_params) {
                let file = await readAsDataURL(_params.file);
                return await emit('storageAsDataUrl', hash(), {
                    path: _path,
                    dataUrl: file.dataUrl,
                    filename: _params.filename ? `${_params.filename}.${file.ext}` : file.name,
                    ContentType: file.type
                });
            },
            list: async function () {
                return await emit('storageListObjects', hash(), { path: _path });
            },
            delete: async function () {
                return await emit('storageDeleteObjects', hash(), { path: _path });
            }
        };
    },

    database() {
        return {
            collection: function (_collection) {
                let _PARAMS = {
                    collection: _collection,
                    arguments: [],
                    limit: null,
                    sort: null
                };

                return {
                    watch: function (_params, _callback) {
                        let _hash = hash();
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        Moncket.socket.on(`watch_${_hash}`, _callback);
                        Moncket.socket.emit('watch', Object.assign({ hash: _hash, token: localStorage.getItem('@moncket-token') }, params));
                        return {
                            removeListener: function () {
                                Moncket.socket.removeListener(`watch_${_hash}`);
                            }
                        };
                    },

                    aggregate: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return {
                            get: function () {
                                return emit('aggregate', hash(), params);
                            },
                            first: async function () {
                                try {
                                    let e = await emit('aggregate', hash(), params);
                                    if (e.length)
                                        return e[0];
                                    return [];
                                } catch (error) {
                                    return error;
                                }
                            },
                            facet: async function (_options) {
                                try {
                                    let docs = [];
                                    if (_options)
                                        Object.keys(_options).forEach(function (key) {
                                            let push = {};
                                            push[key] = _options[key];
                                            docs.push(push);
                                        });
                                    if (!params.arguments.length)
                                        throw new Error('Aggregations must have parameters.');
                                    params.arguments[0].push({ $facet: { docs, size: [{ $group: { _id: null, count: { $sum: 1 } } }] } });
                                    let e = await emit('aggregate', hash(), params);
                                    if (!e.length)
                                        throw new Error('Nothing has been returned from aggregation.');
                                    return {
                                        docs: e[0].docs,
                                        size: e[0].size.length && e[0].size[0].count ? e[0].size[0].count : 0
                                    }
                                } catch (error) {
                                    return error;
                                }
                            }
                        };
                    },

                    find: function () {
                        _PARAMS.arguments = Object.values(arguments);

                        this.skip = function (_skip) {
                            _PARAMS.skip = _skip;
                            return this;
                        };

                        this.limit = function (_limit) {
                            _PARAMS.limit = _limit;
                            return this;
                        };

                        this.sort = function (_sort) {
                            _PARAMS.sort = _sort;
                            return this;
                        };

                        this.get = function () {
                            return emit('find', hash(), Object.assign({}, _PARAMS));
                        };

                        return this;
                    },

                    findOne: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('findOne', hash(), params);
                    },

                    insertOne: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('insertOne', hash(), params);
                    },

                    insertMany: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('insertMany', hash(), params);
                    },

                    updateOne: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('updateOne', hash(), params);
                    },

                    updateMany: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('updateMany', hash(), params);
                    },

                    deleteOne: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('deleteOne', hash(), params);
                    },

                    deleteMany: function () {
                        let params = Object.assign(_PARAMS, { arguments: Object.values(arguments) });
                        return emit('deleteMany', hash(), params);
                    }
                }
            }
        }
    }

};

module.exports = Moncket;