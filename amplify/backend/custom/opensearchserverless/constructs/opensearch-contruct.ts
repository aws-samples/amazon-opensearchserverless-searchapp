import * as cdk from "aws-cdk-lib";
import {
  CfnAccessPolicy,
  CfnCollection,
  CfnSecurityPolicy,
} from "aws-cdk-lib/aws-opensearchserverless";
import { Construct } from "constructs";

export default class OpenSearchConstruct extends Construct {
  constructor(scope, id, props) {
    super(scope, id);
    const movieCollection = new CfnCollection(this, "MovieSearchCollection", {
      name: "movie-collection",
      type: "SEARCH",
    });

    const movieCollectionPolicy = new CfnSecurityPolicy(
      this,
      "MovieSecurityPolicy",
      {
        name: "movie-collection-policy",
        policy:
          '{"Rules":[{"ResourceType":"collection","Resource":["collection/movie-collection"]}],"AWSOwnedKey":true}',
        type: "encryption",
      }
    );
    movieCollection.addDependency(movieCollectionPolicy);
    const movieNetworkPolicy = new CfnSecurityPolicy(
      this,
      "MovieNetworkPolicy",
      {
        name: "movie-network-policy",
        policy:
          '[{"Rules":[{"ResourceType":"collection","Resource":["collection/movie-collection"]}, {"ResourceType":"dashboard","Resource":["collection/movie-collection"]}],"AllowFromPublic":true}]',
        type: "network",
      }
    );
    movieCollection.addDependency(movieNetworkPolicy);
    const movieDataAccessPolicy = new CfnAccessPolicy(this, "MovieDataPolicy", {
      name: "movie-data-policy",
      policy: `[{"Description": "General Access", "Rules":[{"ResourceType":"index","Resource":["index/movie-collection/*"],"Permission":["aoss:*"]}, {"ResourceType":"collection","Resource":["collection/movie-collection"],"Permission":["aoss:*"]}], "Principal":["arn:aws:iam::${cdk.Fn.ref(
        "AWS::AccountId"
      )}:role/Admin"]}]`,
      type: "data",
    });
    const lambdaAccessPolicy = new CfnAccessPolicy(
      this,
      "MovieDataPolicyForLambda",
      {
        name: "movie-data-policy-lambda",
        policy: `[{"Description": "General Access", "Rules":[{"ResourceType":"index","Resource":["index/movie-collection/*"],"Permission":["aoss:*"]}, {"ResourceType":"collection","Resource":["collection/movie-collection"],"Permission":["aoss:*"]}], "Principal":["arn:aws:iam::${cdk.Fn.ref(
          "AWS::AccountId"
        )}:role/moviesearchLambdaRoled7c901b3-dev"]}]`,
        type: "data",
      }
    );
    movieCollection.addDependency(movieDataAccessPolicy);
    movieCollection.addDependency(lambdaAccessPolicy);

    new cdk.CfnOutput(this, "DashboardEndpoint", {
      value: movieCollection.attrDashboardEndpoint,
    });
  }
}
