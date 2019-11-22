export default (_file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = (e) => {
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