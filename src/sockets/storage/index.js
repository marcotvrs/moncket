import { call, readAsDataURL } from "../../services";

export default _path => {
    return {
        upload: async function(_params) {
            let file = await readAsDataURL(_params.file);
            return await call.http("/moncket/storage/storageAsDataUrl", {
                path: _path,
                dataUrl: file.dataUrl,
                filename: _params.filename ? `${_params.filename}.${file.ext}` : file.name,
                ContentType: file.type
            });
        },
        list: async function() {
            return await call.http("/moncket/storage/storageListObjects", { path: _path });
        },
        delete: async function() {
            return await call.http("/moncket/storage/storageDeleteObjects", { path: _path });
        }
    };
};
