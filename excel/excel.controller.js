const router = require('express').Router();
const { uploadExcel } = require('./excel.service');

router.post('/upload', async (req, res) => {
    try {
        const result = await uploadExcel(req, res);
        return res.json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
