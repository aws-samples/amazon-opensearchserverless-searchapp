import {
  AmplifyProjectInfo,
  AmplifyS3ResourceTemplate,
} from "@aws-amplify/cli-extensibility-helper";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export function override(
  resources: AmplifyS3ResourceTemplate,
  amplifyProjectInfo: AmplifyProjectInfo
) {
  resources.s3Bucket.addOverride('DeletionPolicy', 'Delete');
}
