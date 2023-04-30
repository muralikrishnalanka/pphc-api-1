const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const customerService = require('./customer.service');
//const appointments = require('../appointments/appointments.model');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// routes
router.post('/create', createSchema, create);
router.put('/:id', updateSchema, update);
//router.post('/update',updateSchema,update);
router.get('/getById/:id', getById);
router.get('/getAll', getAll);
router.post('/delete', authorize(), _delete);


module.exports = router;


function getAll(req, res, next) {
  console.log('req' + JSON.stringify(req))
  customerService.getAll()
    .then(customers => res.json(customers))
    .catch(next);
}

function getById(req, res, next) {
  // users can get their own account and admins can get any account
  // if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
  //     return res.status(401).json({ message: 'Unauthorized' });
  // }

  customerService.getById(req.params.id)
    .then(customer => customer ? res.json(customer) : res.sendStatus(404))
    .catch(next);
}

function createSchema(req, res, next) {
  const schema = Joi.object({
    insurance_provider: Joi.number().required(),
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
    stateId: Joi.number().required(),
    city: Joi.string().required(),
    pincode: Joi.string().required(),
    lab_tests: Joi.array().required(),
    statusId: Joi.number().required()
  });
  validateRequest(req, next, schema);
}

function create(req, res, next) {
  const labtestsReq = req.params.lab_tests
  customerService.create(req.body)
    .then(customer => {


      return res.json(customer)
    })
    .catch(next);
}


function updateSchema(req, res, next) {
  const schemaRules = {
    insurance_provider: Joi.number().optional(),
    policy_no: Joi.string().optional(),
    member_id: Joi.string().optional(),
    agent_name: Joi.string().optional(),
    agent_code: Joi.string().optional(),
    agent_no: Joi.string().optional(),
    name: Joi.string().optional(),
    gender: Joi.string().optional(),
    dob: Joi.date().optional(), // include time part of value
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    stateId: Joi.number().optional(),
    city: Joi.string().optional(),
    pincode: Joi.string().optional(),
    lab_tests: Joi.array().optional(),
    statusId: Joi.number().optional(),
     // Add the file input field to the schema
  file: Joi.object({
    size: Joi.number().max(10000000000), // Set optional limit for file size (in bytes)
    type: Joi.string().valid('application/zip'), // Allow only certain MIME types
    buffer: Joi.binary().encoding('base64') // Save the file data as a Buffer
  }).optional()
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
    .then(function (customer) {
      // if(req.params.lab_tests){
      //     const labstests = req.params.lab_tests.map(m=>{
      //         return {customerId : customer.id ,lab_testsId: m }
      //     }) 
      // }
      console.log('files'+req.file)
      if (req.file) {
        // If a file was uploaded, save it to the file system and set the file path field for the customer
        uploadFile(req.file, function (err) {
          if (err) {
            res.status(500).send('Error uploading file');
          } else {
            res.status(201).send('Customer updated with file upload');
          }
        });
      } else {
        res.status(201).send('Customer updated');
      }
      return res.json(customer)
    })
    .catch(next);
}

function _delete(req, res, next) {
  // if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
  //     return res.status(401).json({ message: 'Unauthorized' });
  // }

  customerService.delete(req.params.id)
    .then(() => res.json({ message: 'Customer deleted successfully' }))
    .catch(next);
}

function uploadFile(file, callback) {
  const customerId = this._id; // Get the customer ID
  const customerDir = path.join(__dirname, 'uploads', customerId); // Create a directory for the customer
  fs.mkdirSync(customerDir, { recursive: true }); // Ensure the directory exists
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, customerDir); // Set the upload destination to the customer directory
    },
    filename: function (req, file, cb) {
      const fileName = customerId + '_' + file.originalname; // Add the customer ID as a prefix to the file name
      cb(null, fileName);
    }
  });
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
      const allowedMimes = ['application/pdf', 'application/zip']; // Define allowed mimetypes
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true); // Allow file upload
      } else {
        callback(new Error('Invalid file type. Only PDF or ZIP files are allowed.')); // Reject file upload
      }
    }
  }).single('file');
  upload(file, function (err) {
    if (err) {
      callback(err);
    } else {
      // Set the file path field for the customer
      const filePath = path.join(customerDir, file.filename);
      this.labtests_filePath = filePath;
      this.save().then(() => {
        callback(null);
      }).catch(err => {
        callback(err);
      });
    }
  }.bind(this));
};

