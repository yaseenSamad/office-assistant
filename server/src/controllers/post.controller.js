// controllers/post.controller.js
const { Post, User,Like,Comment } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

exports.createPost = async (req, res) => {
  try {
    const {  content, authorId } = req.body;

    const post = await Post.create({  content, authorId });
    return successResponse(res, "Post created", post);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create post", 500);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const {userId} = req.params
    const posts = await Post.findAll({
      include: [
        // Author info
        {
          model: User,
          as: "author",
          attributes: ["userId", "firstName", "lastName","role"],
        },
        // Likes info
        {
          model: Like,
          as: "likes",
          attributes: ["likeId", "userId"], // You can count length later
        },
        // Comments with commenter info
        {
          model: Comment,
          as: "comments",
          attributes: ["commentId", "content", "createdAt"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["userId", "firstName", "lastName"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform posts to include likes count and commenter names
    const formattedPosts = posts.map((post) => {
      return {
        id: post.postId,
        content: post.content,
        createdAt: post.createdAt,
        authorId: post.author.userId,
        authorName: `${post.author.firstName} ${post.author.lastName}`,
        likes: post.likes.length,
        likedByMe: false, // Optionally compute based on current user
        authorRole: post.author.role,
        comments: post.comments.map((c) => ({
          commentId: c.commentId,
          content: c.content,
          timestamp: c.createdAt,
          authorId: c.author.userId,
          authorName: `${c.author.firstName} ${c.author.lastName}`,
        })),
      };
    });
    return successResponse(res, "Posts fetched", formattedPosts);
    // return res.status(200).json({ success: true, message: "Posts fetched", data: formattedPosts });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch posts", 500);
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: "author", attributes: ["userId", "firstName", "lastName"] }],
    });
    if (!post) return errorResponse(res, "Post not found", 404);
    return successResponse(res, "Post fetched", post);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch post", 500);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const {  content } = req.body;
    const [updated] = await Post.update({  content }, { where: { postId: req.params.id } });
    if (!updated) return errorResponse(res, "Post not found", 404);
    return successResponse(res, "Post updated");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to update post", 500);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const deleted = await Post.destroy({ where: { postId: req.params.id } });
    if (!deleted) return errorResponse(res, "Post not found", 404);
    return successResponse(res, "Post deleted");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to delete post", 500);
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { postId, userId } = req.body;

    const existingLike = await Like.findOne({ where: { postId, userId } });
    if (existingLike) {
      await existingLike.destroy();
      return successResponse(res, "LIKE_REMOVED");
    }

    const like = await Like.create({ postId, userId });
    return successResponse(res, "LIKE_ADDED", like);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to like/unlike post", 500);
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId, userId, content } = req.body;
    const comment = await Comment.create({ postId, userId, content });
    return successResponse(res, "Comment added", comment);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to add comment", 500);
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.findAll({
      where: { postId },
      include: [{ model: User, as: "user", attributes: ["userId", "firstName", "lastName"] }],
      order: [["createdAt", "ASC"]],
    });
    return successResponse(res, "Comments fetched", comments);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch comments", 500);
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comment.destroy({ where: { commentId: id } });
    if (!deleted) return errorResponse(res, "Comment not found", 404);
    return successResponse(res, "Comment deleted");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to delete comment", 500);
  }
};