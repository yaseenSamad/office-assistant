// controllers/team.controller.ts
// import { Request, Response } from 'express';
const { User,Team,TeamMember } = require('../models');
const {errorResponse,successResponse} = require("../utils/response")

exports.createTeam = async (req, res) => {
  try {
    const { teamName, description } = req.body;
    if (!teamName) return errorResponse(res,'Team name is required',400 );

    const team = await Team.create({ teamName, description });
    return successResponse(res, team, 'Team created successfully');
  } catch (err) {
    return errorResponse(res,'Failed to create team', 500);
  }
};

exports.addTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { members } = req.body; // [{ userId, roleInTeam }]

    if (!Array.isArray(members) || members.length === 0)
      return errorResponse(res, 400, 'Members array required');


    const team = await Team.findByPk(teamId);
    if (!team) return errorResponse(res, 404, 'Team not found');

    const userIds = members.map(m => m.userId);
    const existingUsers = await User.findAll({ where: { userId: userIds } });
    if (existingUsers.length !== members.length)
      return errorResponse(res, 400, 'Some users not found');

    const teamMembersData = members.map(m => ({
      teamId,
      userId: m.userId,
      roleInTeam: m.roleInTeam || 'Member'
    }));

    const teamMembers = await TeamMember.bulkCreate(teamMembersData);

    return successResponse(res, teamMembers, 'Members added successfully');
  } catch (err) {
    return errorResponse(res,'Failed to add team members',500);
  }
};

exports.getAllTeams = async (req, res) => {
    try {
    const teams = await Team.findAll({
      include: [
        {
          model: TeamMember,
          as: "members",
          attributes: ["teamMemberId", "roleInTeam", "joinedAt"],
        //   include: [
        //     {
        //       model: User,
        //       as: "user", // matches TeamMember.belongsTo alias
        //       attributes: [
        //         "userId",
        //         "firstName",
        //         "lastName",
        //         "username",
        //         "primaryEmail"
        //       ],
        //     },
        //   ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return successResponse(res, teams, "Teams fetched successfully");
  } catch (err) {
    console.log(err,'err')
    return errorResponse(res,"Failed to fetch teams", 500);
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: TeamMember,
          attributes: ['teamMemberId', 'roleInTeam', 'userId'],
          include: [{ model: User, attributes: ['userId', 'firstName', 'lastName', 'email'] }]
        }
      ]
    });

    if (!team) return errorResponse(res, 'Team not found',404);

    return successResponse(res, team, 'Team fetched successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch team',  500);
  }
};
