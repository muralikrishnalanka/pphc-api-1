const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    getAllByInsurerId,
    deletedcs,
};

async function getAll() {
    try {
        const dcs = await db.Dcs.findAll();
        return dcs.map((dcs) => mapBasicDetails(dcs));
    } catch (error) {
        throw new Error(`Failed to retrieve dcss: ${error.message}`);
    }
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

async function getById(dcsId) {
    try {
        const dcs = await finddcsById(dcsId);
        return mapBasicDetails(dcs);
    } catch (error) {
        throw new Error(`Failed to retrieve dcs: ${error.message}`);
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
        const dcs = await db.dcss.create(params);
        return mapBasicDetails(dcs);
    } catch (error) {
        throw new Error(`Failed to create dcs: ${error.message}`);
    }
}

async function update(dcsId, params) {
    try {
        const dcs = await finddcsById(dcsId);

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
        Object.assign(dcs, params);
        //dcs.updated = Date.now();

        await dcs.save();
        return mapBasicDetails(dcs);
    } catch (error) {
        throw new Error(`Failed to update dcs: ${error.message}`);
    }
}

async function deletedcs(dcsId) {
    try {
        const dcs = await finddcsById(dcsId);
        await dcs.destroy();
    } catch (error) {
        throw new Error(`Failed to delete dcs: ${error.message}`);
    }
}

// helper functions

async function finddcsById(dcsId) {
    const dcs = await db.Dcs.findByPk(dcsId);
    if (!dcs) {
        throw new Error(`dcs with id ${dcsId} not found`);
    }
    return dcs;
}

function mapBasicDetails(dcs) {
    const { id, name , phonenumber, email ,address ,city ,state , PinCode  } = dcs;
    return { id, name,phonenumber, email ,address ,city ,state , PinCode  };
}
