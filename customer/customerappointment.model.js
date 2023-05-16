const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const Customerappointment = sequelize.define('customerappointment', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        customerId: { type: DataTypes.INTEGER,allowNull: false,references: { model: 'customers', key: 'id'}},
        appointmentId: { type: DataTypes.INTEGER,allowNull: false,references: { model: 'appointments', key: 'id'}}
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
    return Customerappointment;
}