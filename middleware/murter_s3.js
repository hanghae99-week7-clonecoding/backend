const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');

const s3 = new AWS.S3({
    accessKeyId:  process.env.AWSAccessKeyId, 
    secretAccessKey:  process.env.SecretAccessKey,
    region: "ap-northeast-2"
})

const fileFilter = (req, file, callback) => {
    const ext = path.extname(file.originalname).toLocaleLowerCase();
    if (ext !== '.mp4') {errMassage ='비디오 파일 형식이 맞지 않습니다.', callback(errMassage, false);}
    else callback(null, true);
    
};

const storage = multerS3({
    s3: s3,
    acl: 'public-read-write',     //권한 설정
    bucket: process.env.BUCKET,   //s3 버킷 주소
    key: (req, file, callback) => {
        console.log(req.body)
        callback(null,  `youtube/${Date.now()}_` + file.originalname);  // 저장되는 위치 및 파일명 
    }

});
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
});

exports.upload = upload