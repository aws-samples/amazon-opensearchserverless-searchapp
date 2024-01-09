import * as cdk from 'aws-cdk-lib';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref';
import { Construct } from 'constructs';
import OpenSearchConstruct from './constructs/opensearch-contruct';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
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
    
    const opensearchConstruct = new OpenSearchConstruct(this, 'OpenSearchConstruct', props)

    // this.createAndAssociateWaf();
  }

  private createAndAssociateWaf() {

    const apiIpset = new wafv2.CfnIPSet(this,'ipset', {
      addresses: ["108.236.149.123/32"],
      ipAddressVersion: 'IPV4',
      scope: 'REGIONAL',
      description: 'Allowed IP addresses.',
      name: 'my-ipsetV4',
    })

    const ipRule: wafv2.CfnWebACL.RuleProperty = {
      name: 'allowed-ips',
      priority: 1,
      action: { allow: {} },
      statement: {
        orStatement: {
          statements: [{
            ipSetReferenceStatement: {
              arn: apiIpset.attrArn,
            }
          },
          {
            ipSetReferenceStatement: {
              arn: apiIpset.attrArn,
              ipSetForwardedIpConfig: {
                headerName: 'X-Forwarded-For',
                fallbackBehavior: 'NO_MATCH',
                position: 'ANY'
              }
            }
          }
          ]
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: 'allow-permitted-ips',
        sampledRequestsEnabled: false,
      },
    }

    // WAF
    const wafAclRegional = new wafv2.CfnWebACL(this, 'api-regional-acl', {
      defaultAction: { block: {} },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'api-waf-regional',
        sampledRequestsEnabled: true,
      },
      description: 'WAFv2 ACL for Regional',
      rules: [ipRule],
    });

    // ACL association with API.
    new wafv2.CfnWebACLAssociation(this, 'api-acl-association', {
      resourceArn: "arn:aws:apigateway:us-east-2::/restapis/hqzp6b48x7/stages/dev",
      webAclArn: wafAclRegional.attrArn,
    });
  }
}