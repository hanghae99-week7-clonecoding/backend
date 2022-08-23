const multer = require('multer');
const multerS3 = require('multer-s3');
const moment = require('moment');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId:  process.env.AWSAccessKeyId, 
    secretAccessKey:  process.env.SecretAccessKey,
    region: "ap-northeast-2"
})

const storage = multerS3({
    s3: s3,
    acl: 'public-read-write',     //권한 설정
    bucket: process.env.BUCKET,   //s3 버킷 주소
    key: (req, file, callback) => {
        console.log(req.body)
        // let datetime = moment().format('YYYYMMDDHHmmss');
        // `youtube/${Date.now()}`
        callback(null,  `youtube/${Date.now()}_` + file.originalname);  // 저장되는 위치 및 파일명 
    }
});

const upload = multer({ storage: storage });

exports.upload = upload