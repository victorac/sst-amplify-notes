import handler from "../util/handler";
import dynamoDb from "../util/dynamodb";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body).updateData;
    const updateValues = {};
    const updateExpressionArray = []; 
    for (let index = 0; index < Object.keys(data).length; index++) {
        const key = Object.keys(data)[index];
        updateValues[`:${key}`] = data[key];
        updateExpressionArray.push(`SET ${key} = :${key}`);
    }
    const updateExpression = updateExpressionArray.join(", ");
    const params = {
        TableName: process.env.ENTRY_TABLE_NAME,
        Key: {
            userId: event.requestContext.authorizer.iam.cognitoIdentity.identityId,
            noteId: event.pathParameters.id,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: updateValues,
        ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(params);

    return { status: true };
});