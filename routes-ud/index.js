const AWS = require("aws-sdk");
const documentClient = new AWS.DynamoDB.DocumentClient();

const tableName = "videos";

const generateUpdateQuery = (fields) => {
    let exp = {
        UpdateExpression: 'set',
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }
    Object.entries(fields).forEach(([key, item]) => {
        exp.UpdateExpression += ` #${key} = :${key},`;
        exp.ExpressionAttributeNames[`#${key}`] = key;
        exp.ExpressionAttributeValues[`:${key}`] = item
    })
    exp.UpdateExpression = exp.UpdateExpression.slice(0, -1);
    return exp
}

exports.handler = async (event) => {
    const requestMethod = event['requestContext']['httpMethod'];
    const group = event['requestContext']['authorizer']['claims']['cognito:groups'];
    
    if (group != "admins") {
        return {
            statusCode: 401,
            body: JSON.stringify({message: "Unauthorized"}),
        };
    }
    
    const body = JSON.parse(event['body']);
    
    if (requestMethod == "PATCH") {
        const updateExpression = generateUpdateQuery(body);
        
        const params = {
            TableName: tableName,
            Key: {
                id: event.pathParameters.id
            },
            ...updateExpression,
            ReturnValues:"ALL_NEW"
        };

        const data = await documentClient.update(params).promise();
        
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Attributes),
        };
        return response;
    } else {
        const params = {
            TableName: tableName,
            Key: {
                id: event.pathParameters.id
            },
            ReturnValues: "ALL_OLD"
        };

        const data = await documentClient.delete(params).promise();
        
        const response = {
            statusCode: 200,
            body: JSON.stringify(data.Attributes),
        };
        return response;
    }
};
