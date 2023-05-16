const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const insurerService = require('./insurer.service');




// routes
router.post('/create', createSchema, create);
router.post('/update/:id', updateSchema, update);
router.get('/getById/:id',  getById);
router.get('/getAll',  getAll);
router.delete('/delete/:id', _delete);

module.exports = router;


function getAll(req, res, next) {
    insurerService.getAll()
        .then(dcs => res.json(dcs))
        .catch(next);
}

function getById(req, res, next) {
    insurerService.getById(req.params.id)
        .then(insurer => insurer ? res.json(insurer) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({         
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    insurerService.create(req.body)
        .then(insurer => res.json(insurer))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {        
        name: Joi.string().empty('')       
    };

    // only admins can update role
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    insurerService.update(req.params.id, req.body)
        .then(insurer => res.json(insurer))
        .catch(next);
}

function _delete(req, res, next) {
    insurerService.deleteinsurer(req.params.id)
        .then(() => res.json({ message: 'insurer deleted successfully' }))
        .catch(next);
}
