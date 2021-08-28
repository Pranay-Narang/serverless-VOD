const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const tableName = "blahaj-videos";
var data = [];

exports.handler = async(event) => {
    if (event.pathParameters) {
        const params = {
            TableName: tableName,
            KeyConditionExpression: 'id = :hashKey',
            ExpressionAttributeValues: {
                ':hashKey': event.pathParameters.id,
            }
        };

        data = await documentClient.query(params).promise();
    }
    else {
        const params = {
            TableName: tableName,
        };

        data = await documentClient.scan(params).promise();
        data.Items.forEach((elem) => {
            if (elem.thumbnails instanceof Array) {
                elem.thumbnails = elem.thumbnails[0];
            }

            if (elem.assets instanceof Object) {
                elem.assets["360"] = { S: elem.assets["360"] }
                elem.assets["540"] = { S: elem.assets["540"] }
                elem.assets["720"] = { S: elem.assets["720"] }
            }
            else {
                elem.assets = JSON.parse(elem.assets)
            }

        });
    }

    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data.Items),
    };

    return response;
};