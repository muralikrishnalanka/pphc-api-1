const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.AppointmentStatus = require('../appointments/appointmentstatus.model')(sequelize);
    db.CustomerStatus = require('../customer/customerstatus.model')(sequelize);
    db.States = require('../states/states.model')(sequelize);
    db.LabTests = require('../labtests/labtests.model')(sequelize);
    db.Dcs = require('../dcs/dcs.model')(sequelize);
    db.Customer = require('../customer/customer.model')(sequelize);
    db.Appointments = require('../appointments/appointments.model')(sequelize);
    db.CustomerLabtests = require('../customer/customerlabtests.model')(sequelize);
    db.Appointmentlabtests = require('../appointments/appointmentslabtests.model')(sequelize);
    db.CustomerAppointment = require('../customer/customerappointment.model')(sequelize);

    // db.Excel = require('../excel/excel.model')(sequelize);

    // define relationships


    // define relationships
    if (!db.Account.hasMany(db.RefreshToken)) {
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    }
    if (!db.RefreshToken.belongsTo(db.Account)) {
        db.RefreshToken.belongsTo(db.Account);
    }

    if (!db.States.hasMany(db.Customer)) {
        db.States.hasMany(db.Customer, { onDelete: 'CASCADE' });
    }
    if (!db.Customer.belongsTo(db.States)) {
        db.Customer.belongsTo(db.States, { foreignKey: 'stateId' });
    }
    // Add similar checks for other relationship definitions
    if (!db.Account.hasMany(db.Customer)) {
        db.Account.hasMany(db.Customer, { onDelete: 'CASCADE' });
    }
    if (!db.Customer.belongsTo(db.Account)) {
        db.Customer.belongsTo(db.Account);
    }
    if (!db.Customer.hasMany(db.CustomerStatus)) {
        db.Customer.hasMany(db.CustomerStatus, { onDelete: 'CASCADE' });

   }
     if (!db.CustomerStatus.belongsTo(db.Customer)) {
        db.CustomerStatus.belongsTo(db.Customer, { foreignKey: 'statusId' });
    }
    if (!db.CustomerLabtests.belongsTo(db.Customer)) {
        db.CustomerLabtests.belongsTo(db.Customer);
    } 
    if (!db.CustomerLabtests.belongsTo(db.LabTests)) 
    {
        db.CustomerLabtests.belongsTo(db.LabTests);
    }
    if (!db.Customer.hasMany(db.CustomerLabtests)) {
        db.Customer.hasMany(db.CustomerLabtests, { onDelete: 'CASCADE' });
    }
    if (!db.LabTests.hasMany(db.CustomerLabtests)) {
        db.LabTests.hasMany(db.CustomerLabtests, );

    }
    if (!db.Appointments.hasMany(db.Appointmentlabtests)) {
        db.Appointments.hasMany(db.Appointmentlabtests, { onDelete: 'CASCADE' });
    }
    // if (!db.Appointmentlabtests.belongsTo(db.LabTests)) {
    //     db.Appointmentlabtests.belongsTo(db.LabTests, { foreignKey: 'labTestId', as: 'labtest' });
    // }
    if (!db.Account.hasMany(db.Appointments)) {
        db.Account.hasMany(db.Appointments, { onDelete: 'CASCADE' });
    }
    if (!db.Appointments.belongsTo(db.Account)) {
        db.Appointments.belongsTo(db.Account);
    }
    // if (!db.AppointmentStatus.hasMany(db.Appointments)) {
    //     db.AppointmentStatus.hasMany(db.Appointments, { onDelete: 'CASCADE' });
    // }
    // if (!db.Appointments.belongsTo(db.AppointmentStatus)) {
    //     db.Appointments.belongsTo(db.AppointmentStatus, { foreignKey: 'statusId' });
    // }
     if (!db.Customer.hasMany(db.Appointments)) {
        db.Customer.hasMany(db.Appointments, { onDelete: 'CASCADE' });
    } if (!db.Appointments.belongsTo(db.Customer)) {
        db.Appointments.belongsTo(db.Customer);
    }



    // db.CustomerAppointment.belongsTo(db.Customer, { foreignKey: 'customerId',  as: 'customer'});
    // db.CustomerAppointment.belongsTo(db.Appointments, {foreignKey: 'appointmentId', as: 'appointment' });





    // sync all models with database
    await sequelize.sync();
}