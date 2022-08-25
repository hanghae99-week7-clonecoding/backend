const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  const token = req.headers.token;
  // const {token} = req.cookies;
  console.log("토큰 확인", token);

  if (token == 500 || !token) {
    console.log("비로그인 회원");
    res.locals.user = 1;
    next();
    return

  }
  else {

    try {
      const { userId } = jwt.verify(token, process.env.mySecretKey); // userId 는 jwt.sign(userId : user._id)의 user._id가 할당된다.
      console.log("여기까지 실행중", userId);
      User.findByPk(userId).then((user) => {
        res.locals.user = user;
        next();
      });
    } catch (error) {
      res.status(401).json({ result: false, error: "로그인이 필요합니다. 토큰 해독 실패." });

      return;
    }



  }


};