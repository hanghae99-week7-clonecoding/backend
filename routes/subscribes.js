const express = require("express");
const router = express.Router();
const { User, Subs, Post } = require("../models");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/:postId", authMiddleware, async(req, res) => {
  try {        
    const { channel } = res.locals.user;    
    const { postId }  = req.params;    
    
    const data = await Post.findOne({ where: { postId } });        
    const target = data.channel    
    const userdata = await User.findOne({ where: { channel: target } }); 
    const userId = userdata.userId           

    const postToSubcribe = await Subs.findOne({ where: { channel,userId } });     
      if(!postToSubcribe){
        await User.update({ subscribe: postToSubcribe +1 }, { where: { channel,userId } });
        await Subs.create({ channel,userId });             
        return res.status(200).json({ message: "구독이 추가되었습니다.", result:"구독자" });
      }else{
        await User.update({ subscribe: postToSubcribe -1 }, { where: { channel,userId } });
        await Subs.destroy({ where: { channel:channel, userId:userId } });             
        return res.status(200).json({ message: "구독정보가 삭제되었습니다.", result:"비구독자" });
      } 
  }catch(error){
  const message = `${req.method} ${req.originalUrl} : ${error.message}`;
  console.log(message);
  res.status(400).json({ message });
  }
});
module.exports = router;