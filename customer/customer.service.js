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
  deleteCustomer
};

async function getAll() {
  const customers = await db.Customer.findAll();
  const now = new Date();
  return customers.map(customer => {
    const dob = new Date(customer.dob);
    const ageInMs = now - dob;
    const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365));
    return { ...customer.toJSON(), age: ageInYears };
  });
}

async function getAllByInsurerId(insurerId) {
  try {
      const dcs = await db.Dcs.findAll({
          where:{
              insurerId:insurerId
      }})
      return dcs;
      //return dcs.map((dcs) => mapBasicDetails(dcs));
  } catch (error) {
      throw new Error(`Failed to retrieve dcss: ${error.message}`);
  }
}
async function getById(id) {
  console.log("param" +id)
  const customer = await getCustomer(id);
  return customer;
}

async function create(params) {
  // validate
  console.log(params);
  if (await db.Customer.findOne({ where: { member_id: params.member_id } })) {
    throw 'memberId "' + params.member_id + '" is already registered';
  }
  const currentMax = await db.Customer.max('tpaRequestId');
  const newNum = currentMax? parseInt(currentMax.substr(3)) + 1: 1;
  
  const tpaId = 'SHC' + String(newNum).padStart(5, '0');
  const customer = new db.Customer({
    ...params,
    tpaRequestId: tpaId
  });

  // hash password
  // customer.passwordHash = await hash(params.password);

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
    userId: 1,
    customerId: customer.id,
    comment: params.comments || 'new Customer Registered',
  });

  return basicDetails(customer);
}

async function update(id, params) {
  try {
    const customer = await db.Customer.findByPk(id);
    const previousCustomer = customer.toJSON();
    
    // Update basic customer information
    Object.keys(params).forEach(key => { 
        if (params[key] !== null && params[key] !== undefined) { 
            customer[key] = params[key];
        } 
    });
    
    await customer.save();
    
    if (params.lab_tests) {
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
    } else {
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
    
    await db.CustomerHistory.create({
      action: `updated status to ${customerStatus.name}`,
      timestamp: new Date(),
      userId: 2, // This needs to be changed to the actual user ID
      customerId: customer.id,
      comment: customer.comments || 'Customer updated',
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
        limit:1,
        attributes: ['id','path']        
      },
      {
        model: db.CustomerHistory,
        order: [['timeStamp', 'DESC']]
      }
    ]
  });

  //console.log("labsss "+ JSON.stringify(customer));
  const labTestIds = customer.customerlabtests.map((clt) => clt.labTestId);

  const appointmentsWithData = [];
  for (const appointment of customer.appointments) {
    const dcDetails = await dcsService.getById(appointment.dcId);
    appointmentsWithData.push({
      ...appointment.toJSON(),
      dcDetails,
    });
  } 

  return {
    ...customer.toJSON(),
    labTests: labTestIds,
    appointments: appointmentsWithData
  };
}

async  function createFileHistory(params) {
  const customerFile = new db.CustomerFile(params);
  await customerFile.save();
  await db.CustomerHistory.create({
    action: 'Report File Upload',
    timestamp: new Date(),
    userId: 1,
    customerId: params.customerId,
    comment: params.comments || 'uploaded file Path '+params.path+ 'and Versionn no '+params.version,
  });
}
function basicDetails(customer) {
  const { id, title, firstName, lastName, email, role, created, updated, statusId } = customer;
  return { id, title, firstName, lastName, email, role, created, updated, statusId };
}

async function search(searchParams, page = 1, limit = 10) {
  const searchCriteria = {};
 // const { Op } = db.Customer.Op;
console.log(page+" "+limit)
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      if (typeof value === 'string') {
        searchCriteria[key] = { [Op.like]: `%${value}%` };
      } else {
        searchCriteria[key] = value;
      }
    }
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await db.Customer.findAndCountAll({
    where: searchCriteria,
    limit,
    offset,
  });

  return { rows, count, page, totalPages: Math.ceil(count / limit) };
};



