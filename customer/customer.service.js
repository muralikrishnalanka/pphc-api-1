const db = require('_helpers/db');
const LabTest = require('../labtests/labtests.model');
const CustomerStatus = require('./customerstatus.model');
const CircularJSON = require('circular-json');
const { Op } = require('sequelize');
const dcsService = require('../dcs/dcs.service');



module.exports = {
  getAll,
  getAllByInsurerId,
  getById,
  create,
  update,
  search,
  createFileHistory,
  getAllForQC,
  deleteCustomer,
  getAllByStatus,
};
const now = new Date();

async function getAll() {
  const customers = await db.Customer.findAll(
    {
      include: [{
        model: db.Appointments,
        order: [['created', 'DESC']],
        attributes: ['preferredDate']
      }]
    });
  return customers.map(customer => {
    const dob = new Date(customer.dob);
    const ageInMs = now - dob;
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
    return { ...customer.toJSON(), age: ageInYears };
  });
}

async function getAllByInsurerId(insurerId) {
  try {
    const customers = await db.Customer.findAll({
      where: {
        insurance_provider: insurerId,
        statusId: 8
      }
    })
    return customers.map(customer => {
      const dob = new Date(customer.dob);
      const ageInMs = now - dob;
      const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
      return { ...customer.toJSON(), age: ageInYears };
    });
    //return dcs.map((dcs) => mapBasicDetails(dcs));
  } catch (error) {
    throw new Error(`Failed to retrieve dcss: ${error.message}`);
  }
}
async function getAllByStatus(statusId) {
  try {
    const customers = await db.Customer.findAll({
      where: {
        statusId: statusId
      }
    })
    return customers.map(customer => {
      const dob = new Date(customer.dob);
      const ageInMs = now - dob;
      const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
      return { ...customer.toJSON(), age: ageInYears };
    });
    //return dcs.map((dcs) => mapBasicDetails(dcs));
  } catch (error) {
    throw new Error(`Failed to retrieve dcss: ${error.message}`);
  }
}
async function getById(id) {
  console.log("param" + id)
  const customer = await getCustomer(id);
  return customer;
}

async function create(params) {
  // validate
  console.log(params);
  if (await db.Customer.findOne({ where: { policy_no: params.policy_no } })) {
    throw 'Policy Io "' + params.policy_no + '" is already registered';
  }
  const customers = await db.Customer.findAll({
    attributes: ['tpaRequestId'],
    where: {
      tpaRequestId: {
        [Op.like]: 'SHC00%'
      }
    },
    raw: true
  });

  const maxNum = Math.max(0, ...customers.map(cust => parseInt(cust.tpaRequestId.substr(5))));
  const newNum = (maxNum + 1).toString();
  const tpaId = `SHC00${newNum}`;

  const customer = new db.Customer({
    ...params,
    tpaRequestId: tpaId
  });

  // save customer
  await customer.save().then(async function (customer) {
    if (params.lab_tests && params.lab_tests.length) {
      for (const testId of params.lab_tests) {
        const labtest = await db.LabTests.findByPk(testId);
        if (!labtest) {
          throw 'Lab test with id "' + testId + '" not found';
        }
        const CustomerLabtests = new db.CustomerLabtests({ customerId: customer.id, labTestId: testId });
        await CustomerLabtests.save();
      }
    }
  });

  await db.CustomerHistory.create({
    action: 'Customer Registered',
    timestamp: new Date(),
    userId: params.createdBy,
    customerId: customer.id,
    comment: params.comments || 'New Customer Registered',
  });

  return basicDetails(customer);
}

async function update(id, params) {
  try {
    var actiontext = '';
    var defaultComment = '';
    const customer = await db.Customer.findByPk(id);
    const previousCustomer = customer.toJSON();
    let isReschedule = false;
    let isStatusChange = true;
    let isnoRespone = false;

    isStatusChange = params.statusId ? true : false

    if (customer.statusId == 5 || customer.statusId == 2 || customer.statusId == 3) {
      isReschedule = true;
      console.log("PARAMsTATUS" + params.statusId);
      console.log("CUSTOMERSTATUS" + customer.statusId);
      if (params.statusId && (params.statusId == 3 && customer.statusId != 5)) {
        isnoRespone = true
      }
    }

    // Update basic customer information
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        customer[key] = params[key];
      }
    });

    await customer.save();

    if (params.lab_tests && params.lab_tests.length > 0) {
      const currentSelectedValues = (await db.CustomerLabtests.findAll({
        where: { customerId: customer.id }
      })).map(row => row.labTestId);

      // Remove any selected values that are not present in params.lab_tests
      for (const testId of currentSelectedValues) {
        if (!params.lab_tests.includes(testId)) {
          await db.CustomerLabtests.destroy({
            where: { customerId: customer.id, labTestId: testId }
          });
        }
      }

      // Insert new record for each selected value that doesn't already exist
      for (const testId of params.lab_tests) {
        const relationTableRow = await db.CustomerLabtests.findOne({
          where: { customerId: customer.id, labTestId: testId }
        });

        if (!relationTableRow) {
          await db.CustomerLabtests.create({ customerId: customer.id, labTestId: testId });
        }
      }
    } else if (params.lab_tests && !params.lab_tests.length) {
      // Delete all lab tests for customer
      await db.CustomerLabtests.destroy({ where: { customerId: customer.id } });
    }

    // Create a new customer history record
    const changedFields = {};
    for (const key of Object.keys(customer.toJSON())) {
      if (customer[key] !== previousCustomer[key]) {
        changedFields[key] = previousCustomer[key];
      }
    }

    const customerStatus = await db.CustomerStatus.findByPk(customer.statusId);

    //let status = 3;
    if (isStatusChange) {
      switch (customer.statusId) {
        case 1:
          actiontext = 'Customer Details Updated'
          defaultComment = 'Customer Details Updated'
          console.log("Registered");
          break;
        case 2:
          actiontext = 'No response'
          console.log("No response");
          break;
        case 3:
          if (isReschedule) {
            actiontext = 'Reschedule'
            defaultComment = 'Appointment is modified'
            console.log("Reschedule");
          } else {
            actiontext = 'Created Appointment'
            defaultComment = 'Appointment Confirmed'
            console.log("Confirmed");
          }
          if (isnoRespone) {
            actiontext = 'Created Appointment'
            defaultComment = 'Appointment Confirmed'
            console.log("Confirmed");
          }
          break;
        case 4:
          actiontext = 'Show'
          console.log("Pending Reports");
          break;
        case 5:
          actiontext = 'No Show'
          console.log("Reschedule");
          break;
        case 6:
          actiontext = 'Reports Uploaded'
          defaultComment = params.labtests_filePath ? params.labtests_filePath : 'Reports documents uploaded'
          console.log("QC");
          break;
        case 7:
          actiontext = 'Rejected by QC'
          console.log("Rejected");
          break;
        case 8:
          actiontext = 'Approved by QC'
          console.log("Completed");
          break;
        case 9:
          actiontext = 'Foreclosed'
          console.log("Foreclosed");
          break;
        case 10:
            actiontext = 'Partial Show'
            console.log("Partial Show");
            break;  
        default:
          console.log("Customer Details Updated");
      }
    }
    else {
      actiontext = 'Customer Details Updated'
      defaultComment = 'Customer Details Updated'
    }


    await db.CustomerHistory.create({
      action: actiontext,
      timestamp: new Date(),
      userId: params.updatedBy, // This needs to be changed to the actual user ID
      customerId: customer.id,
      comment: params.comments || defaultComment,
      changes: changedFields
    });

    return db.Customer.findByPk(id);
  } catch (error) {
    throw error;
  }
}

async function deleteCustomer(id) {
  const customer = await getCustomer(id);
  await customer.destroy();
}

// helper functions

async function getCustomer(id) {
  const customer = await db.Customer.findByPk(id, {
    include: [
      {
        model: db.CustomerLabtests,
        include: [
          {
            model: db.LabTests,
            attributes: ['id', 'name']
          }
        ]
      },
      {
        model: db.CustomerStatus
      },
      {
        model: db.Appointments,
        order: [['created', 'DESC']],
        include: [
          {
            model: db.Appointmentlabtests,
            attributes: ['id', 'labTestId']
          }
        ]
      },
      {
        model: db.CustomerFile,
        order: [['version', 'DESC']],
        limit: 1,
        attributes: ['id', 'path']
      },
      {
        model: db.CustomerHistory,
        order: [['timeStamp', 'ASC']]        
      }
    ]
  });

  //console.log("labsss "+ JSON.stringify(customer));
  const labTests = [];

  for (const clt of customer.customerlabtests) {
    const lt = await db.LabTests.findByPk(clt.labTestId, {
      attributes: ['id', 'name']
    });
    labTests.push(lt);
  }
  const labTestNames = labTests.map((lt) => lt.name);

  const appointmentsWithData = [];
  for (const appointment of customer.appointments) {
    const prefTime = appointment.preferredTime;
    const [hours, minutes] = prefTime.split(':');
    const dateObj = new Date();
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    const formattedTime = dateObj.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    console.log(formattedTime); // Output: "1:00 AM"
    const appoinrtmentTests = [];

    for (const clt of appointment.appointmentlabtests) {
      const lt = await db.LabTests.findByPk(clt.labTestId, {
        attributes: ['id', 'name']
      });
      appoinrtmentTests.push(lt);
    }
    const appointmentTestNames = appoinrtmentTests.map((lt) => lt.name);
    try {
      const dcDetails = await dcsService.getById(appointment.dcId);
      appointmentsWithData.push({
        ...appointment.toJSON(),
        dcDetails,
        preferredTime: formattedTime,
        appointmentTests: appointmentTestNames,
      });
    } catch (error) {
      console.error(error);
    }
  }
  const custHistoryByEmail = [];
  for(const hist of customer.customerHistories){
    userId = parseInt(hist.userId);
    const userEmail = await db.Account.findByPk(hist.userId);
    console.log('userDetails' +JSON.stringify(userEmail))
    console.log('userDeuserIdtails' +JSON.stringify(hist.userId))

    custHistoryByEmail.push({
      ...hist.toJSON(),
      user : userEmail.email
    })
  }
  return {
    ...customer.toJSON(),
    labTests: labTestNames,
    appointments: appointmentsWithData,
    customerHistories: custHistoryByEmail
  };
}

async function createFileHistory(params) {
  const customerFile = new db.CustomerFile(params);
  await customerFile.save();
  // await db.CustomerHistory.create({
  //   action: 'Report File Upload',
  //   timestamp: new Date(),
  //   userId: 1,
  //   customerId: params.customerId,
  //   comment: params.comments || 'uploaded file Path is '+params.path+ ' and Versionn no is '+params.version,
  // });
}
function basicDetails(customer) {
  const { id, tpaRequestId, created, updated, statusId } = customer;
  return { id, tpaRequestId, created, updated, statusId };
}

async function search(searchParams) {
  // Set default values for page and limit
  const page = parseInt(searchParams.page) || 1;
  const limit = parseInt(searchParams.limit) || 10;
  const userId = parseInt(searchParams.userId) || null;
  const currentDate = new Date();
  const searchCriteria = {};
  if (searchParams.fromdate || searchParams.todate) {
    const fromDate = searchParams.fromdate ? new Date(`${searchParams.fromdate}T00:00:00.000`) : new Date('2000-01-01T23:59:59.999');
    const toDate = searchParams.todate ? new Date(`${searchParams.todate}T23:59:59.999`) : currentDate;
    if(searchParams.dateOption == '1'){
      searchCriteria['$Appointments.preferredDate$'] = { [Op.between]: [fromDate, toDate] }; // set preferredDate attribute using '$Appointments.preferredDate$' syntax
    }else{
    searchCriteria.created = { [Op.between]: [fromDate, toDate] };
    }
  }

  if(userId)
  {
    const account = await db.Account.findByPk(userId);
    if(account.role === 'Quality'){
      searchCriteria.statusId = 6;
    }
    else if(account.role ==='Provider'){
      searchCriteria.statusId = 8;
    }
  }
  // Build search criteria object excluding page and limit
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== 'page' && key !== 'limit' && key !== 'fromdate' && key !== 'todate' && key!== 'dateOption' && key!== 'userId') {
      if (typeof value === 'string') {
        searchCriteria[key] = { [Op.like]: `%${value}%` };
      } else {
        searchCriteria[key] = value;
      }
    }
  }

  // Add a condition to check if limit and page are empty
  if (!searchParams.limit && !searchParams.page) {
    // If they're empty, remove the limit and offset properties from the final query
    const result = await db.Customer.findAll({ where: searchCriteria ,
      include: [{
        model: db.Appointments,
        order: [['created', 'DESC']],
        attributes: ['preferredDate']
      }]
    });
    const totalItems = result.count;
   // return { customers: result };
   return { customers: result.map(customer => {
    const dob = new Date(customer.dob);
    const ageInMs = now - dob;
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
    return { ...customer.toJSON(), age: ageInYears };
  })};
  } else if (searchParams.limit || searchParams.page) {
    // Otherwise, proceed with the pagination logic
    const offset = (page - 1) * limit;
    const result = await db.Customer.findAndCountAll({
      where: searchCriteria,
      limit: limit,
      offset: offset,
      include: [{
        model: db.Appointments,
        order: [['created', 'DESC']],
        attributes: ['preferredDate']
      }]
    });
    const totalItems = result.count;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    return { customers: result.rows.map(customer => {
      const dob = new Date(customer.dob);
      const ageInMs = now - dob;
      const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
      return { ...customer.toJSON(), age: ageInYears };
    }), totalPages, currentPage, totalItems };
  } else {
    throw new Error('Missing required parameters');
  }
};

async function getAllForQC() {
  const customers = await db.Customer.findAll({
    where: {
      statusId: 6
    }, include: [{
      model: db.Appointments,
      order: [['created', 'DESC']],
      attributes: ['preferredDate']
    }]
  });
  return customers.map(customer => {
    const dob = new Date(customer.dob);
    const ageInMs = now - dob;
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
    return { ...customer.toJSON(), age: ageInYears };
  });
}


