import { Api, use } from "@serverless-stack/resources";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }) {
    const { entryTable, textDetectionTable, categoryTable } = use(StorageStack);

    // Create the API
    const api = new Api(stack, "Api", {
        customDomain:
            app.stage === "prod" ? "api.miraitomo.com" : undefined,
        defaults: {
            authorizer: "iam",
            function: {
                permissions: [entryTable, textDetectionTable, categoryTable],
                environment: {
                    ENTRY_TABLE_NAME: entryTable.tableName,
                    TEXT_DETECTION_TABLE_NAME: textDetectionTable.tableName,
                    CATEGORY_TABLE_NAME: categoryTable.tableName,
                    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
                },
            },
        },
        routes: {
            "GET /notes": "functions/list.main",
            "PUT /notes/{id}": "functions/update.main",
            "DELETE /notes/{id}": "functions/delete.main",
            "POST /billing": "functions/billing.main",
            "POST /notes": "functions/create.main",
            "GET /notes/{id}": "functions/get.main",
            "GET /detect-text": "functions/listDetectText.main",
            "GET /detect-text/{id}": "functions/getDetectText.main",
            "POST /entries": "functions/createEntry.main",
            "GET /entries/{id}": "functions/get.main",
            "PUT /entries/{id}": "functions/updateEntry.main"
        },
    });

    stack.addOutputs({
        ApiEndpoint: api.customDomainUrl || api.url,
    });

    return {
        api,
    }
}