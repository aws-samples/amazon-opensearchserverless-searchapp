export type AmplifyDependentResourcesAttributes = {
  "api": {
    "moviesearchapi": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    }
  },
  "auth": {
    "moviesearchbf5c44f3": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "CreatedSNSRole": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "custom": {
    "opensearchserverless": {
      "OpenSearchConstructCollectionEndpointFA724707": "string",
      "OpenSearchConstructDashboardEndpoint86C2E94F": "string",
      "OpenSearchConstructIngestionEndpoint62BB58A6": "string"
    }
  },
  "function": {
    "moviesearch56199296": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "hosting": {
    "S3AndCloudFront": {
      "CloudFrontDistributionID": "string",
      "CloudFrontDomainName": "string",
      "CloudFrontOriginAccessIdentity": "string",
      "CloudFrontSecureURL": "string",
      "HostingBucketName": "string",
      "Region": "string",
      "S3BucketSecureURL": "string",
      "WebsiteURL": "string"
    }
  },
  "storage": {
    "moviestore": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}