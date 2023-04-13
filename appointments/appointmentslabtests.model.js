const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const Customerlabtests = sequelize.define('appointmentlabtests', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        appointmentId: { type: DataTypes.INTEGER,allowNull: false,references: { model: 'appointments', key: 'id'}},
        labTestId: { type: DataTypes.INTEGER,allowNull: false,references: { model: 'labTests', key: 'id'}}
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
    return Customerlabtests;
}