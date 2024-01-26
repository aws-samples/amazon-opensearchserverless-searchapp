import {
  AmplifyProjectInfo,
  AmplifyS3ResourceTemplate,
} from "@aws-amplify/cli-extensibility-helper";
import * as cdk from "aws-cdk-lib";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { AmplifyDependentResourcesAttributes } from "../../types/amplify-dependent-resources-ref";

export function override(
  resources: AmplifyS3ResourceTemplate,
  amplifyProjectInfo: AmplifyProjectInfo
) {
  // const dependencies: AmplifyDependentResourcesAttributes =
  //   AmplifyHelpers.addResourceDependency(this, "storage", "moviestore", [
  //     {
  //       category: "api",
  //       resourceName: "moviesearchapi",
  //     },
  //   ]);
  
  // const accesslogBucketName = cdk.Fn.ref("AccessLogBucketName");

  resources.s3Bucket.loggingConfiguration = {
    destinationBucketName: "amplify-moviesearch-dev-13-accesslogbucketda470295-41dg3up2lc7a",
    logFilePrefix: "movie-search"
  }
}
