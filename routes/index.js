const express = require('express');
const nugu = require('../nugu');
const router = express.Router();

router.post('/lunch/AwnserLunchAction', nugu);

module.exports = router;