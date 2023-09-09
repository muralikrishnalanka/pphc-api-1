﻿const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const appointmentstatusService = require('./appointmentstatus.service');




// routes
router.post('/create', authorize(),createSchema, create);
router.post('/update/:id', authorize(),updateSchema, update);
router.get('/getById/:id',  authorize(),getById);
router.get('/getAll',  authorize(),getAll);
router.delete('/delete/:id', authorize(),_delete);

module.exports = router;


function getAll(req, res, next) {
    appointmentstatusService.getAll()
        .then(appointmentstatus => res.json(appointmentstatus))
        .catch(next);
}

function getById(req, res, next) {
    appointmentstatusService.getById(req.params.id)
        .then(state => state ? res.json(state) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({         
        name: Joi.string().required() 
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    appointmentstatusService.create(req.body)
        .then(state => res.json(state))
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
    appointmentstatusService.update(req.params.id, req.body)
        .then(state => res.json(state))
        .catch(next);
}

function _delete(req, res, next) {
    appointmentstatusService.deleteappointmentstatus(req.params.id)
        .then(() => res.json({ message: 'State deleted successfully' }))
        .catch(next);
}
