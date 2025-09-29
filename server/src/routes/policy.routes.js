const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');
const policyUpload = require('../middleware/upload')

router.get('/', policyController.getPolicies);
router.post("/", policyUpload.single("document"), policyController.createPolicy);
router.delete("/:policyId", policyController.deletePolicy);

module.exports = router;
