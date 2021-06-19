let fs = require("fs");
let path = require("path");

let SequelizeLoader = require("./SequelizeLoader");
let ExpressLoader = require("./ExpressLoader");

let ImageService = require("../service/ImageService");

let QrCode = require("../model/QrCode");

class ApplicationLoader {
    constructor() {

    }

    async start() {
        await SequelizeLoader.load();
        await ExpressLoader.load();
    }

    async stop() {
        // No stop logic
    }
}

module.exports = ApplicationLoader;
