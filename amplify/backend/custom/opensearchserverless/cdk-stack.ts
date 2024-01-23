import * as cdk from "aws-cdk-lib";
import * as AmplifyHelpers from "@aws-amplify/cli-extensibility-helper";
import { AmplifyDependentResourcesAttributes } from "../../types/amplify-dependent-resources-ref";
import { Construct } from "constructs";
import OpenSearchConstruct from "./constructs/opensearch-contruct";


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

    const dependencies: AmplifyDependentResourcesAttributes =
      AmplifyHelpers.addResourceDependency(
        this,
        amplifyResourceProps.category,
        amplifyResourceProps.resourceName,
        [
          {
            category: "function",
            resourceName: "moviesearch56199296",
          }
        ]
      );

    const lambdaRoleArn = cdk.Fn.ref(
      dependencies.function.moviesearch56199296.LambdaExecutionRoleArn
    );
  
    new OpenSearchConstruct(
      this,
      "OpenSearchConstruct",
      { ...props, lambdaRoleArn }
    );
  }
}
