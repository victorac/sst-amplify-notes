import { Bucket, Table } from "@serverless-stack/resources";
import * as iam from "aws-cdk-lib/aws-iam";

export function StorageStack({ stack, app }) {
    // Create DynamoDB table
    const entryTable = new Table(stack, "Notes", {
        fields: {
            userId: "string",
            noteId: "string",
        },
        primaryIndex: { partitionKey: "userId", sortKey: "noteId" },
    });
    const textDetectionTable = new Table(stack, "TextDetections", {
        fields: {
            userId: "string",
            imageId: "string",
        },
        primaryIndex: { partitionKey: "userId", sortKey: "imageId" },
    });
    const categoryTable = new Table(stack, "Categories", {
        fields: {
            userId: "string",
            categoryId: "string",
            tagId: "string",
        },
        primaryIndex: { partitionKey: "categoryId", sortKey: "tagId" },
        localIndexes: {
            tag: {
                sortKey: "userId",
                projection: "keys_only"
            }
        }
    });

    const bucket = new Bucket(stack, "Uploads", {
        cors: [
            {
                maxAge: "1 day",
                allowedOrigins: ["*"],
                allowedHeaders: ["*"],
                allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"]
            }
        ],
        notifications: {
            imageProcessor: {
                function: {
                    handler: "functions/imageProcessor.main",
                },
                events: ["object_created"],
                filters: [
                    { suffix: "TBA.jpg", },
                ]
            },
        }
    });
    bucket.notificationFunctions[0].attachPermissions([
        "s3",
        new iam.PolicyStatement({
            actions: ["rekognition:*"],
            effect: iam.Effect.ALLOW,
            resources: [
                "*",
            ],
        }),
        new iam.PolicyStatement({
            actions: ["s3:*"],
            effect: iam.Effect.ALLOW,
            resources: [
                bucket.bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
            ],
        })
    ])
    // bucket.attachPermissions([
    //     "s3",
    //     new iam.PolicyStatement({
    //         actions: ["rekognition:*"],
    //         effect: iam.Effect.ALLOW,
    //         resources: [
    //             "*",
    //         ],
    //     }),
    //     new iam.PolicyStatement({
    //         actions: ["s3:*"],
    //         effect: iam.Effect.ALLOW,
    //         resources: [
    //             bucket.bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
    //         ],
    //     })
    // ]);

    return {
        entryTable,
        textDetectionTable,
        categoryTable,
        bucket,
    };
}
