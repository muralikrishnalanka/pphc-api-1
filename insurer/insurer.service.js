const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteinsurer,
};

async function getAll() {
    try {
        const insurers = await db.Insurer.findAll();
        return insurers.map((insurers) => mapBasicDetails(insurers));
    } catch (error) {
        throw new Error(`Failed to retrieve insurer: ${error.message}`);
    }
}

async function getById(insurerId) {
    try {
        const insurer = await findinsurerById(insurerId);
        return mapBasicDetails(insurer);
    } catch (error) {
        throw new Error(`Failed to retrieve insurer: ${error.message}`);
    }
}

async function create(params) {
    try {
        // const existingdcs = await db.dcss.findOne({
        //   where: { email: params.email },
        // });
        // if (existingdcs) {
        //   throw new Error(`Email "${params.email}" is already registered`);
        // }
        // // hash password
        // params.passwordHash = await hash(params.password);
        console.log("Params" + JSON.stringify(params))
        const insurer = await db.Insurer.create(params);
        return mapBasicDetails(insurer);
    } catch (error) {
        throw new Error(`Failed to create insurer: ${error.message}`);
    }
}

async function update(insurerId, params) {
    try {
        const insurer = await finddcsById(insurerId);

        // const existingdcs = await db.dcss.findOne({
        //   where: { email: params.email },
        // });
        // if (existingdcs && existingdcs.id !== dcs.id) {
        //   throw new Error(`Email "${params.email}" is already taken`);
        // }

        // hash password if it was entered
        // if (params.password) {
        //   params.passwordHash = await hash(params.password);
        // }

        // copy params to dcs and save
        Object.assign(insurer, params);
        //dcs.updated = Date.now();

        await insurer.save();
        return mapBasicDetails(insurer);
    } catch (error) {
        throw new Error(`Failed to update insurer: ${error.message}`);
    }
}

async function deleteinsurer(insurerId) {
    try {
        const insurer = await findinsurerById(insurerId);
        await insurer.destroy();
    } catch (error) {
        throw new Error(`Failed to delete insurer: ${error.message}`);
    }
}

// helper functions

async function findinsurerById(insurerId) {
    const insurer = await db.Insurer.findByPk(insurerId);
    if (!insurer) {
        throw new Error(`insurer with id ${insurerId} not found`);
    }
    return insurer;
}

function mapBasicDetails(insurer) {
    const { id, name , phonenumber, email ,address ,city ,state , PinCode  } = insurer;
    return { id, name,phonenumber, email ,address ,city ,state , PinCode  };
}
