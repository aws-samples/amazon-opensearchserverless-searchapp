# Movie search application using open search serverless

This prototype project is intended to show a way to implement multi dimensional search capability using [Amazon OpenSearch Serverless](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-overview.html) and [AWS Amplify](https://aws.amazon.com/amplify/) services.

## Deploy the application
### Prerequisite

- Install [Nodejs](https://nodejs.org/en/download/) Latest LTS Version. (Project uses Nodejs 20.11.0 and npm 10.2.4)
- Install [Amplify CLI](https://docs.amplify.aws/react/start/getting-started/installation/#install-the-amplify-cli).

### Backend

- Clone this repository to your local computer.
- In the terminal, from the amplify/backend folder execute `npm install` to install all dependencies.
- Repeat the dependency installation in these folders  - amplify/backend/custom/opensearchserverless, amplify/backend/custom/waf01222014
  and amplify/backend/function/moviesearch56199296
- Run `amplify init` command to initialize the [amplify](https://docs.amplify.aws/javascript/tools/cli/start/key-workflows/#amplify-init) project based on the contents of the directory.
- Run `amplify push` to build and deploy the backend resources, resource list would be as below.
    ![Alt text](project_assets/aws_cli_push.png)

  After successful deployment, the resource metadata will be saved in <B>amplify-meta.json</B>

### Frontend
- From the project's root folder, run `npm install` to install the frontend dependencies.
- Optionally, you can run `npm audit --production` to check on vulnerabilities in the packages and fix them.
- Run `npm run start` to launch the react application locally from the browser. The required configurations to backend resources like API, Cognito etc will be in <B>amplifyconfiguration.json</B>. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- To publish the frontend react application on to cloudfront, run `amplify publish`.

### Note
Add a WAF to mitigate common web threats and protect cloudfront distribution by manual [one-click](https://aws.amazon.com/blogs/networking-and-content-delivery/mitigate-common-web-threats-with-one-click-in-amazon-cloudfront/) configuration in the amazon cloudfront distribution.

## Architecture
![Alt text](project_assets/architecture.png)

## Cleanup
- Pull the backend environment associated with the application to your local environment by running `amplify pull` command.
- Within the project directory, run the `amplify delete` command.