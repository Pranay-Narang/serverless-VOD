const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const tableName = "blahaj-videos";

exports.handler = async (event) => {
    console.log("assetID: ", event.detail.userMetadata.assetID);
    console.log("outputGroupDetails: ", JSON.stringify(event.detail.outputGroupDetails));

    var storeObj = {
        id: event.detail.userMetadata.assetID,
        duration: event.detail.outputGroupDetails[0].outputDetails[0].durationInMs / 60000,
        thumbnails: [],
        name: "",
        description: "",
    };

    event.detail.outputGroupDetails[0].outputDetails.map((res) => {
        storeObj["assets"][res.videoDetails.heightInPx] = res.outputFilePaths[0].replace("s3://blahaj-videos-hls/", "")
    })

    event.detail.outputGroupDetails[1].outputDetails.map((res) => {
        storeObj.thumbnails.push(res.outputFilePaths[0].replace("s3://blahaj-videos-hls/", ""))
    })

    console.log("storeObj: ", storeObj)

    const params = {
        TableName: tableName,
        Item: storeObj
    };

    const data = await documentClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify('Executed'),
    };
    return response;
};