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
router.post('/search', updateSchema, search);
router.get('/getAllByInsurerId/:insurerId', getAllByInsurerId);
router.post('/uploadFile/:id',uploadFile)
router.post('/delete', authorize(), _delete);
router.get('/getAllForQC',getAllForQC)

module.exports = router;


function getAll(req, res, next) {
  customerService.getAll()
    .then(customers => res.json(customers))
    .catch(next);
}

function getAllByInsurerId(req, res, next) {
  customerService.getAllByInsurerId(req.params.insurerId)
    .then(dcs => dcs ? res.json(dcs) : res.sendStatus(404))
    .catch(next);
}

function getAllForQC(req, res, next) {
  customerService.getAllForQC()
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
    pincode: Joi.number().optional(),
    lab_tests: Joi.array().optional(),
    statusId: Joi.number().optional(),
    comments: Joi.string().optional(),

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

// Endpoint for updating customer information
function update(req, res, next) {
  console.log("request", JSON.stringify(req.params));

  // TODO: Add authorization logic using req.user

  customerService.update(req.params.id, req.body)
    .then(function (customer) {
      // TODO: Uncomment or remove this code block as needed
      // if (req.params.lab_tests){
      //     const labstests = req.params.lab_tests.map(m => ({
      //         customerId : customer.id ,
      //         lab_testsId: m 
      //     }));
      // }

      res.status(201).json(customer);
    })
    .catch(next);
}

// Endpoint for uploading files
function uploadFile(req, res, next) {
  const customerId = req.params.id;
  const customerDir = path.join(__dirname, 'uploads', customerId);
  fs.mkdirSync(customerDir, { recursive: true });

  // Get the latest version number by scanning the customer directory and finding the highest numbered file name
  const latestVersion = fs.readdirSync(customerDir)
    .map(fileName => fileName.match(/_v(\d+)\.\w+$/))
    .filter(match => match !== null)
    .map(match => parseInt(match[1]))
    .reduce((acc, val) => Math.max(acc, val), 0);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, customerDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const fileName = customerId + '_v' + (latestVersion + 1) + ext; // Increment the version number
      cb(null, fileName);
    }
  });
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
      console.log("mimetype "+file.mimetype)
      const allowedMimes = ['application/x-zip-compressed', 'application/zip'];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type. Only PDF or ZIP files are allowed.'));
      }
    }
  }).single('file');
  upload(req, res, function (err) {
    if (err) {
      console.log('error: '+err.message)
      res.status(500).send('Error uploading file');
    } else {
      const filePath = path.join(customerDir, req.file.filename);
      customerService.update(customerId, { labtests_filePath: filePath,statusId: 6 })        

      // Create a new entry in the customerfiles table for the uploaded file
      customerService.createFileHistory({
        customerId: customerId,
        version: latestVersion + 1,
        path: filePath
      }).then(function () {
          res.status(201).json({ message: 'File uploaded successfully' });
        })
        .catch(next);
    }
  });
}


// Endpoint for deleting customer information
function _delete(req, res, next) {
  // if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
  //     return res.status(401).json({ message: 'Unauthorized' });
  // }

  customerService.delete(req.params.id)
    .then(() => res.json({ message: 'Customer deleted successfully' }))
    .catch(next);
}


function search(req, res, next) {
 // console.log("request " + JSON.stringify(req.body))
  customerService.search(req.body.searchParams, req.body.page, req.body.limit)
    .then(customers => res.json(customers))
    .catch(next);
}


