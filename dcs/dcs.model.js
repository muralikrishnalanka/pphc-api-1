const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const Dcs = sequelize.define('dcs', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        phonenumber: { type: DataTypes.INTEGER, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        PinCode: { type: DataTypes.INTEGER, allowNull: false }
    }, {
        timestamps: false,
        defaultScope: {
            // remove 'passwordHash' column if it's not defined in the model
            attributes: { exclude: ['passwordHash'] },
        },
        scopes: {
            withHash: { attributes: {} },
        },
    });   
    return Dcs;
}