import handler from "../util/handler";
import dynamoDb from "../util/dynamodb";

export const main = handler((event) => {
    console.log("list");

    return { status: true }
})