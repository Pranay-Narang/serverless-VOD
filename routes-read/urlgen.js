const AWS = require('aws-sdk');

const generator = async (object, subObject) => {
    const cloudfrontAccessKeyId = process.env.KEYPAIR_ID;
    const cloudFrontPrivateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
    const signer = new AWS.CloudFront.Signer(cloudfrontAccessKeyId, cloudFrontPrivateKey);

    // 2 days as milliseconds to use for link expiration
    const twoDays = 2*24*60*60*1000;

    const values = object[subObject];
    
    return { name: values.split('\\').pop().split('/').pop(), link: signer.getSignedUrl({
        url: 'https://' + process.env.CLOUDFRONT_URL + '/' + values,
        expires: Math.floor((Date.now() + twoDays)/1000), // Unix UTC timestamp for now + 2 days
    })};
};

module.exports = generator;