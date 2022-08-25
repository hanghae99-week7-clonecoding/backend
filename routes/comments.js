const express = require("express");
const router = express.Router();

const { Comment } = require("../models");
const { Post } = require("../models");
const { User } = require("../models");

const authMiddleware = require("../middleware/auth-middleware");

//댓글 작성 post('/comments/postId')
router.post("/:postId", authMiddleware, async (req, res) => {
  try{
  const { postId } = req.params;
  const { comment } = req.body;

  if(!comment){
    return res.json({ message: "댓글 내용을 입력해주세요." });
  }
  const posts = await Post.findOne({where:{ postId } });
  if(!posts) {
    return res.json({ message: "해당 게시글이 없습니다." });
  }
  const { user } = res.locals;
  
  await Comment.create({ 
    postId,
    user: user.userId,
    channel: user.channel,
    userimage: user.userimage,
    comment,
  });
  res.status(201).json({
  ok: true,
  message: "댓글을 생성하였습니다."});
  }catch (error){
  const message = `${req.method} ${req.originalUrl} : ${error.message}`;
  console.log(message);
  res.status(400).json({ message });
  }
  });

//댓글 목록 조회 with get ('/comment/postId')
router.get("/:postId", async (req, res) => {
  try {
    const {postId} = req.params;

    const posts = await Post.findAll({
      where: {postId},
      order:[["createdAt", "DESC"]]
    });
    if(!posts.length){
      return res.json({ message: "해당 게시글이 없습니다." });
    }
    const allCommentInfo = await Comment.findAll({
      where:{ postId },
      order: [["createdAt", "DESC"]],
    });
    const data = [];

    for (let i =0; i<allCommentInfo.length; i++){
      data.push({
        commentId: allCommentInfo[i].commentId,
        userId: allCommentInfo[i].userId,
        channel: allCommentInfo[i].channel,
        userimage:allCommentInfo[i].userimage,
        comment: allCommentInfo[i].comment,
        createdAt: allCommentInfo[i].createdAt,
        updatedAt: allCommentInfo[i].updatedAt,
      });
    }
    res.json({ data: data });    
  }catch(error) {
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }  
});
//댓글 수정 api with put ('/comment/commentId')
router.put("/:commentId", authMiddleware, async(req, res) => {
  try{
    const { commentId } = req.params;

    const { comment } = req.body;

    const comments = await Comment.findOne({ where: { commentId } });

    if(!comments) {
      return res.json({ message: "해당 댓글이 없습니다."});
    }
    if( !comment ){
      return res.json({ message: "댓글 내용을 입력해주세요." })
    }
    //로그인한 유저가 댓글 작성자가 아니면 수정을 못함
    const { user } = await res.locals;
    if( user.channel != comments.channel ) {
      return res.json({ message: "수정 권한이 없습니다."});
    }
    await Comment.update({ comment }, { where: {commentId} });
    res.json({message: "댓글을 수정하였습니다."});
  }catch(error){
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});
//댓글 삭제 api with delete ('/comment/commentId')
router.delete("/:commentId", authMiddleware, async(req, res) => {
  try{
    const {commentId} = req.params;

    const comments = await Comment.findOne({ where: { commentId } });

    if(!comments){
      return res.json({ message: " 해당 댓글이 없습니다." });
    }
    //로그인한 유저가 댓글 작성자가 아니면 삭제를 못함
    const { user } = await res.locals;

    if(user.channel != comments.channel){
      return res.json({message: "삭제 권한이 없습니다."});
    }else {
      await Comment.destroy({ where: { commentId } });
      return res.json({message: "댓글을 삭제하였습니다."});
    }
  }catch(error){
    const message = `${req.method} ${req.originalUrl} : ${error.message}`;
    console.log(message);
    res.status(400).json({ message });
  }
});
module.exports = router;