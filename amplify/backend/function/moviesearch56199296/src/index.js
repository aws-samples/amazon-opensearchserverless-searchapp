/* Amplify Params - DO NOT EDIT
  ENV
  REGION
Amplify Params - DO NOT EDIT */

const { defaultProvider } = require("@aws-sdk/credential-provider-node"); // V3 SDK.
const { Client } = require("@opensearch-project/opensearch");
const { AwsSigv4Signer } = require("@opensearch-project/opensearch/aws");
const { SSMClient, GetParametersCommand } = require("@aws-sdk/client-ssm")
let collectionEndpoint = "";
let collectionIndex = "";

const params = [ // ParameterNameList
"/aoss/movies/collectionEndpoint",
"/aoss/movies/indexName",
];


/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
  try {
    if (!collectionEndpoint || !collectionIndex) {
      const client = new SSMClient({region: process.env.REGION || "us-east-2"});
      const input = {
        Names: params,
        WithDecryption: true,
      };
      const command = new GetParametersCommand(input);
      const response = await client.send(command);
      console.log(response);
      collectionEndpoint = response.Parameters.find(param => param.Name === params[0]).Value;
      collectionIndex = response.Parameters.find(param => param.Name === params[1]).Value;
    }
    const queryParam = event.queryStringParameters.query
    const region = process.env.REGION;

    const client = getOSClient(region, collectionEndpoint);
    const query = {
      size: event.queryStringParameters?.size || 25,
      from: event.queryStringParameters?.from || 0,
      query: {
        multi_match: {
          query: queryParam,
          fields: ["title^4", "plot^2", "actors", "directors"]
        }
      }
    };

    const response = await client.search({
      index: collectionIndex,
      body: query,
    });

    console.log("query:", JSON.stringify(query, null, 2));

    return makeResults(200, response.body.hits);
  } catch (err) {
    console.log(err);
    return makeResults(500, {
      Error: "Server side error: please check function logs",
    });
  }
};

function makeResults(returnCode, body) {
  return {
    statusCode: returnCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify(body),
  };
}

function getOSClient(region, collectionEndpoint) {
  return new Client({
    ...AwsSigv4Signer({
      region: region,
      service: "aoss",
      // Must return a Promise that resolve to an AWS.Credentials object.
      // This function is used to acquire the credentials when the client start and
      // when the credentials are expired.
      // The Client will refresh the Credentials only when they are expired.
      // With AWS SDK V2, Credentials.refreshPromise is used when available to refresh the credentials.
      // Example with AWS SDK V3:
      getCredentials: () => {
        // Any other method to acquire a new Credentials object can be used.
        const credentialsProvider = defaultProvider();
        return credentialsProvider();
      },
    }),
    node: collectionEndpoint,
  });
}
