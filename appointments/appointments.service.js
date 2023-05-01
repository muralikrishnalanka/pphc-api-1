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
    const appointments = await db.Appointments.findAll({
      include: [{
        model: db.Appointmentlabtests,
        include: [{
          model: db.LabTests,
          attributes: ['name']
        }]
      }, {
        model: db.AppointmentStatus
      }]
    });
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
    const appointment = new db.Appointments(params);
    await appointment.save();

    if (params.tests && params.tests.length) {
      const testsPromises = params.tests.map(async (testId) => {
        const labtest = await db.LabTests.findByPk(testId);
        if (!labtest) {
          throw 'Lab test with id "' + testId + '" not found';
        }
        const AppointmentLabtests = new db.Appointmentlabtests({ appointmentId: appointment.id, labTestId: testId });
        await AppointmentLabtests.save();
      });
      await Promise.all(testsPromises);
    }

    // Then, use the customerStatus name in the action field
    const changedFields = {};
    const historyParams = {
      action: `created Appointment`,
      timestamp: new Date(),
      userId: 2, // This needs to be changed to the actual user ID
      customerId: params.customerId,
      comments: params.comments || 'Customer Appointment updated',
      changes: changedFields
    };
    await createCustomerHistory(appointment, historyParams);

    return mapBasicDetails(appointment);
  } catch (error) {
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
}

async function update(appointmentId, params) {
  try {
    const appointment = await findAppointmentById(appointmentId);
    const previousAppointment = appointment;

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

    if (params.tests) {
      const currentSelectedValues = (await db.Appointmentlabtests.findAll({
        where: { appointmentId: appointment.id }
      })).map(row => row.labTestId);

      // Remove any selected values that are not present in params.lab_tests
      for (const testId of currentSelectedValues) {
        if (!params.tests.includes(testId)) {
          await db.Appointmentlabtests.destroy({
            where: { appointmentId: appointment.id, labTestId: testId }
          });
        }
      }

      // Insert new record for each selected value that doesn't already exist
      const testsPromises = params.tests.map(async (testId) => {
        const relationTableRow = await db.Appointmentlabtests.findOne({
          where: { appointmentId: appointment.id, labTestId: testId }
        });

        if (!relationTableRow) {
          await db.Appointmentlabtests.create({
            appointmentId: appointment.id,
            labTestId: testId
          });
        }
      });
      await Promise.all(testsPromises);
    } else {
      // Delete all lab tests for customer
      await db.Appointmentlabtests.destroy({ where: { appointmentId: appointment.id } });
    }

    // Create a new customer history record
    const changedFields = {};
    for (const key of Object.keys(appointment.dataValues)) {
      if (appointment.dataValues[key] !== previousAppointment[key]) {
        changedFields[key] = previousAppointment[key];
      }
    }
      
    const historyParams = {
      action: `update Appointment`,
      timestamp: new Date(),
      userId: 2, // This needs to be changed to the actual user ID
      customerId: params.customerId,
      comments: params.comments || 'Customer Appointment updated',
      changes: changedFields
    };
    await createCustomerHistory(appointment, historyParams);

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

async function findAppointmentById(id) {

  const appointment = await db.Appointments.findByPk(id);
  console.log('AppointmentParams : ' + JSON.stringify(appointment))

  if (!appointment) {
    throw new Error(`Appointment with id ${id} not found`);
  }
  return appointment;
}

function mapBasicDetails(appointment) {
  const { id, partialAppointments, typeOfVisit, dcName, tests, preferredDate, preferredTime, customerId, statusId, createdBy, updatedBy, created, updated } = appointment;
  return { id, partialAppointments, typeOfVisit, dcName, tests, preferredDate, preferredTime, customerId, statusId, createdBy, updatedBy, created, updated };
}

async function createCustomerHistory(appointment, historyParams) {
    // First, retrieve the customerStatus object from the database
    const appointmentStatus = await db.AppointmentStatus.findOne({
      where: { id: appointment.statusId }
    });

    // Then, use the customerStatus name in the action field
    await db.CustomerHistory.create(historyParams);
}
