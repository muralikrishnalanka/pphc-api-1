const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteappointmentstatus,
};

async function getAll() {
    try {
        const appointmentstatus = await db.Appointmentstatus.findAll();
        return appointmentstatus.map((appointmentstatus) => mapBasicDetails(appointmentstatus));
    } catch (error) {
        throw new Error(`Failed to retrieve appointmentstatuss: ${error.message}`);
    }
}

async function getById(appointmentstatusId) {
    try {
        const appointmentstatus = await findappointmentstatusById(appointmentstatusId);
        return mapBasicDetails(appointmentstatus);
    } catch (error) {
        throw new Error(`Failed to retrieve appointmentstatus: ${error.message}`);
    }
}

async function create(params) {
    try {
        // const existingappointmentstatus = await db.appointmentstatuss.findOne({
        //   where: { email: params.email },
        // });
        // if (existingappointmentstatus) {
        //   throw new Error(`Email "${params.email}" is already registered`);
        // }
        // // hash password
        // params.passwordHash = await hash(params.password);
        console.log("Params" + JSON.stringify(params))
        const appointmentstatus = await db.appointmentstatuss.create(params);
        return mapBasicDetails(appointmentstatus);
    } catch (error) {
        throw new Error(`Failed to create appointmentstatus: ${error.message}`);
    }
}

async function update(appointmentstatusId, params) {
    try {
        const appointmentstatus = await findappointmentstatusById(appointmentstatusId);

        // const existingappointmentstatus = await db.appointmentstatuss.findOne({
        //   where: { email: params.email },
        // });
        // if (existingappointmentstatus && existingappointmentstatus.id !== appointmentstatus.id) {
        //   throw new Error(`Email "${params.email}" is already taken`);
        // }

        // hash password if it was entered
        // if (params.password) {
        //   params.passwordHash = await hash(params.password);
        // }

        // copy params to appointmentstatus and save
        Object.assign(appointmentstatus, params);
       // appointmentstatus.updated = Date.now();

        await appointmentstatus.save();
        return mapBasicDetails(appointmentstatus);
    } catch (error) {
        throw new Error(`Failed to update appointmentstatus: ${error.message}`);
    }
}

async function deleteappointmentstatus(appointmentstatusId) {
    try {
        const appointmentstatus = await findappointmentstatusById(appointmentstatusId);
        await appointmentstatus.destroy();
    } catch (error) {
        throw new Error(`Failed to delete appointmentstatus: ${error.message}`);
    }
}

// helper functions

async function findappointmentstatusById(appointmentstatusId) {
    const appointmentstatus = await db.Appointmentstatus.findByPk(appointmentstatusId);
    if (!appointmentstatus) {
        throw new Error(`appointmentstatus with id ${appointmentstatusId} not found`);
    }
    return appointmentstatus;
}

function mapBasicDetails(appointmentstatus) {
    const { id, name } = appointmentstatus;
    return { id, name };
}
