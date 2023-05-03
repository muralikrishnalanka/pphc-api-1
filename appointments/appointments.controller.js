const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const appointmentsService = require('./appointments.service');


// routes
router.post('/create', createSchema, create);
router.put('/update/:id', updateSchema, update);
router.get('/getById/:id',  getById);
router.get('/getAll',  getAll);
router.delete('/delete/:id', _delete);

module.exports = router;


function getAll(req, res, next) {
    appointmentsService.getAll()
        .then(appointments => res.json(appointments))
        .catch(next);
}

function getById(req, res, next) {
    appointmentsService.getById(req.params.id)
        .then(appointment => appointment ? res.json(appointment) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        partialAppointments: Joi.boolean().required(),
        typeOfVisit: Joi.string().required(),
        dcId: Joi.number().required(),
        tests: Joi.array().required(),
        preferredDate: Joi.date().required(),
        preferredTime: Joi.string().regex(/^((1[0-2]|0?[1-9]):([0-5][0-9])(\s)?([APap][mM]))$/).required(),
        customerId: Joi.number().required(),
        statusId: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    appointmentsService.create(req.body)
        .then(appointment => res.json(appointment))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        partialAppointments: Joi.boolean().required(),
        typeOfVisit: Joi.string().required(),
        dcId: Joi.number().required(),
        tests: Joi.array().required(),
        customerId: Joi.number().required(),
        preferredDate: Joi.date().required(), 
        preferredTime: Joi.string().regex(/^((1[0-2]|0?[1-9]):([0-5][0-9])(\s)?([APap][mM]))$/).required(),
        statusId: Joi.number().required()
    };

    // only admins can update role
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    appointmentsService.update(req.params.id, req.body)
        .then(appointment => res.json(appointment))
        .catch(next);
}

function _delete(req, res, next) {
    appointmentsService.deleteAppointment(req.params.id)
        .then(() => res.json({ message: 'Appointment deleted successfully' }))
        .catch(next);
}
