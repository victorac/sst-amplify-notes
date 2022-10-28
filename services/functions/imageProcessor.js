import handler from "../util/handler";
import { RekognitionClient, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export const main = handler(async (event) => {
    console.log(event);
    const region = event.Records[0].awsRegion;
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key);

    const rekognitionClient = new RekognitionClient({
        region: region
    });
    const params = {
        Image: {
            S3Object: {
                Bucket: bucketName,
                Name: objectKey,
            },
        },
    }
    const data = await rekognitionClient.send(new DetectTextCommand(params));
    console.log(event.Records[0].userIdentity)

    try {
        console.log(event.requestContext.authorizer.iam.cognitoIdentity.identityId)
    } catch (e) {
        console.log("Error", e);
    }
    const putParams = {
        TableName: process.env.TEXT_DETECTION_TABLE_NAME,
        Item: {
            userId: "defaul_tuser",
            imageId: objectKey.split("/").pop(),
            textDetections: data.TextDetections,
            createdAt: Date.now(),
        },
    };
    const dynamoDBClient = new DynamoDBClient({ region: region });
    const marshallOptions = {
        // Whether to automatically convert empty strings, blobs, and sets to `null`.
        convertEmptyValues: false, // false, by default.
        // Whether to remove undefined values while marshalling.
        removeUndefinedValues: true, // false, by default.
        // Whether to convert typeof object to map attribute.
        convertClassInstanceToMap: false, // false, by default.
    };

    const unmarshallOptions = {
        // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
        wrapNumbers: false, // false, by default.
    };

    const translateConfig = { marshallOptions, unmarshallOptions };
    const docClient = DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);
    await docClient.send(new PutCommand(putParams))


    return putParams.Item;
});