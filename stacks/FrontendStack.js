import { ReactStaticSite, StaticSite, use } from "@serverless-stack/resources";
import { ApiStack } from "./ApiStack";
import { AuthStack } from "./AuthStack";
import { StorageStack } from "./StorageStack";

export function FrontendStack({ stack, app }) {
    const { api } = use(ApiStack);
    const { auth } = use(AuthStack);
    const { bucket } = use(StorageStack);

    // const site = new StaticSite(stack, "ReactSite", {
    //     path: "frontend",
    //     buildOutput: "dist",
    //     buildCommand: "npm run build",
    //     errorPage: "redirect_to_index_page",
    //     environment: {
    //         REACT_APP_API_URL: api.customDomainUrl || api.url,
    //         REACT_APP_REGION: app.region,
    //         REACT_APP_BUCKET: bucket.bucketName,
    //         REACT_APP_USER_POOL_ID: auth.userPoolId,
    //         REACT_APP_IDENTITY_POOL_ID: auth.cognitoIdentityPoolId,
    //         REACT_APP_USER_POOL_CLIENT_ID: auth.userPoolClientId,
    //       },
    // });

    const site = new ReactStaticSite(stack, "ReactSite2", {
        path: "frontend",
        // Pass in our environment variables
        environment: {
          REACT_APP_API_URL: api.customDomainUrl || api.url,
          REACT_APP_REGION: app.region,
          REACT_APP_BUCKET: bucket.bucketName,
          REACT_APP_USER_POOL_ID: auth.userPoolId,
          REACT_APP_IDENTITY_POOL_ID: auth.cognitoIdentityPoolId,
          REACT_APP_USER_POOL_CLIENT_ID: auth.userPoolClientId,
        },
      });

    stack.addOutputs({
        SiteUrl: site.url,
    });
}