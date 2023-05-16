const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const File = sequelize.define('customerFile', {
        path: DataTypes.STRING,
        version: DataTypes.INTEGER
      }, {
        timestamps: false,
        defaultScope: {
            // remove 'passwordHash' column if it's not defined in the model
            attributes: { exclude: ['passwordHash'] },
        },
        scopes: {
            withHash: { attributes: {} },
        },
        freezeTableName: true
    });   
    return File;
}