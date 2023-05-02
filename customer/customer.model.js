const { DataTypes,Op } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        tpaRequestId: { type: DataTypes.STRING },
        policy_no: { type: DataTypes.STRING },
        member_id: { type: DataTypes.STRING },
        agent_name: { type: DataTypes.STRING },
        agent_code: { type: DataTypes.STRING },
        agent_no: { type: DataTypes.STRING },
        //orderId: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        gender: { type: DataTypes.STRING },
        dob: { type: DataTypes.DATE }, // include time part of value
        phone: { type: DataTypes.STRING, validate: {notEmpty: true, is: /^(?:\+[0-9]{1,3}\.)?[0-9]{4,14}(?:x.+)?$/ } },
        address: { type: DataTypes.STRING },
        stateId: { type: DataTypes.INTEGER, references: { model: 'states', key: 'id' } },
        city: { type: DataTypes.STRING },
        pincode: { type: DataTypes.INTEGER },
        comments: { type: DataTypes.STRING },
        labtests_filePath: { type: DataTypes.STRING }, // Add a file path field to the customer schema
        statusId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customerstatus',key: 'id'}},        
        createdBy: { type: DataTypes.INTEGER, references: { model: 'accounts', key: 'id' } }, // add reference to user id
        updatedBy: { type: DataTypes.INTEGER, references: { model: 'accounts', key: 'id' } }, // add reference to user id
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        insurance_provider: { type: DataTypes.INTEGER, references: { model: 'insurers', key: 'id' } }
    };

    const options = {
        Op,
        //operatorsAliases:{$like:Op.like},
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
