const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const LabTests = sequelize.define('labTests', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
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
    return LabTests;
}