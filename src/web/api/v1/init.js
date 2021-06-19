let addQrCode = require("./addQrCode");

module.exports = {
    /**
     * @param {import("express").Application} app 
     */
    initV1(app) {
        app.get(addQrCode.url, addQrCode.get);
        app.post(addQrCode.url, addQrCode.post);
    }
};