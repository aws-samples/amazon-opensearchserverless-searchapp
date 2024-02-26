import * as cdk from "aws-cdk-lib";
import {
  CfnAccessPolicy,
  CfnCollection,
  CfnSecurityPolicy,
} from "aws-cdk-lib/aws-opensearchserverless";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { aws_osis as osis, aws_logs as logs } from "aws-cdk-lib";

export default class OpenSearchConstruct extends Construct {
  constructor(scope, id, props) {
    super(scope, id);
    const lambdaRoleArn = props.lambdaRoleArn;
    const collectionName = "movie-collection";
    const indexName = "movies";

    const movieCollection = new CfnCollection(this, "MovieSearchCollection", {
      name: collectionName,
      type: "SEARCH",
    });

    const role = new iam.Role(this, "Role", {
      roleName: "movieCollectionPipelineRole",
      assumedBy: new iam.ServicePrincipal("osis-pipelines.amazonaws.com"),
      inlinePolicies: {
        "OpenSearchServerlessAccess": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["aoss:BatchGetCollection"],
              resources: [`arn:aws:aoss:${cdk.Aws.REGION}:${cdk.Fn.ref(
                "AWS::AccountId"
              )}:collection/*`],
            }),
            new iam.PolicyStatement({
              actions: ["osis:Ingest"],
              resources: [`arn:aws:osis:${cdk.Aws.REGION}:${cdk.Fn.ref(
                "AWS::AccountId"
              )}:pipeline/movie-ingestion`],
            }),
          ]
        })
      }
    });

    role.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "aoss:CreateSecurityPolicy",
          "aoss:GetSecurityPolicy",
          "aoss:UpdateSecurityPolicy",
          "aoss:APIAccessAll"
        ],
        resources: ["*"],
        conditions: {
          StringEquals: {
            "aoss:collection": movieCollection.attrId,
          },
        },
      })
    );

    const movieCollectionPolicy = new CfnSecurityPolicy(
      this,
      "MovieSecurityPolicy",
      {
        name: "movie-collection-policy",
        policy: `{"Rules":[{"ResourceType":"collection","Resource":["collection/${collectionName}"]}],"AWSOwnedKey":true}`,
        type: "encryption",
      }
    );
    movieCollection.addDependency(movieCollectionPolicy);
    const movieNetworkPolicy = new CfnSecurityPolicy(
      this,
      "MovieNetworkPolicy",
      {
        name: "movie-network-policy",
        policy: `[{"Rules":[{"ResourceType":"collection","Resource":["collection/${collectionName}"]}, {"ResourceType":"dashboard","Resource":["collection/${collectionName}"]}],"AllowFromPublic":true}]`,
        type: "network",
      }
    );
    movieCollection.addDependency(movieNetworkPolicy);
    const dataAccessPolicy = new CfnAccessPolicy(
      this,
      "MovieCollectionDataAccess",
      {
        name: "movie-collection-data-access",
        policy: `[{"Description": "Data Access", "Rules":[{"ResourceType":"index","Resource":["index/${collectionName}/*"],"Permission":["aoss:*"]}, {"ResourceType":"collection","Resource":["collection/${collectionName}"],"Permission":["aoss:*"]}], "Principal":["${lambdaRoleArn}","arn:aws:iam::${cdk.Fn.ref(
          "AWS::AccountId"
        )}:role/Admin","${role.roleArn}"]}]`,
        type: "data",
      }
    );
    movieCollection.addDependency(dataAccessPolicy);

    const lambdaRole = iam.Role.fromRoleArn(this, "lambdaRole", lambdaRoleArn);
    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "lambdaPolicy", {
        policyName: "lambda-aoss-policy",
        statements: [
          new iam.PolicyStatement({
            actions: ["aoss:APIAccessAll"],
            resources: [`${movieCollection.attrArn}`],
          }),
        ],
      })
    );

    const pipelineName = "movie-ingestion";

    const pipelineConfigBody = `
      log-pipeline:
        source:
          http:
            path: "/${pipelineName}/data"
        processor:
          - date:
              from_time_received: true
              destination: "@timestamp"
        sink:
          - opensearch:
              hosts: [ "${movieCollection.attrCollectionEndpoint}" ]
              index: "${indexName}"
              aws:
                sts_role_arn: "${role.roleArn}"
                region: "${cdk.Aws.REGION}"
                serverless: true
                serverless_options:
                  network_policy_name: "${movieNetworkPolicy.name}"
      version: "2"`;

    const moviePipelineLogGroup = new logs.LogGroup(
      this,
      "moviePipelineLogGroup",
      {
        logGroupName: `/aws/vendedlogs/OpenSearchIngestion/${pipelineName}/audit-logs`,
        retention: logs.RetentionDays.THREE_DAYS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    const movieCollectionPipeline = new osis.CfnPipeline(
      this,
      "movieIngestion",
      {
        maxUnits: 4,
        minUnits: 1,
        pipelineName: pipelineName,
        pipelineConfigurationBody: pipelineConfigBody,
        logPublishingOptions: {
          cloudWatchLogDestination: {
            logGroup: moviePipelineLogGroup.logGroupName,
          },
          isLoggingEnabled: true,
        },
      }
    );
    movieCollectionPipeline.addDependency(movieCollection);

    const paramCollectionEndpoint = new ssm.StringParameter(this, 'CollectionEndpointParameter', {
      description: 'CollectionEndpoint for movies collection',
      parameterName: '/aoss/movies/collectionEndpoint',
      stringValue: movieCollection.attrCollectionEndpoint,
    });
    const paramMoviesIndex = new ssm.StringParameter(this, 'MoviesIndexParameter', {
      description: 'movies collection index',
      parameterName: '/aoss/movies/indexName',
      stringValue: indexName,
    });
    
    paramCollectionEndpoint.grantRead(lambdaRole);
    paramMoviesIndex.grantRead(lambdaRole);


    new cdk.CfnOutput(this, "DashboardEndpoint", {
      value: movieCollection.attrDashboardEndpoint,
    });
    new cdk.CfnOutput(this, "CollectionEndpoint", {
      value: movieCollection.attrCollectionEndpoint,
    });
    new cdk.CfnOutput(this, "IngestionEndpoint", {
      value: cdk.Fn.select(0, movieCollectionPipeline.attrIngestEndpointUrls),
    });
  }
}
