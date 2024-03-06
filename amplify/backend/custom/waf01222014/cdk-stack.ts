import * as cdk from "aws-cdk-lib";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { AmplifyDependentResourcesAttributes } from "../../types/amplify-dependent-resources-ref";
import { Construct } from "constructs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";


export class cdkStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: any,
    amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
  ) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, "env", {
      type: "String",
      description: "Current Amplify CLI env name",
    });

    const dependencies: AmplifyDependentResourcesAttributes =
      AmplifyHelpers.addResourceDependency(
        this,
        amplifyResourceProps.category,
        amplifyResourceProps.resourceName,
        [
          {
            category: "api",
            resourceName: "moviesearchapi",
          },
        ]
      );
    const apiId = cdk.Fn.ref(dependencies.api.moviesearchapi.ApiId);
  
    this.createAndAssociateWaf(apiId);
  }

  private createAndAssociateWaf(apiId: string) {
    const apiIpset = new wafv2.CfnIPSet(this, "ipset", {
      addresses: ["xx.xx.xx.xx/32"],
      ipAddressVersion: "IPV4",
      scope: "REGIONAL",
      description: "Allowed IP addresses.",
      name: "movies-search-ipsetV4",
    });

    apiIpset.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const ipRule: wafv2.CfnWebACL.RuleProperty = {
      name: "allowed-ips",
      priority: 1,
      action: { allow: {} },
      statement: {
        orStatement: {
          statements: [
            {
              ipSetReferenceStatement: {
                arn: apiIpset.attrArn,
              },
            },
            {
              ipSetReferenceStatement: {
                arn: apiIpset.attrArn,
                ipSetForwardedIpConfig: {
                  headerName: "X-Forwarded-For",
                  fallbackBehavior: "NO_MATCH",
                  position: "ANY",
                },
              },
            },
          ],
        },
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: "allow-permitted-ips",
        sampledRequestsEnabled: false,
      },
    };

    // WAF
    const wafAclRegional = new wafv2.CfnWebACL(this, "api-regional-acl", {
      defaultAction: { block: {} },
      scope: "REGIONAL",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: "api-waf-regional",
        sampledRequestsEnabled: true,
      },
      description: "WAFv2 ACL for Regional",
      rules: [ipRule],
    });

    // ACL association with API.
    new wafv2.CfnWebACLAssociation(this, "api-acl-association", {
      resourceArn: `arn:aws:apigateway:${cdk.Aws.REGION}::/restapis/${apiId}/stages/${cdk.Fn.ref('env')}`,
      webAclArn: wafAclRegional.attrArn,
    });
  }
}