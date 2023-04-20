const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const Customer = require('../customer/customer.model');
const db = require('_helpers/db');

// Set up the Multer storage engine
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function uploadExcel(req, res) {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(400).json({ message: 'Error uploading file' });
        }
        const file = req.file.buffer;
        const workbook = xlsx.read(file, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(worksheet);

        // Check for required columns here, e.g.
        if (!rows.some(row => row['CustomerName'])) {
            return res.status(400).json({ message: 'Missing required column "Customer Name"' });
        }

        const customers = rows.map(row => {
            return {
                insurance_provider: row['InsuranceProvider'],
                policy_no: row['PolicyId'],
                member_id: row['MemberId'],
                agent_name: row['AgentName'],
                agent_code: row['AgentCode'],
                agent_no: row['Agent No'],
                name: row['CustomerName'],
                gender: row['Gender'],
                dob: row['DOB'],
                phone: row['CustomerNo'],
                address: row['Address'],
                stateId: row['State'],
                city: row['City'],
                pincode: row['Pincode'],
                labTest: row['LabTest'],
                statusId: row['Status'],
            };
        });

        db.Customer.bulkCreate(customers)
    .then(() => {
        res.status(200);
        res.end(JSON.stringify({ result: 'Customers uploaded successfully' }));
    })
    .catch(error => {
        console.error('Error uploading customers:', error);
        res.status(500);
        res.end(JSON.stringify({ message: 'Internal server error' }));
    });

    });
}

module.exports = { uploadExcel };
