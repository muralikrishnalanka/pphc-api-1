const CircularJSON = require('circular-json');

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            try {
                const circularObject = req;
                circularObject.test = circularObject;
                const stringifiedObject = CircularJSON.stringify(circularObject);
            //    console.log("objects###"+stringifiedObject);
              } catch (err) {
                console.error('Error while attempting to stringify object:', err);
              }
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized ' +err.message });
        default:
            return res.status(500).json({ message: err.message });
    }
}