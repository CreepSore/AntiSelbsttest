let path = require("path");

let {Sequelize} = require("sequelize")

let QrCode = require("../model/QrCode");

module.exports = {
    /**
     * @returns {Promise<Sequelize>}
     */
    async load() { 
        let sequelize = new Sequelize({
            dialect: "sqlite",
            storage: path.resolve(__dirname, "..", "..", "store.db"),
            logging: false
        });

        QrCode.initialize(sequelize);

        await sequelize.sync();

        return sequelize;
    }
};
