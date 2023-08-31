const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const dcsService = require('./dcs.service');




// routes
router.post('/create', createSchema, create);
router.post('/update/:id', updateSchema, update);
router.get('/getById/:id',  getById);
router.get('/getAllByInsurerId/:insurerId',  getAllByInsurerId);

router.get('/getAll',  getAll);
router.delete('/delete/:id', _delete);

module.exports = router;


function getAll(req, res, next) {
    dcsService.getAll()
        .then(dcs => res.json(dcs))
        .catch(next);
}

function getById(req, res, next) {
    dcsService.getById(req.params.id)
        .then(dcs => dcs ? res.json(dcs) : res.sendStatus(404))
        .catch(next);
}

function getByCustomerId(req, res, next) {
    dcsService.getAppointmentDcsByCustomerId(req.params.id)
        .then(dcs => dcs ? res.json(dcs) : res.sendStatus(404))
        .catch(next);
}

function getAllByInsurerId(req, res, next) {
    dcsService.getAllByInsurerId(req.params.insurerId)
        .then(dcs => dcs ? res.json(dcs) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({         
        name: Joi.string().required(),
        phonenumber: Joi.string().required(),
        email: Joi.email().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        PinCode: Joi.number().required(),
        insurerId: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    dcsService.create(req.body)
        .then(labtest => res.json(labtest))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {        
        name: Joi.string().empty(''),
        phonenumber: Joi.string().empty(''),
        email: Joi.email().empty(''),
        address: Joi.string().empty(''),
        city: Joi.string().empty(''),
        state: Joi.string().empty(''),
        PinCode: Joi.number().empty('')         
    };

    // only admins can update role
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    dcsService.update(req.params.id, req.body)
        .then(labtest => res.json(labtest))
        .catch(next);
}

function _delete(req, res, next) {
    dcsService.deletedcs(req.params.id)
        .then(() => res.json({ message: 'labtest deleted successfully' }))
        .catch(next);
}
