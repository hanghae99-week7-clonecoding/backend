const express = require("express");
const router = express.Router();
const commentsRouter = require("./comments")
const postsRouter = require("./posts");





const usersRouter = require("./users");
// const likesRouter = require("./likes");


router.use("/user", usersRouter);
// router.use("/like", likesRouter);
router.use("/comment", commentsRouter);

router.use("/post", postsRouter);

module.exports = router;