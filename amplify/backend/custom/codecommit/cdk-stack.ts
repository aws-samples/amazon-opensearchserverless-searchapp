import * as cdk from 'aws-cdk-lib';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';
import { Construct } from 'constructs';
//import * as iam from 'aws-cdk-lib/aws-iam';
//import * as sns from 'aws-cdk-lib/aws-sns';
//import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
//import * as sqs from 'aws-cdk-lib/aws-sqs';

export class cdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });
    new cdk.aws_codecommit.Repository(this, 'MovieSearchRepo', {
      repositoryName: "moviesearch"
    });
  }
}