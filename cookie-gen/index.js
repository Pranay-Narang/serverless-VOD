const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const cloudfrontAccessKeyId = process.env.KEYPAIR_ID;
    const cloudFrontPrivateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
    const signer = new AWS.CloudFront.Signer(cloudfrontAccessKeyId, cloudFrontPrivateKey);

    // 2 days as milliseconds to use for link expiration
    const twoDays = 2*24*60*60*1000;
    
    const policy = JSON.stringify({
    Statement: [
        {
            Resource: `https://${process.env.CLOUDFRONT_URL}/assets/*`,
            Condition: {
                DateLessThan: {
                    "AWS:EpochTime": Math.floor((Date.now() + twoDays)/1000)
                }
            }
        }
    ]});

    var keys = signer.getSignedCookie({policy: policy});
        
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(keys),
    };
    return response;
};