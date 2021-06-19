let fs = require("fs");
let path = require("path");

let QrCode = require("../../../model/QrCode");
let ImageService = require("../../../service/ImageService");

module.exports = {
    url: "/api/v1/addQrCode",
    async get(req, res, next) {
        let whitelist = "81.10.241.16";
        if(whitelist.includes(req.ip)) return res.redirect("/api/v1/addQrCode")();

        res.render("addQr");
    },
    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async post(req, res, next) {
        let whitelist = "81.10.241.16";
        if(whitelist.includes(req.ip)) return res.redirect("/api/v1/addQrCode");

        let {value} = req.body;
        if(!value) return res.redirect("/api/v1/addQrCode");

        try {
            await ImageService.saveImagesFromQr(await QrCode.create({value}));
        }
        catch {
            // Do nothing lol
        }

        res.redirect("/api/v1/addQrCode");
    }
};
