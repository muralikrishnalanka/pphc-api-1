const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        partialAppointments: { type: DataTypes.BOOLEAN, allowNull: false },
        typeOfVisit: {type: DataTypes.STRING,allowNull: false,
            validate: {
                notEmpty: true, // enforce non-empty strings
            },
        },
        dcId: { type: DataTypes.INTEGER, references: { model: 'dcs', key: 'id' } },
        comments: { type: DataTypes.STRING, allowNull: true },
        preferredDate: { type: DataTypes.DATE, allowNull: false },
        preferredTime: { type: DataTypes.TIME, allowNull: false },
        customerId: { type: DataTypes.INTEGER, references: { model: 'customers', key: 'id' } },
        statusId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'appointmentstatus',key: 'id'}},
        isShown:{ type: DataTypes.TIME, allowNull: true },
        createdBy: { type: DataTypes.INTEGER, references: { model: 'accounts', key: 'id' } }, // add reference to user id
        updatedBy: { type: DataTypes.INTEGER, references: { model: 'accounts', key: 'id' } }, // add reference to user id
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    };

    const options = {
        timestamps: false,
        defaultScope: {
            attributes: { exclude: ['passwordHash'] },
        },
        scopes: {
            withHash: { attributes: {} },
        },
    };

    return sequelize.define('appointment', attributes, options);
}
