const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const customerstatus = sequelize.define('customerstatus', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        status: { type: DataTypes.STRING, allowNull: false }
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
    return customerstatus;
}

// Insert appointmentstatus by default
    // sequelize.sync({ force: true }).then(() => {
    //     State.bulkCreate([
    //         { name: 'Andhra Pradesh' },
    //         { name: 'Arunachal Pradesh' },
    //         { name: 'Assam' },
    //         { name: 'Bihar' },
    //         { name: 'Chhattisgarh' },
    //         { name: 'Goa' },
    //         { name: 'Gujarat' },
    //         { name: 'Haryana' },
    //         { name: 'Himachal Pradesh' },
    //         { name: 'Jharkhand' },
    //         { name: 'Karnataka' },
    //         { name: 'Kerala' },
    //         { name: 'Madhya Pradesh' },
    //         { name: 'Maharashtra' },
    //         { name: 'Manipur' },
    //         { name: 'Meghalaya' },
    //         { name: 'Mizoram' },
    //         { name: 'Nagaland' },
    //         { name: 'Odisha' },
    //         { name: 'Punjab' },
    //         { name: 'Rajasthan' },
    //         { name: 'Sikkim' },
    //         { name: 'Tamil Nadu' },
    //         { name: 'Telangana' },
    //         { name: 'Tripura' },
    //         { name: 'Uttar Pradesh' },
    //         { name: 'Uttarakhand' },
    //         { name: 'West Bengal' }
    //     ]);
    // }).catch((error) => {
    //     console.error(error);
    // });