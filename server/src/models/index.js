const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Import models
const User = require("./user.model")(sequelize, DataTypes);
const Team = require("./team.model")(sequelize, DataTypes);
const TeamMember = require("./tmembers.model")(sequelize, DataTypes);
const Policy = require("./policy.model")(sequelize, DataTypes)
const Holiday = require("./holiday.model")(sequelize, DataTypes)
const Post = require("./post.model")(sequelize, DataTypes);
const Like = require("./like.model")(sequelize, DataTypes);
const Comment = require("./comment.model")(sequelize, DataTypes);

// Associations
// User -> Reporter (self-reference)
User.belongsTo(User, { as: "reporterUser", foreignKey: "reporter" });

// Team -> TeamMember (1:M)
Team.hasMany(TeamMember, { as: "members", foreignKey: "teamId", onDelete: "CASCADE" });
TeamMember.belongsTo(Team, { foreignKey: "teamId" });

// User -> TeamMember (1:M)
User.hasMany(TeamMember, { as: "teamRoles", foreignKey: "userId", onDelete: "CASCADE" });
TeamMember.belongsTo(User, { foreignKey: "userId" });

// User -> Policy (1:M)
User.hasMany(Policy, { as: "updatedPolicies", foreignKey: "updatedBy" });
Policy.belongsTo(User, { as: "updater", foreignKey: "updatedBy" });


User.hasMany(Post, { foreignKey: "authorId", as: "posts" });
Post.belongsTo(User, { foreignKey: "authorId", as: "author" });

// Post ↔ Like
Post.hasMany(Like, { foreignKey: "postId", as: "likes" });
Like.belongsTo(Post, { foreignKey: "postId" });
User.hasMany(Like, { foreignKey: "userId", as: "userLikes" });
Like.belongsTo(User, { foreignKey: "userId", as: "user" });

// Post ↔ Comment
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId" });
// User.hasMany(Comment, { foreignKey: "userId", as: "userComments" });
// Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// User ↔ Comment
User.hasMany(Comment, { foreignKey: "userId", as: "userComments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" }); // use "author" to match API


module.exports = { sequelize,User,Team,TeamMember,Policy,Holiday,Post,Like,Comment  };
