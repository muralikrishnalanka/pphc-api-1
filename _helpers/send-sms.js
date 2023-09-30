const config = require('config.json');
const http = require('http');
const querystring = require('querystring');

module.exports = sendSMS;

async function sendSMS({ to, message, templateid, from = config.sms.from }) {
    const smsConfig = config.sms;
    const queryParams = {
        username: smsConfig.username,
        password: smsConfig.password,
        to: to, // Replace with your recipient numbers
        from: from,
        message: message,
        PEID: smsConfig.peid,
        templateid: templateid,
    };
    const queryString = querystring.stringify(queryParams);
    const fullUrl = `${smsConfig.url}${queryString}`;
    console.log('SMS sent fullUrl:', fullUrl);


    // Send the HTTP GET request
await http.get(fullUrl, (response) => {
    let data = '';

    response.on('data', (chunk) => {
        data += chunk;
    });

    response.on('end', () => {
        console.log('SMS sent successfully:', data);
    });
}).on('error', (error) => {
    console.error('Error sending SMS:', error.message);
});

}
