// controllers/team.controller.ts
// import { Request, Response } from 'express';
const { User,Team,TeamMember } = require('../models');
const {errorResponse,successResponse} = require("../utils/response")

exports.createTeam = async (req, res) => {
  try {
    const { teamName, description } = req.body;
    if (!teamName) return errorResponse(res, 'Team name is required', 400);

    const team = await Team.create({ teamName, description });
    return successResponse(res, 'Team created successfully', team);
  } catch (err) {
    console.error('Create team error:', err);
    return errorResponse(res, 'Failed to create team', 500);
  }
};

exports.addTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { members } = req.body; // [{ userId, roleInTeam }]

    if (!Array.isArray(members) || members.length === 0)
      return errorResponse(res, 'Members array required', 400);


    const team = await Team.findByPk(teamId);
    if (!team) return errorResponse(res, 'Team not found', 404);

    const userIds = members.map(m => m.userId);
    const existingUsers = await User.findAll({ where: { userId: userIds } });
    if (existingUsers.length !== members.length)
      return errorResponse(res, 'Some users not found', 400);

    // Check for existing team members
    const existingMembers = await TeamMember.findAll({
      where: {
        teamId,
        userId: userIds
      }
    });

    if (existingMembers.length > 0) {
      return errorResponse(res, 'Some users are already members of this team', 400);
    }
    const teamMembersData = members.map(m => ({
      teamId,
      userId: m.userId,
      roleInTeam: m.roleInTeam || 'Member'
    }));

    const teamMembers = await TeamMember.bulkCreate(teamMembersData);

    return successResponse(res, 'Members added successfully', teamMembers);
  } catch (err) {
    console.error('Add team members error:', err);
    return errorResponse(res, 'Failed to add team members', 500);
  }
};

exports.getAllTeams = async (req, res) => {
    try {
    const teams = await Team.findAll({
      include: [
        {
          model: TeamMember,
          as: "members",
          attributes: ["teamMemberId", "userId", "roleInTeam", "joinedAt"],
          include: [
            {
              model: User,
              attributes: [
                "userId",
                "firstName",
                "lastName",
                "username",
                "primaryEmail",
                "designation"
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return successResponse(res, "Teams fetched successfully", teams);
  } catch (err) {
    console.error('Get teams error:', err);
    return errorResponse(res, "Failed to fetch teams", 500);
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findByPk(teamId, {
      include: [
        {
          model: TeamMember,
          as: "members",
          attributes: ['teamMemberId', 'userId', 'roleInTeam', 'joinedAt'],
          include: [
            { 
              model: User, 
              attributes: [
                'userId', 
                'firstName', 
                'lastName', 
                'primaryEmail',
                'designation'
              ] 
            }
          ]
        }
      ]
    });

    if (!team) return errorResponse(res, 'Team not found', 404);

    return successResponse(res, 'Team fetched successfully', team);
  } catch (err) {
    console.error('Get team by ID error:', err);
    return errorResponse(res, 'Failed to fetch team', 500);
  }
};
