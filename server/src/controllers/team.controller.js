// controllers/team.controller.ts
// import { Request, Response } from 'express';
const { User,Team,TeamMember } = require('../models');
const {errorResponse,successResponse} = require("../utils/response")

exports.createTeam = async (req, res) => {
  try {
    const { teamName, description } = req.body;
    if (!teamName) return errorResponse(res, 400, 'Team name is required');

    const team = await Team.create({ teamName, description });
    return successResponse(res, team, 'Team created successfully');
  } catch (err) {
    return errorResponse(res, 500, 'Failed to create team', err);
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
    return errorResponse(res, 500, 'Failed to add team members', err);
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        {
          model: TeamMember,
          attributes: ['teamMemberId', 'roleInTeam', 'userId'],
          include: [{ model: User, attributes: ['userId', 'firstName', 'lastName', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, teams, 'Teams fetched successfully');
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch teams', err);
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

    if (!team) return errorResponse(res, 404, 'Team not found');

    return successResponse(res, team, 'Team fetched successfully');
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch team', err);
  }
};
