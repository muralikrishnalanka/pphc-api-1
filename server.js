﻿
require('rootpath')();
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

const app = express();

// Configure bodyParser and cookieParser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Allow cors requests from any origin and with credentials
const allowedOrigins = ['http://pphc.shcgroup.in', 'https://pphc.shcgroup.in'];

app.use(cors({
  origin: (origin, callback) => {
    if (origin === null || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// API routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/customer', require('./customer/customer.controller'));
app.use('/customerstatus', require('./customer/customerstatus.controller'));
app.use('/appointments', require('./appointments/appointments.controller'));
app.use('/appointmentstatus', require('./appointments/appointmentstatus.controller'));
app.use('/excel', require('./excel/excel.controller'));
app.use('/states', require('./states/states.controller'));
app.use('/labtests', require('./labtests/labtests.controller'));
app.use('/dcs', require('./dcs/dcs.controller'));
app.use('/insurer', require('./insurer/insurer.controller'));

// Swagger docs route
app.use('/api-docs', require('_helpers/swagger'));

// Global error handler
app.use(errorHandler);

// HTTP server configuration
const httpPort = 4001;
const httpServer = http.createServer(app);

// HTTPS server configuration
const httpsPort = 4000;
const httpsOptions = {
  key: fs.readFileSync('shcgroup_key/shc.key'), // Corrected file extension
  cert: fs.readFileSync('shcgroup_key/shc.crt'),
  // Add any necessary CA certificates or chain certificates here if using .p7b
  // ca: fs.readFileSync('path/to/your/ca-cert.p7b'),
  // passphrase: 'your-passphrase-if-any',
};

const httpsServer = https.createServer(httpsOptions, app);

// Start both HTTP and HTTPS servers
httpServer.listen(httpPort, () => {
  console.log(`HTTP server is running on port ${httpPort}`);
});

httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS server is running on port ${httpsPort}`);
});
