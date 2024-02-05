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
  // const bucket = new s3.Bucket(this, "AccessLogBucket", {
  //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  //   encryption: s3.BucketEncryption.S3_MANAGED,
  //   enforceSSL: true,
  //   versioned: true,
  //   removalPolicy: cdk.RemovalPolicy.DESTROY,
  // });
}
