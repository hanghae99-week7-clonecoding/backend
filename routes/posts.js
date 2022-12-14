const express = require("express");
const router = express.Router();
const sequelize = require("sequelize");
const Op = sequelize.Op;
const { Post, User, Subs } = require("../models");
const authMiddlewares = require("../middleware/auth-middleware");
const subs_middleware = require("../middleware/subs_middleware");// 오류발생으로 일단보류
const { upload } = require('../middleware/murter_s3');
const delete_s3 = require("../middleware/delete_s3");

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

//무한스크롤
router.get("/scroll/:page", async (req, res) => {

    const { page } = req.params;
    const pageSize = 12;

    if (!page) {
        res.status(400).json({ result: false, error: "페이지 입력정보 오류" });
        return
    }
    let start = 0;
    if (page <= 0) {
        page = 1;
    } else {
        start = (page - 1) * pageSize;
    }
    const totalPost = await Post.findAll();
    const count = totalPost.length;
    console.log("현재 저장된 게시물 수: ", count);
    
    try {
        const pageData = await Post.findAll({ offset: start, limit: pageSize });

        if (pageData.length === 0) {
            res.status(400).json({ result: false, message: "페이지 초과" });
            return
        } else {
            res.status(200).json({ result: true, pageData });
            return
        }
    } catch (err) {
        res.status(400).json({ result: false, error: "잘못된 요청값" });
        return
    }
});


// 게시물 조회(메인)
router.get("/", async (req, res) => {
    const posts = await Post.findAll({order: [["createdAt", "DESC"]]})
    res.status(200).json({
        result: posts.map((post) => ({
            postId: post.postId,
            title: post.title,
            category: post.category,
            discription: post.discription,
            url: post.url,
            like: post.like,
            channel: post.channel,
            userimage: post.userimage
            
        }))
    })

});

// 게시물 조회(카테고리)
router.get("/search/:category", async (req, res) => {
    const { category } = req.params;
    const posts = await Post.findAll({ where: { category }, order: [["createdAt", "DESC"]] })
    res.status(200).json({
        result: posts.map((post) => ({
            postId: post.postId,
            title: post.title,
            category: post.category,
            discription: post.discription,
            url: post.url,
            like: post.like,
            channel: post.channel,
            userimage: post.userimage
        }))
    })

});

//게시물 검색
router.get("/searchkey/:keyword", async (req, res) => {
    const { keyword } = req.params;

    const list = await Post.findAll({
        where: {
            [Op.or]: [
                {
                    title: {
                        [Op.like]: "%" + keyword + "%",
                    },
                },
                {
                    channel: {
                        [Op.like]: "%" + keyword + "%",
                    },
                },
            ],
        },
    });

    if (!list) {
        res.status(400).json({ result: false, message: "게시글이 존재하지 않습니다." });
        return
    }
    else {
        res.status(200).json({ result: list });
        return
    }

});


//  게시물 상세조회(detail페이지) 
// router.get("/:postId", async (req, res) => {
//     const { userId } = res.locals.user
//     console.log(res.locals.user)
//     console.log(userId)
//     if (userId == undefined) {
//         try {
//             const { postId } = req.params;
//             const post = await Post.findOne({
//                 where: { postId }
//             })
//             if (post === null) {
//                 res.status(400).json({ result: false, errorMessage: "해당 게시물이 존재하지 않습니다.", });
//                 return;
//             } else {
//                 res.status(200).json({
//                     result: {
//                         postId: post.postId,
//                         title: post.title,
//                         category: post.category,
//                         discription: post.discription,
//                         url: post.url,
//                         like: post.like,
//                         channel: post.channel,
//                         userimage: post.userimage,
//                         subscribe: "비구독자"
//                     }
//                 })
//             }
//         } catch (err) {
//             res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." });
//             return;
//         }

//     } else {
//         try {
//             const { postId } = req.params;
//             const post = await Post.findOne({
//                 where: { postId }
//             })
//             if (post === null) {
//                 res.status(400).json({ result: false, errorMessage: "해당 게시물이 존재하지 않습니다.", });
//                 return;
//             } else {
//                 const subs = post.channel
//                 const existsubs = await Subs.findOne({ where: { channel: subs, userId: userId } })
//                 if (existsubs) {
//                     var subscribe = "구독자"
//                 } else {
//                     var subscribe = "비구독자"
//                 }
//                 res.status(200).json({
//                     result: {
//                         postId: post.postId,
//                         title: post.title,
//                         category: post.category,
//                         discription: post.discription,
//                         url: post.url,
//                         like: post.like,
//                         channel: post.channel,
//                         userimage: post.userimage,
//                         subscribe: subscribe
//                     }
//                 })
//             }
//         } catch (err) {
//             res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." });
//             return;
//         }

//     }

// });

//게시물 조회
router.get("/:postId", async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findOne({
        where: { postId }
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
                userimage: post.userimage,
            }
        })
    }

})


//게시물 수정  
router.put("/:postId", authMiddlewares, async (req, res) => {
    try {
        const { channel } = res.locals.user
        const { postId } = req.params;
        const { title, discription, category } = req.body;

        if (title === "" || discription === "" || category === "") {
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
            })
            res.json({ result: true, message: "게시글을 수정하였습니다." })
            return
        }
    } catch (err) {
        res.status(200).json({ result: false, errorMessage: "에러가 발생하였습니다." })
    }
});

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
        }
    } catch (err) {
        res.status(400).json({ result: false, errorMessage: "에러가 발생하였습니다." })

    }
});






module.exports = router;


