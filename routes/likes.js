const express = require("express");
const router = express.Router();

const { Post } = require("../models");
// const { Comment } = require("../models");
const { like } = require("../models");
const { User } = require("../models");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/:postId", authMiddleware, async (req, res) => {
  try{    
    const { postId } = req.params;
    const { user } = await res.locals;
    const channel = user.channel;

    const posts = await Post.findOne({ where: { postId } });
    if(!posts){
      return res.json({ message: "게시글이 존재하지 않습니다."});
    }else{
      const postToLike = posts.like;      
      const likedPost = await like.findOne({ where: { postId, channel } });

      if (!likedPost) {
        await Post.update({ like: postToLike +1 }, { where: { postId } });
        await like.create({ channel, postId });
        return res.status(200).json({ message:"이 동영상이 마음에 듭니다." });
      } else {
        await Post.update({ like: postToLike -1 }, { where: { postId }});
        await like.destroy({ where: { channel:channel, postId:postId } });
        return res.status(200).json({ message: "좋아요 취소!" });
      }
    }       
  }catch(error){
  const message = `${req.method} ${req.originalUrl} : ${error.message}`;
  console.log(message);
  res.status(400).json({ message });
  }
});
module.exports = router;

//좋아요한 게시물 조회('/post/like)
// router.get("/like",authMiddleware, async(req, res) => {
//   try {
//     const { user } = await res.locals;
//     const postsUserLikded = await User.findOne({ where: { userId:user.userId } });
//   } catch(error){
//     return res.status(400).json({
//       ok: false,
//       errorMessage: "조회가 실패하였습니다."
//     });
//   }
// });
