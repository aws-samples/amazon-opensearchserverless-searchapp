/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	OPEN_SEARCH_HOST
Amplify Params - DO NOT EDIT */

const { defaultProvider } = require("@aws-sdk/credential-provider-node"); // V3 SDK.
const { Client } = require("@opensearch-project/opensearch");
const { AwsSigv4Signer } = require("@opensearch-project/opensearch/aws");

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
    try {
      const queryParam = event.queryStringParameters.query
      const collectionEndpoint = process.env.OPEN_SEARCH_HOST;
      const collectionIndex = process.env.OPEN_SEARCH_INDEX;
      const region = process.env.REGION;
  
      const client = getOSClient(region, collectionEndpoint);
      const query = {
          size: event.queryStringParameters?.size || 25,
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
