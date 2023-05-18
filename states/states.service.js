const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    deleteStates,
};

async function getAll() {
    try {
        const states = await db.States.findAll({
            order: [
                ['name', 'ASC'] // Add this line to order by state name in ascending order
            ]
        });
        return states.map((state) => mapBasicDetails(state));
    } catch (error) {
        throw new Error(`Failed to retrieve states: ${error.message}`);
    }

}

async function getById(statesId) {
    try {
        const states = await findstatesById(statesId);
        return mapBasicDetails(states);
    } catch (error) {
        throw new Error(`Failed to retrieve states: ${error.message}`);
    }
}

async function create(params) {
    try {
        // const existingstates = await db.statess.findOne({
        //   where: { email: params.email },
        // });
        // if (existingstates) {
        //   throw new Error(`Email "${params.email}" is already registered`);
        // }
        // // hash password
        // params.passwordHash = await hash(params.password);
        console.log("Params" + JSON.stringify(params))
        const states = await db.statess.create(params);
        return mapBasicDetails(states);
    } catch (error) {
        throw new Error(`Failed to create states: ${error.message}`);
    }
}

async function update(statesId, params) {
    try {
        const states = await findstatesById(statesId);

        // const existingstates = await db.statess.findOne({
        //   where: { email: params.email },
        // });
        // if (existingstates && existingstates.id !== states.id) {
        //   throw new Error(`Email "${params.email}" is already taken`);
        // }

        // hash password if it was entered
        // if (params.password) {
        //   params.passwordHash = await hash(params.password);
        // }

        // copy params to states and save
        Object.assign(states, params);
       // states.updated = Date.now();

        await states.save();
        return mapBasicDetails(states);
    } catch (error) {
        throw new Error(`Failed to update states: ${error.message}`);
    }
}

async function deleteStates(statesId) {
    try {
        const states = await findstatesById(statesId);
        await states.destroy();
    } catch (error) {
        throw new Error(`Failed to delete states: ${error.message}`);
    }
}

// helper functions

async function findstatesById(statesId) {
    const states = await db.States.findByPk(statesId);
    if (!states) {
        throw new Error(`states with id ${statesId} not found`);
    }
    return states;
}

function mapBasicDetails(states) {
    const { id, name } = states;
    return { id, name };
}
