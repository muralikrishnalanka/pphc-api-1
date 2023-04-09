const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    const customers = await db.Customer.findAll({ include: customerstatus });
    return customers.map(x => basicDetails(x));
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
    await customer.save();

    return basicDetails(customer);
}

async function update(id, params) {
    const customer = await getCustomer(id);

    // validate (if email was changed)
    if (params.member_id && customer.member_id !== params.member_id && await db.Customer.findOne({ where: { member_id: params.member_id } })) {
        throw 'member_id "' + params.member_id + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // copy params to customer and save
    Object.assign(customer, params);
    customer.updated = Date.now();
    await customer.save();

    return basicDetails(customer);
}

async function _delete(id) {
    const customer = await getCustomer(id);
    await customer.destroy();
}

// helper functions

async function getCustomer(id) {
    const customer = await db.Customer.findByPk({include: customerstatus},id);
    if (!customer) throw 'customer not found';
    return customer;
}

function basicDetails(customer) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified ,statusId} = customer;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified, statusId };
}





