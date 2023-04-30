const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const Dcs = sequelize.define('dcs', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        phonenumber: { type: DataTypes.STRING, validate: {notEmpty: true, is: /^(?:\+[0-9]{1,3}\.)?[0-9]{4,14}(?:x.+)?$/ } },
        email: { type: DataTypes.STRING, allowNull: false },
        address: { type: DataTypes.STRING, allowNull: false },
        city: { type: DataTypes.STRING, allowNull: false },
        state: { type: DataTypes.STRING, allowNull: false },
        PinCode: { type: DataTypes.INTEGER, allowNull: false },
        insurerId: { type: DataTypes.INTEGER, references: { model: 'insurers', key: 'id' } }
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