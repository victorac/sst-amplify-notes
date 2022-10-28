import handler from "../util/handler";
import dynamoDb from "../util/dynamodb";
import { RekognitionClient, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const main = handler(async (event) => {
    console.log("Hello from image Processor!");
    console.log(event);
    const region = event.Records[0].awsRegion;
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(event.Records[0].s3.object.key);
    console.log(region)
    // const s3Client = new S3Client({ region: region });
    // const params_b = {
    //     Bucket: bucketName,
    //     Key: objectKey,
    // };
    // try{
    //     const data = await s3Client.send(new GetObjectCommand(params_b));
    //     console.log(data);
    // } catch(err){
    //     console.log("Erro", err);
    // }
    

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
    console.log(params);
    try {
        const data = await rekognitionClient.send(new DetectTextCommand(params));
        console.log(data);
    } catch (err) {
        console.log("Error", err);
    }

    return { status: true }
});