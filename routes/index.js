const express = require("express");
const router = express.Router();



const usersRouter = require("./users");
const postsRouter = require("./posts");
const commentsRouter = require("./comments")
const likesRouter = require("./likes");


router.use("/user", usersRouter);
router.use("/post", postsRouter);
router.use("/comment", commentsRouter);
router.use("/like", likesRouter);


module.exports = router;