import handler from "../util/handler";
import dynamoDb from "../util/dynamodb";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body);
    let updateExpression = "";
    let updateValues = {};
    if (data.content){
        updateExpression += "SET content = :content"
        updateValues[":content"] = data.content;
    }
    if (data.attachment){
        if (updateExpression.length > 0) {
            updateExpression += ", "
        } else {
            updateExpression += "SET "
        }
        updateExpression += "attachment = :attachment"
        updateValues[":attachment"] = data.attachment;
    }
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