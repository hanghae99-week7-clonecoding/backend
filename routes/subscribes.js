const express = require("express");
const router = express.Router();
const { User, Subscribe } = require("../models");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/", authMiddleware, async(req, res) => {
  try {        
    const { user } = await res.locals;
    const channel = user.channel;
    const userId = user.userId

    const subscribeUser = await User.findOne({ where: { channel, userId } });    
    if(!subscribeUser) {
      return res.json({ message: "채널을 구독하려면 로그인 해주세요." });
    }

    const postToSubcribe = await Subscribe.findOne({ where: { channel } });         
      if(!postToSubcribe){
        await User.update({ subscribe: postToSubcribe +1 }, { where: { channel } });
        await Subscribe.create({ channel });             
        return res.status(200).json({ message: "구독이 추가되었습니다." })
      }else{
        await User.update({ subscribe: postToSubcribe -1 }, { where: { channel } });
        await Subscribe.destroy({ where: { channel:channel } });             
        return res.status(200).json({ message: "구독정보가 삭제되었습니다." })        
      }      
  }catch(error){
  const message = `${req.method} ${req.originalUrl} : ${error.message}`;
  console.log(message);
  res.status(400).json({ message });
  }
});
module.exports = router;