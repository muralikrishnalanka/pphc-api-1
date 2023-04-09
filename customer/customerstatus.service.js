const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    deletecustomerstatus,
};

async function getAll() {
    try {
        const customerstatus = await db.Customerstatus.findAll();
        return customerstatus.map((customerstatus) => mapBasicDetails(customerstatus));
    } catch (error) {
        throw new Error(`Failed to retrieve customerstatuss: ${error.message}`);
    }
}

async function getById(customerstatusId) {
    try {
        const customerstatus = await findcustomerstatusById(customerstatusId);
        return mapBasicDetails(customerstatus);
    } catch (error) {
        throw new Error(`Failed to retrieve customerstatus: ${error.message}`);
    }
}

async function create(params) {
    try {
        // const existingcustomerstatus = await db.customerstatuss.findOne({
        //   where: { email: params.email },
        // });
        // if (existingcustomerstatus) {
        //   throw new Error(`Email "${params.email}" is already registered`);
        // }
        // // hash password
        // params.passwordHash = await hash(params.password);
        console.log("Params" + JSON.stringify(params))
        const customerstatus = await db.Customerstatus.create(params);
        return mapBasicDetails(customerstatus);
    } catch (error) {
        throw new Error(`Failed to create customerstatus: ${error.message}`);
    }
}

async function update(customerstatusId, params) {
    try {
        const customerstatus = await findcustomerstatusById(customerstatusId);

        // const existingcustomerstatus = await db.customerstatuss.findOne({
        //   where: { email: params.email },
        // });
        // if (existingcustomerstatus && existingcustomerstatus.id !== customerstatus.id) {
        //   throw new Error(`Email "${params.email}" is already taken`);
        // }

        // hash password if it was entered
        // if (params.password) {
        //   params.passwordHash = await hash(params.password);
        // }

        // copy params to customerstatus and save
        Object.assign(customerstatus, params);
       // customerstatus.updated = Date.now();

        await customerstatus.save();
        return mapBasicDetails(customerstatus);
    } catch (error) {
        throw new Error(`Failed to update customerstatus: ${error.message}`);
    }
}

async function deletecustomerstatus(customerstatusId) {
    try {
        const customerstatus = await findcustomerstatusById(customerstatusId);
        await customerstatus.destroy();
    } catch (error) {
        throw new Error(`Failed to delete customerstatus: ${error.message}`);
    }
}

// helper functions

async function findcustomerstatusById(customerstatusId) {
    const customerstatus = await db.Customerstatus.findByPk(customerstatusId);
    if (!customerstatus) {
        throw new Error(`customerstatus with id ${customerstatusId} not found`);
    }
    return customerstatus;
}

function mapBasicDetails(customerstatus) {
    const { id, name } = customerstatus;
    return { id, name };
}
