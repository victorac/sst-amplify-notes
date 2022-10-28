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
                    environment: {
                        TEXT_DETECTION_TABLE_NAME: textDetectionTable.tableName
                    },
                    permissions: [
                        "s3",
                        "dynamodb",
                        new iam.PolicyStatement({
                            actions: ["rekognition:*"],
                            effect: iam.Effect.ALLOW,
                            resources: [
                                "*",
                            ],
                        })
                    ],
                },
                events: ["object_created"],
                filters: [
                    { suffix: "TBA.jpg", },
                ]
            },
        }
    });

    return {
        entryTable,
        textDetectionTable,
        categoryTable,
        bucket,
    };
}
