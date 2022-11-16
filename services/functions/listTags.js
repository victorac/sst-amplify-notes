import handler from "../util/handler";
import dynamoDb from "../util/dynamodb";

export const main = handler(async (event) => {
    const params = {
        TableName: process.env.TAG_TABLE_NAME,
        KeyConditionExpression: "userId = :userId AND noteId = :noteId",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.authorizer.iam.cognitoIdentity.identityId,
            ":noteId": event.pathParameters.id,
        },
    };

    const result = await dynamoDb.query(params);

    return result.Items;
});