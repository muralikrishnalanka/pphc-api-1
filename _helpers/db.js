const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize} = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {

    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to MySQL server
    const sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
        dialect: 'mysql',
        host: config.database.host,
        port: config.database.port,
        timezone: '+05:30',
    });

    // init models and add them to the exported db object
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.AppointmentStatus = require('../appointments/appointmentstatus.model')(sequelize);
    db.CustomerStatus = require('../customer/customerstatus.model')(sequelize);
    db.States = require('../states/states.model')(sequelize);
    db.Insurer = require('../insurer/insurer.model')(sequelize);
    db.LabTests = require('../labtests/labtests.model')(sequelize);
    db.Dcs = require('../dcs/dcs.model')(sequelize);
    db.Customer = require('../customer/customer.model')(sequelize);
    db.Appointments = require('../appointments/appointments.model')(sequelize);
    db.CustomerLabtests = require('../customer/customerlabtests.model')(sequelize);
    db.Appointmentlabtests = require('../appointments/appointmentslabtests.model')(sequelize);
    db.CustomerAppointment = require('../customer/customerappointment.model')(sequelize);
    db.CustomerFile = require('../customer/customerfiles.model')(sequelize);
    db.CustomerHistory = require('../customer/customerhistory.model')(sequelize);



    // define relationships
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);

    db.States.hasMany(db.Customer, { onDelete: 'CASCADE' });
    db.Customer.belongsTo(db.States, { foreignKey: 'stateId' });


    db.Insurer.hasMany(db.Customer, { onDelete: 'CASCADE' });
    db.Customer.belongsTo(db.Insurer, { foreignKey: 'insurance_provider' });


    db.Insurer.hasMany(db.LabTests, { onDelete: 'CASCADE' });
    db.LabTests.belongsTo(db.Insurer, { foreignKey: 'insurerId' });

    
    db.Insurer.hasMany(db.Dcs, { onDelete: 'CASCADE' });
    db.Dcs.belongsTo(db.Insurer, { foreignKey: 'insurerId' });

    db.Account.hasMany(db.Customer, { onDelete: 'CASCADE' });
    db.Customer.belongsTo(db.Account,{ foreignKey: 'createdBy' });

    db.CustomerStatus.hasMany(db.Customer);
    db.Customer.belongsTo(db.CustomerStatus, { foreignKey: 'statusId' });

    db.Customer.hasMany(db.CustomerFile);
    db.CustomerFile.belongsTo(db.Customer,{ foreignKey: 'customerId' });
    
    db.Customer.hasMany(db.CustomerHistory);
    db.CustomerHistory.belongsTo(db.Customer,{ foreignKey: 'customerId' });


    db.AppointmentStatus.hasMany(db.Appointments);
    db.Appointments.belongsTo(db.AppointmentStatus, { foreignKey: 'statusId' });

    db.CustomerLabtests.belongsTo(db.Customer);
    db.CustomerLabtests.belongsTo(db.LabTests,{ foreignKey: 'customerId' });

    db.Customer.hasMany(db.CustomerLabtests, { onDelete: 'CASCADE' });
    db.LabTests.hasMany(db.CustomerLabtests,{ foreignKey: 'customerId' });

    db.Appointmentlabtests.belongsTo(db.Appointments);
    db.Appointmentlabtests.belongsTo(db.LabTests,{ foreignKey: 'appointmentId' });

    db.Appointments.hasMany(db.Appointmentlabtests, { onDelete: 'CASCADE' });
    db.LabTests.hasMany(db.Appointmentlabtests,{ foreignKey: 'appointmentId' });

    db.Account.hasMany(db.Appointments, { onDelete: 'CASCADE' });
    db.Appointments.belongsTo(db.Account,{ foreignKey: 'createdBy' });

    db.Customer.hasMany(db.Appointments, { onDelete: 'CASCADE' });
    db.Appointments.belongsTo(db.Customer,{ foreignKey: 'customerId' });

    // sync all models with database
    await sequelize.sync();
}
