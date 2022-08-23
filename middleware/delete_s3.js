const AWS = require('aws-sdk');


module.exports = async (post) => {
    const uri = post.url.split('/').slice(-1);
    const key = 'youtube/' + decodeURI(uri);

    const s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyId,
        secretAccessKey: process.env.SecretAccessKey,
        region: "ap-northeast-2"
    })

    try {
        await s3.deleteObject({
            Bucket: process.env.BUCKET,
            Key: key
        }, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log(data, "message : 영상을 삭제하였습니다.")
            }
        }).promise()
    } catch (err) {
        res.status(400).json({ result: false, errorMessage: "delete_s3에서 에러가 발생하였습니다." })
    }

}



