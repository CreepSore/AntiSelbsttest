let {Model, DataTypes} = require("sequelize");
let uuid = require("uuid");

class QrCode extends Model {
    static initialize(sequelize) {
        this.init({
            id: {
                type: DataTypes.STRING(36),
                defaultValue: () => uuid.v4(),
                primaryKey: true
            },
            value: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true
            },
            usedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        }, {
            sequelize
        });
    }
}

module.exports = QrCode;
