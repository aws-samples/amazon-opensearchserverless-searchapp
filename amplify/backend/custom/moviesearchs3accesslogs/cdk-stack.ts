import * as cdk from "aws-cdk-lib";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class cdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps,
    amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
  ) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, "env", {
      type: "String",
      description: "Current Amplify CLI env name",
    });

    const bucket = new s3.Bucket(this, "AccessLogBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, "AccessLogBucketArn", {
      value: bucket.bucketArn,
    });
    new cdk.CfnOutput(this, "AccessLogBucketName", {
      value: bucket.bucketName,
    });
   
  }
}
