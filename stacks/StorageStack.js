import { Bucket, Table } from "@serverless-stack/resources";

export function StorageStack({ stack, app }) {
    // Create DynamoDB table
    const table = new Table(stack, "Notes", {
        fields: {
            userId: "string",
            noteId: "string",
        },
        primaryIndex: { partitionKey: "userId", sortKey: "noteId"},
    });

    const bucket = new Bucket(stack, "Uploads", {
        cors: [
            {
                maxAge: "1 day",
                allowedOrigins: ["*"],
                allowedHeaders: ["*"],
                allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"]
            }
        ]
    });

    return {
        table,
        bucket,
    };
}
