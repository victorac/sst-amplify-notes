import { AuthStack } from "./AuthStack";
import { ApiStack } from "./ApiStack";
import { StorageStack } from "./StorageStack";
import { App } from "@serverless-stack/resources";
import { FrontendStack } from "./FrontendStack";


/**
 * @param {App} app
 */
export default function (app) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
  });
  app.stack(StorageStack).stack(ApiStack).stack(AuthStack).stack(FrontendStack);
}
