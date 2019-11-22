import { call, hash, readAsDataURL } from '../../services';

export default (_path) => {
    return {
        upload: async function (_params) {
            let file = await readAsDataURL(_params.file);
            return await call('moncket/storage/storageAsDataUrl', hash(), {
                path: _path,
                dataUrl: file.dataUrl,
                filename: _params.filename ? `${_params.filename}.${file.ext}` : file.name,
                ContentType: file.type
            });
        },
        list: async function () {
            return await call('moncket/storage/storageListObjects', hash(), { path: _path });
        },
        delete: async function () {
            return await call('moncket/storage/storageDeleteObjects', hash(), { path: _path });
        }
    };
};