const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const labtestsService = require('./labtests.service');




// routes
router.post('/create', createSchema, create);
router.post('/update/:id', updateSchema, update);
router.get('/getById/:id',  getById);
router.get('/getAll',  getAll);
router.delete('/delete/:id', _delete);

module.exports = router;


function getAll(req, res, next) {
    labtestsService.getAll()
        .then(labtests => res.json(labtests))
        .catch(next);
}

function getById(req, res, next) {
    labtestsService.getById(req.params.id)
        .then(labtest => labtest ? res.json(labtest) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({         
        name: Joi.string().required() 
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    labtestsService.create(req.body)
        .then(labtest => res.json(labtest))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {        
        name: Joi.string().empty(''),        
    };

    // only admins can update role
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    labtestsService.update(req.params.id, req.body)
        .then(labtest => res.json(labtest))
        .catch(next);
}

function _delete(req, res, next) {
    labtestsService.deletelabtests(req.params.id)
        .then(() => res.json({ message: 'labtest deleted successfully' }))
        .catch(next);
}
