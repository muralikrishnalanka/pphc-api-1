const db = require('_helpers/db');
const LabTest = require('../labtests/labtests.model');
const CustomerStatus = require('./customerstatus.model');

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteCustomer
};

async function getAll() {
    const customers = await db.Customer.findAll({ include: [{
        model: db.CustomerLabtests,
        include: [{
          model: db.LabTests,
          attributes: ['name']          
        }]
      },{
        model:db.CustomerStatus
    }] });
    return customers;
}

async function getById(id) {
    const customer = await getCustomer(id);
    return basicDetails(customer);
}

async function create(params) {
  // validate
  console.log(params)
  if (await db.Customer.findOne({ where: { member_id: params.member_id } })) {
      throw 'memberId "' + params.member_id + '" is already registered';
  }

  const customer = new db.Customer(params);
  
  //customer.verified = Date.now();

  // hash password
  // customer.passwordHash = await hash(params.password);

  // save customer
  await customer.save().then(function(customer){
    if (params.lab_tests && params.lab_tests.length) {
        if (params.lab_tests && params.lab_tests.length) {
            params.lab_tests.forEach(async (testId) => {
              const labtest = await db.LabTests.findByPk(testId);
              if (!labtest) {
                throw 'Lab test with id "' + testId + '" not found';
              }
            const   CustomerLabtests = new db.CustomerLabtests({customerId:customer.id,labTestId:testId});
          await   CustomerLabtests.save()
            });
          }         
        }
  });  

  return basicDetails(customer);
}

async function update(id, params) {
    try {
      const customer = await getCustomer(id);
  
      // Update basic customer information
      Object.assign(customer, params);
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
            await db.CustomerLabtests.create({
              customerId: customer.id,
              labTestId: testId
            });
          }
        }
      } else {
        // Delete all lab tests for customer
        await db.CustomerLabtests.destroy({ where: { customerId: customer.id } });
      }
  
      return await getCustomer(id);
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
  const customer = await db.Customer.findByPk(id,{ include: [{
    model: db.CustomerLabtests,
    include: [{
      model: db.LabTests,
      attributes: ['name']          
    }]
  },{
    model:db.CustomerStatus
}] });
  if (!customer) throw 'customer not found';
  return customer;
}

function basicDetails(customer) {
  const { id, title, firstName, lastName, email, role, created, updated, isVerified ,statusId} = customer;
  return { id, title, firstName, lastName, email, role, created, updated, isVerified, statusId };
}
