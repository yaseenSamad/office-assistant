// routes/team.routes.ts
const express = require("express");
const router = express.Router();
const teamController = require('../controllers/team.controller')


router.get('/',teamController.getAllTeams)
router.get('/:teamId',teamController.getTeamById)
router.post('/', teamController.createTeam);
router.post('/:teamId/members', teamController.addTeamMembers);

module.exports = router;
