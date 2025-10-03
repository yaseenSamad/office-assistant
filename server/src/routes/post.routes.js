// routes/post.routes.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

// Posts
router.post("/", postController.createPost);
router.get("/:userId", postController.getPosts);
router.get("/:id", postController.getPostById);
router.patch("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);

// Likes
router.post("/like", postController.toggleLike);

// Comments
router.post("/comment", postController.addComment);
router.get("/:postId/comments", postController.getComments);
router.delete("/comment/:id", postController.deleteComment);

module.exports = router;
