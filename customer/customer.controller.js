const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const customerService = require('./customer.service');
//const appointments = require('../appointments/appointments.model');

// routes
router.post('/create', createSchema, create);
router.put('/:id', updateSchema, update);
//router.post('/update',updateSchema,update);
router.post('/getById', authorize(), getById);
router.post('/getAll', authorize(), getAll);
router.post('/delete', authorize(), _delete);


module.exports = router;


function getAll(req, res, next) {
    customerService.getAll()
        .then(customers => res.json(customers))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    customerService.getById(req.params.id)
        .then(customer => customer ? res.json(customer) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        insurance_provider: Joi.string().required(),
        policy_no: Joi.string().required(),
        member_id: Joi.string().required(),
        agent_name: Joi.string().required(),
        agent_code: Joi.string().required(),
        agent_no: Joi.string().required(),
        name: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.date().required(), // include time part of value
        phone: Joi.string().required(),
        address: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.string().required(),
        lab_tests: Joi.string().required(),
        stausId: Joi.INTEGER().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    customerService.create(req.body)
        .then(customer => res.json(customer))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        insurance_provider: Joi.string().required(),
        policy_no: Joi.string().required(),
        member_id: Joi.string().required(),
        agent_name: Joi.string().required(),
        agent_code: Joi.string().required(),
        agent_no: Joi.string().required(),
        name: Joi.string().required(),
        gender: Joi.string().required(),
        dob: Joi.date().required(), // include time part of value
        phone: Joi.string().required(),
        address: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        pincode: Joi.string().required(),
        lab_tests: Joi.string().required(),
        stausId: Joi.INTEGER().required()
    };

    // only admins can update role
    //   if (req.user.role === Role.Admin) {
    //  schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    //  }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    console.log("request" + JSON.stringify(req.params))
    // if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // }

    customerService.update(req.params.id, req.body)
        .then(customer => res.json(customer))
        .catch(next);
}

function _delete(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    customerService.delete(req.params.id)
        .then(() => res.json({ message: 'Customer deleted successfully' }))
        .catch(next);
}
