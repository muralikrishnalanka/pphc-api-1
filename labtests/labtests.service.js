const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    getAllByInsurerId,
    deletelabtests,
};

async function getAll() {
    try {
        const labtests = await db.LabTests.findAll();
        return labtests.map((labtests) => mapBasicDetails(labtests));
    } catch (error) {
        throw new Error(`Failed to retrieve labtestss: ${error.message}`);
    }
}

async function getAllByInsurerId(insurerId) {
    try {
        const labtests = await db.LabTests.findAll({
            where:{
                insurerId:insurerId
        }});
        return labtests;
    } catch (error) {
        throw new Error(`Failed to retrieve labtestss: ${error.message}`);
    }
}

async function getById(labtestsId) {
    try {
        const labtests = await findlabtestsById(labtestsId);
        return mapBasicDetails(labtests);
    } catch (error) {
        throw new Error(`Failed to retrieve labtests: ${error.message}`);
    }
}

async function create(params) {
    try {
        // const existinglabtests = await db.labtestss.findOne({
        //   where: { email: params.email },
        // });
        // if (existinglabtests) {
        //   throw new Error(`Email "${params.email}" is already registered`);
        // }
        // // hash password
        // params.passwordHash = await hash(params.password);
        console.log("Params" + JSON.stringify(params))
        const labtests = await db.labtestss.create(params);
        return mapBasicDetails(labtests);
    } catch (error) {
        throw new Error(`Failed to create labtests: ${error.message}`);
    }
}

async function update(labtestsId, params) {
    try {
        const labtests = await findlabtestsById(labtestsId);

        // const existinglabtests = await db.labtestss.findOne({
        //   where: { email: params.email },
        // });
        // if (existinglabtests && existinglabtests.id !== labtests.id) {
        //   throw new Error(`Email "${params.email}" is already taken`);
        // }

        // hash password if it was entered
        // if (params.password) {
        //   params.passwordHash = await hash(params.password);
        // }

        // copy params to labtests and save
        Object.assign(labtests, params);
        //labtests.updated = Date.now();

        await labtests.save();
        return mapBasicDetails(labtests);
    } catch (error) {
        throw new Error(`Failed to update labtests: ${error.message}`);
    }
}

async function deletelabtests(labtestsId) {
    try {
        const labtests = await findlabtestsById(labtestsId);
        await labtests.destroy();
    } catch (error) {
        throw new Error(`Failed to delete labtests: ${error.message}`);
    }
}

// helper functions

async function findlabtestsById(labtestsId) {
    const labtests = await db.LabTests.findByPk(labtestsId);
    if (!labtests) {
        throw new Error(`labtests with id ${labtestsId} not found`);
    }
    return labtests;
}

function mapBasicDetails(labtests) {
    const { id, name } = labtests;
    return { id, name };
}
