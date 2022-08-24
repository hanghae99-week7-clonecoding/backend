const express = require("express");
const router = express.Router();
const { Post, User } = require("../models");
const authMiddlewares = require("../middleware/auth-middleware");

// const {imageUploader} = require("../middleware/youtube_up");
// const { imageUploader } = require('../middleware/youtube_up');

// router.post('/test/image', imageUploader.single('file'), (req, res) => {
//     res.send('good!')
//   })

const { upload } = require('../middleware/murter_s3');
const delete_s3 = require("../middleware/delete_s3");



router.post('/test/image', upload.single('file'), async (req, res) => {
    console.log(req.file)
    const video = req.file.location;
    console.log(video)
    res.send('good!')

});


// 게시물 생성
router.post("/", authMiddlewares, upload.single('file'), async (req, res) => {
    try {

        const url = req.file.location //murter를 통해 s3업로드후 s3에 url 가져온다.
        console.log(url)
        const { channel } = res.locals.user
        const { userimage } = await User.findOne({ where: { channel: channel } })
        const { title, discription, category } = req.body
        
        
        if (title === "" || discription === "" || category === "" || url === "") {
            res.status(400).json({ result: false, errorMessage: "제목, 동영상, 카테고리, 내용을 입력해주세요.", })
            return
        }

        await Post.create({
            title, discription, category, url, channel, userimage
        })
        res.status(200).json({ result: true, message: "작성이 완료 되었습니다.", });
        
    } catch (err) {
        res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." })
        return
    }
});

// 게시물 생성 테스트
router.post("/test", authMiddlewares, upload.fields([ {name:'file'},{name:'text'}]), async (req, res) => {
    try {
        console.log(req.files)
        const url = req.files.file[0].location //murter를 통해 s3업로드후 s3에 url 가져온다.
        console.log(url)
        if(!url) {
            res.status(400).json({ result: false, errorMessage: "파일을 찾을 수 없습니다", })
            return
        }

        const { channel } = res.locals.user
        const { userimage } = await User.findOne({ where: { channel: channel } })
        const { title, discription, category } = req.body


        if (title === "" || discription === "" || category === "" || url === "") {
            res.status(400).json({ result: false, errorMessage: "제목, 동영상, 카테고리, 내용을 입력해주세요.", })
            return
        }

        await Post.create({
            title, discription, category, url, channel, userimage
        })
        res.status(200).json({ result: true, message: "작성이 완료 되었습니다.", });

    } catch (err) {
        res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." })
        return
    }
});

// 무한스크롤 페이징
router.get("/scroll/:page", async (req, res) => {

    const {page} = req.params;
    const pageSize = 12;
    
    if (!page) {
        res.status(400).json({ result: false, error: "페이지 입력정보 오류" });
        return
    }

    let start = 0;

    if (page <= 0) {
        page = 1;
    }
    else {
        start = (page - 1) * pageSize;
    }

    const totalPost = await Post.findAll();
    const count = totalPost.length;
    console.log("현재 저장된 게시물 수: ", count);

    
    try{
        const pageData = await Post.findAll({ offset: start, limit: pageSize });
        
        if (pageData.length === 0) {
            res.status(400).json({result:false, message:"페이지 초과"});
            return 
          } else {
            res.status(200).json({result:true, pageData});
            return
          }
        
    }catch (err) {
        res.status(400).json({ result: false, error: "잘못된 요청값" });
        return
    }

});


// 게시물 조회(메인)
router.get("/", async (req, res) => {
    const posts = await Post.findAll()

    res.status(200).json({
        result: posts.map((post) => ({
            postId: post.postId,
            title: post.title,
            category: post.category,
            discription: post.discription,
            url: post.url,
            like: post.like,
            channel: post.channel
        }))
    })

});

// 게시물 조회(카테고리)
router.get("/search/:category", async (req, res) => {
    const { category } = req.params;
    const posts = await Post.findAll({ where: { category } })
    res.status(200).json({
        result: posts.map((post) => ({
            postId: post.postId,
            title: post.title,
            category: post.category,
            discription: post.discription,
            url: post.url,
            like: post.like,
            channel: post.channel
        }))
    })

});


//  게시물 상세조회(detail페이지) 
router.get("/:postId", async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findOne({
            where: { postId },
            include: {
                model: User,
                attributes: ["channel", "userimage"]
            }
        })
        if (post === null) {
            res.status(400).json({ result: false, errorMessage: "해당 게시물이 존재하지 않습니다.", });
            return;
        } else {
            res.status(200).json({
                result: {
                    postId: post.postId,
                    title: post.title,
                    category: post.category,
                    discription: post.discription,
                    url: post.url,
                    like: post.like,
                    channel: post.channel,
                    userimage: post.userimage
                }
            })
        }
    } catch (err) {
        res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." });
        return;
    }
});

//게시물 수정  
router.put("/:postId", authMiddlewares, async (req, res) => {
    try {
        const { channel } = res.locals.user
        const { postId } = req.params;
        const { title, discription, category } = req.body;

        if (title === "" || discription === "" || category === "" ) {
            res.status(400).json({ result: false, errorMessage: "제목,  카테고리, 내용을 입력해주세요.", })
            return
        }
        const post = await Post.findOne({ where: { postId } })

        if (!post) {
            res.status(400).json({ result: false, errorMessage: "해당 게시물이 존재하지 않습니다.", });
            return;
        }
        if (channel !== post.channel) {
            res.status(400).json({ result: false, errorMessage: "본인글만 수정할 수 있습니다", });
            return
        } else {
            await post.update({
                title: title,
                discription: discription,
                category: category,
                url: url
            })
            res.json({ result: true, message: "게시글을 수정하였습니다." })
            return
        }
    } catch (err) {
        res.status(200).json({ result: false, errorMessage: "에러가 발생하였습니다." })
    }
})


//게시글 삭제    
router.delete("/:postId", authMiddlewares, async (req, res) => {
    try {

    const { channel } = res.locals.user
    const { postId } = req.params;
    const post = await Post.findOne({ where: { postId } })

    if (!post) {
        res.status(400).json({ result: false, errorMessage: "해당 게시물이 존재하지 않습니다.", });
        return
    }
    if (channel !== post.channel) {
        res.status(400).json({ result: false, errorMessage: "본인글만 삭제할 수 있습니다", });
        return
    } else {
        delete_s3(post)
        await post.destroy()
        res.status(200).json({
            resutl: true,
            message: "게시글을 삭제하였습니다."
        }
        )
    }} catch (err) {
        res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." })

    }
})






module.exports = router;


