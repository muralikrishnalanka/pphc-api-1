const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const Insurer = sequelize.define('insurer', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false }
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
    return Insurer;
}