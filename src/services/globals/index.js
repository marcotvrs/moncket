let _GLOBALS = {};

export default {
    set: (_key, _value) => (_GLOBALS[_key] = _value),
    get: _key => _GLOBALS[_key]
};
