const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');

router.get('/', policyController.getPolicies);
router.post("/", upload.single("document"), policyController.createPolicy);
router.delete("/:policyId", policyController.deletePolicy);

module.exports = router;
