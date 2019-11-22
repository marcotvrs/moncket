import { types } from '..';

const Formatters = (_key, _value) => {
    try {
        if (_key.search('_id') !== -1)
            return types.ObjectId(_value)
        if (_key.substr(_key.length - 2) === 'At' && _value)
            return types.Date(_value)
        return _value;
    } catch (error) {
        return _value;
    }
};

const Normalizer = (_args) => {
    try {
        Object.keys(_args).forEach((key) => {
            if (_args[key] instanceof Object)
                return Normalizer(_args[key]);
            if (_args[key])
                return _args[key] = Formatters(key, _args[key]);
        });
    } catch (error) {
        return;
    }
}

export default Normalizer;