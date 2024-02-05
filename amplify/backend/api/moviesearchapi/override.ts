// This file is used to override the REST API resources configuration
import {
  AmplifyApiRestResourceStackTemplate,
  AmplifyProjectInfo,
} from "@aws-amplify/cli-extensibility-helper";
import * as logs from "aws-cdk-lib/aws-logs";

export function override(
  resources: AmplifyApiRestResourceStackTemplate,
  amplifyProjectInfo: AmplifyProjectInfo
) {
  //To add a coginito authorizer to all apis, override Amplify-generated API Gateway resources
  //See https://docs.amplify.aws/cli/restapi/override/#authorize-api-requests-with-cognito-user-pools

  const authResourceName = "moviesearchbf5c44f3";
  const userPoolArnParameter = "AuthCognitoUserPoolArn";

  // Add a parameter to your Cloud Formation Template for the User Pool's ID
  resources.addCfnParameter(
    {
      type: "String",
      description:
        "The ARN of an existing Cognito User Pool to authorize requests",
      default: "NONE",
    },
    userPoolArnParameter,
    { "Fn::GetAtt": [`auth${authResourceName}`, "Outputs.UserPoolArn"] }
  );

  // Create the authorizer using the AuthCognitoUserPoolArn parameter defined above
  resources.restApi.addPropertyOverride("Body.securityDefinitions", {
    Cognito: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      "x-amazon-apigateway-authtype": "cognito_user_pools",
      "x-amazon-apigateway-authorizer": {
        type: "cognito_user_pools",
        providerARNs: [
          {
            "Fn::Join": ["", [{ Ref: userPoolArnParameter }]],
          },
        ],
      },
    },
  });

  // For every path in your REST API
  for (const path in resources.restApi.body.paths) {
    // Add the Authorization header as a parameter to requests
    resources.restApi.addPropertyOverride(
      `Body.paths.${path}.x-amazon-apigateway-any-method.parameters`,
      [
        ...resources.restApi.body.paths[path]["x-amazon-apigateway-any-method"]
          .parameters,
        {
          name: "Authorization",
          in: "header",
          required: false,
          type: "string",
        },
      ]
    );
    // Use your new Cognito User Pool authorizer for security
    resources.restApi.addPropertyOverride(
      `Body.paths.${path}.x-amazon-apigateway-any-method.security`,
      [{ Cognito: [] }]
    );
  }

  const logGroup = new logs.LogGroup(resources.restApi, "AccessLogs", {
    retention: 30,
  });

  resources.deploymentResource.addPropertyOverride("StageDescription", {
    LoggingLevel : "INFO",
    MetricsEnabled: true,
    AccessLogSetting: {
      DestinationArn: logGroup.logGroupArn,
      Format: '{ "requestId": "$context.requestId", "path": "$context.path", "routeKey": "$context.routeKey", "ip": "$context.identity.sourceIp", "requestTime": "$context.requestTime", "httpMethod": "$context.httpMethod","statusCode": $context.status }'
    },
  });
}
