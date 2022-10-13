import { Api, use } from "@serverless-stack/resources";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }) {
    const { table } = use(StorageStack);

    // Create the API
    const api = new Api(stack, "Api", {
        defaults: {
            authorizer: "iam",
            function: {
                permissions: [table],
                environment: {
                    TABLE_NAME: table.tableName,
                },
            },
        },
        routes: {
            "GET /notes": "functions/list.main",
            "PUT /notes/{id}": "functions/update.main",
            "DELETE /notes/{id}": "functions/delete.main",
            "POST /notes": "functions/create.main",
            "GET /notes/{id}": "functions/get.main",
        },
    });

    stack.addOutputs({
        ApiEndpoint: api.url,
    });

    return {
        api,
    }
}