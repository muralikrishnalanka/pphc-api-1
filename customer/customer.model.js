const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        insurance_provider: { type: DataTypes.STRING },
        policy_no: { type: DataTypes.STRING },
        member_id: { type: DataTypes.STRING },
        agent_name: { type: DataTypes.STRING },
        agent_code: { type: DataTypes.STRING },
        agent_no: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        gender: { type: DataTypes.STRING },
        dob: { type: DataTypes.DATE }, // include time part of value
        phone: { type: DataTypes.STRING },
        address: { type: DataTypes.STRING },
        state: { type: DataTypes.STRING },
        city: { type: DataTypes.STRING },
        pincode: { type: DataTypes.STRING },
        statusId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customerstatus',key: 'id'}},
        lab_tests: { type: DataTypes.STRING }, // use array type for multiple tests
        createdBy: { type: DataTypes.INTEGER, references: { model: 'accounts', key: 'id' } }, // add reference to user id
        updatedBy: { type: DataTypes.INTEGER, references: { model: 'accounts', key: 'id' } }, // add reference to user id
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    };

    const options = {
        timestamps: false,
        defaultScope: {
            // remove 'passwordHash' column if it's not defined in the model
            attributes: { exclude: ['passwordHash'] },
        },
        scopes: {
            withHash: { attributes: {} },
        },
    };

    return sequelize.define('customer', attributes, options);
}
