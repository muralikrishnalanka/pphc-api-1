const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteAppointment,
};

async function getAll() {
    try {
        const appointments = await db.Appointments.findAll({ include: appointmentstatus });
        return appointments.map((appointment) => mapBasicDetails(appointment));
    } catch (error) {
        throw new Error(`Failed to retrieve appointments: ${error.message}`);
    }
}

async function getById(appointmentId) {
    try {
        const appointment = await findAppointmentById(appointmentId);
        return mapBasicDetails(appointment);
    } catch (error) {
        throw new Error(`Failed to retrieve appointment: ${error.message}`);
    }
}

async function create(params) {
    try {
        // const existingAppointment = await db.appointments.findOne({
        //   where: { email: params.email },
        // });
        // if (existingAppointment) {
        //   throw new Error(`Email "${params.email}" is already registered`);
        // }
        // // hash password
        // params.passwordHash = await hash(params.password);
        console.log("Params" + JSON.stringify(params))
        const appointment = await db.Appointments.create(params);
        return mapBasicDetails(appointment);
    } catch (error) {
        throw new Error(`Failed to create appointment: ${error.message}`);
    }
}

async function update(appointmentId, params) {
    try {
        const appointment = await findAppointmentById(appointmentId);

        // const existingAppointment = await db.appointments.findOne({
        //   where: { email: params.email },
        // });
        // if (existingAppointment && existingAppointment.id !== appointment.id) {
        //   throw new Error(`Email "${params.email}" is already taken`);
        // }

        // hash password if it was entered
        // if (params.password) {
        //   params.passwordHash = await hash(params.password);
        // }

        // copy params to appointment and save
        Object.assign(appointment, params);
        appointment.updated = Date.now();

        await appointment.save();
        return mapBasicDetails(appointment);
    } catch (error) {
        throw new Error(`Failed to update appointment: ${error.message}`);
    }
}

async function deleteAppointment(appointmentId) {
    try {
        const appointment = await findAppointmentById(appointmentId);
        await appointment.destroy();
    } catch (error) {
        throw new Error(`Failed to delete appointment: ${error.message}`);
    }
}

// helper functions

async function findAppointmentById(appointmentId) {
    const appointment = await db.Appointments.findByPk({ include: appointmentstatus },appointmentId);
    if (!appointment) {
        throw new Error(`Appointment with id ${appointmentId} not found`);
    }
    return appointment;
}

function mapBasicDetails(appointment) {
    const { id, partialAppointments,typeOfVisit,dcName,tests,preferredDate,preferredTime,customerId,statusId,createdBy,updatedBy,created, updated } = appointment;
    return { id, partialAppointments,typeOfVisit,dcName,tests,preferredDate,preferredTime,customerId,statusId,createdBy,updatedBy,created, updated };
}
