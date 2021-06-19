let path = require("path");

let express = require("express");

let apiV1 = require("../web/api/v1/init");

let ImageService = require("../service/ImageService");
let QrCode = require("../model/QrCode");

const setupApiRoutes = function(app) {
    apiV1.initV1(app);
};

/**
 * @param {import("express").Application} app
 */
const setupViewRoutes = function(app) {
    app.get("/", async(req, res) => {
        let qrCode = await QrCode.findOne({where: {usedAt: null}});
        if(!qrCode) {
            res.write("Keine QRCodes mehr verfuegbar!");
            res.end();
            return;
        }

        res.redirect(`/${qrCode.get("id")}`);
    });

    app.get("/:id", async(req, res) => {
        let qrCode = await QrCode.findOne({where: {id: req.params.id}});

        if(!qrCode) return res.redirect("/");

        res.render("index", {
            id: req.params.id
        });
    });

    app.post("/:id", async(req, res) => {
        let qrCode = await QrCode.findOne({where: {id: req.params.id}});
        if(qrCode) {
            qrCode.set("usedAt", new Date());
            await qrCode.save();
        }

        res.redirect("/");
    });
};

module.exports = {
    async load() {
        let app = express();

        app.use(express.static(path.resolve(__dirname, "..", "web", "static")));
        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(express.raw());
        app.set("views", path.resolve(__dirname, "..", "web", "view"));
        app.set("view engine", "ejs");

        setupApiRoutes(app);
        setupViewRoutes(app);

        app.listen(8092);
        return app;
    }
};
