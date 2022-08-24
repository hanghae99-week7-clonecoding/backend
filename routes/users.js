const express = require("express");
const router = express.Router();
const { User } = require("../models");
const jwt = require("jsonwebtoken");

const { img_up } = require('../middleware/user_image');


router.post("/signup", img_up.single('img'), async (req, res) => {
    const { email, channel, password, confirmPassword } = req.body;
    const regPassword = /^[A-Za-z0-9]{6,20}$/;
    const regChannel = /^[A-Za-z가-힣0-9]{2,15}$/;
    const regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

    const userimage = req.file.location //murter를 통해 s3업로드후 s3에 url 가져온다.
    console.log(userimage)

    if (password !== confirmPassword) {
        res.status(400).json({ result: false, error: "비밀번호가 일치하지 않습니다." });
        return;
    }

    const checkUser1 = await User.findOne({ where: { email } });

    if (checkUser1) {
        res.status(400).json({ result: false, error: "이미 등록된 이메일입니다." });
        return;
    }

    const checkUser2 = await User.findOne({ where: { channel } });

    if (checkUser2) {
        res.status(400).json({ result: false, error: "이디 사용중인 채널명입니다." });
        return;
    }

    if (!regEmail.test(email)) {
        res.status(400).json({ result: false, error: "이메일 정보를 확인해주세요." });
        return;
    }

    if (!regPassword.test(password)) {
        res.status(400).json({ result: false, error: "비밀번호를 확인해주세요." });
        return;
    }

    if (!regChannel.test(channel)) {
        res.status(400).json({ result: false, error: "채널명을 확인해주세요." });
        return;
    }
    


    await User.create({ channel, email, password, userimage });
    res.status(200).json({ result: true, message: "새로운 유저 정보가 등록되었습니다" });

});

router.post("/check_id", async (req, res) => {
    const { email } = req.body;
    const regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
    const findUser = await User.findOne({ where: { email } });

    if (!regEmail.test(email)) {
        res.status(400).json({ result: false, error: "잘못된 이메일 정보." });
        return;
    }

    if (!findUser) {
        res.status(200).json({ result: true, message: "신규가입" });
    }
    else {
        res.status(400).json({ result: false, message: "중복 가입" });
    }
});

router.post("/check_channel", async (req, res) => {
    const { channel } = req.body;
    const regChannel = /^[A-Za-z가-힣0-9]{2,20}$/;
    const findUser = await User.findOne({ where: { channel } });

    if (!regChannel.test(channel)) {
        res.status(400).json({ result: false, error: "채널명 양식 위반." });
        return;
    }

    
    if (!findUser) {
        res.status(200).json({ result: true, message: "사용 가능한 채널명" });
    }
    else {
        res.status(400).json({ result: false, message: "중복된 채널명" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
        
    if (req.cookies.token) {
        res.status(401).json({ result: false, error: "이미 로그인이 되어있습니다" });
        return;
    }

    const user = await User.findOne({ where: { email, password } });

    if (!user) {
        res.status(400).json({ result: false, error: "입력한 정보를 확인해주세요." });
        return;
    }

    const token = jwt.sign({ userId: user.userId }, process.env.mySecretKey);
    res.cookie("token", token);

    const payload = {
        result: true,
        token: token,
        email: user.email,
        channel: user.channel
    };

    res.status(200).json(payload);

});

router.post("/logout", async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ result: true, message: "로그아웃" });
        // res.redirect("/");
        
    } catch (error) {
        res.status(400).json({ result: false, error: "네트워크 에러" });
    }
});

module.exports = router;