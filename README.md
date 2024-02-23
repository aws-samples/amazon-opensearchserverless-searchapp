# Movie search application using open search serverless

This prototype project is intended to show a way to implement multi dimensional search capability using [Amazon OpenSearch Serverless](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-overview.html) and [AWS Amplify](https://aws.amazon.com/amplify/) services. This application provides the logged in user with the ability to search for movies based on text matching the title, description, actor and directors from the movies collection. The search result provides the movie title, description, image, imdb movie link, actors and a link to open up the movie trailer. It also allows sorting and pagination of the search results. 

## Deploy the application
### Prerequisite

- Install [Nodejs](https://nodejs.org/en/download/) Latest LTS Version. (Project uses Nodejs 20.11.0 and npm 10.2.4)
- Install [Amplify CLI](https://docs.amplify.aws/react/start/getting-started/installation/#install-the-amplify-cli).
- Install [awscurl](https://github.com/okigan/awscurl) for data ingestion.

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
- <B>Front End Application</B> is a react application which is hosted on a cloudfront distributed S3 bucket. The application uses [Amplify UI](https://ui.docs.amplify.aws/) which is a collection of react components that can connect directly to the cloud. We use the Authenticator component of amplify UI to enable authentication flows like sign-up, sign-in, sign-out and works seamlessly with amplify CLI to connect with AWS Cognito. Cloud distribution is protected from common web threats by adding a [WAF](https://aws.amazon.com/blogs/networking-and-content-delivery/mitigate-common-web-threats-with-one-click-in-amazon-cloudfront/)
- <B>Authentication</B>: Application access is controlled using [Amazon Cognito](https://aws.amazon.com/cognito/), it provides a robust set of APIs to build a self-registration solution. We use the Cognito User pools to securely store user profile data recieved from the sign-up page. Multi-factor authentication (MFA) is configured in the user pool and application users can verify their identities using Time-based One-time Password (TOTP) generator, such as Google Authenticator.
- <B>Backend Application</B>:
## Data Ingestion
  The sample [movie data](project_assets/movies-data.json) is ingested into Open Search Serverless Collection. The custom CDK resouce - [opensearchserverless](amplify/backend/custom/opensearchserverless/constructs/opensearch-contruct.ts) creates the collection, dataaccess policy, network policy and the pipeline for data ingestion into `Movies` index. The output from the cdk resource creation includes endpoints for ingestion, collection and dashboard. Replace the ingestion url and region in the below snapshot and execute the awscurl command to save data into collection. 
    <img src="project_assets/data_ingestion.png" alt="drawing" style="width:300px;"/>

  You should see a `200 OK` response.

## Application Flow
### Create User Account
  * User signs-up for application access by entering Username, password (rule - should be atleast 8 character length, should include atleast one uppercase character and symbol) and email address.

    <img src="project_assets/createaccount.png" alt="drawing" style="width:300px;"/>

### Verify Account
  * Verify your account by entering the confirmation code recieved in your email.

    <img src="project_assets/emailverify.png" alt="drawing" style="width:300px;"/>

### MFA verification
  * Setup Time-based One-time Password (TOTP) by scanning the image using authenticator app like Google Authenticator. Enter the code generated in the app and confirm.

    <img src="project_assets/mfa_totp_setup.png" alt="drawing" style="width:300px;"/>

### Application Login
  * Once the account is verified, user will be seeing the Movie Finder page.

    <img src="project_assets/app_log_in.png" alt="drawing" style="width:300px;"/>

### Search Movie
  * User can search for movie-name/actor/director and view the search results.

    <img src="project_assets/app_search.png" alt="drawing" style="width:300px;"/>

### Movie Details
  * User can click on the movie tiles to view the movie details.

    <img src="project_assets/app_movie_details.png" alt="drawing" style="width:300px;"/>

### Movie Trailer
  * User can click on the `WATCH TRAILER` link to view the movie trailer. Click out the trailer window to return back to search results page.

    <img src="project_assets/app_movie_trailer.png" alt="drawing" style="width:300px;"/>


### Other Movie details
  * User can click other movie tiles to get respective movie details and trailers.

    <img src="project_assets/app_other_movie_details.png" alt="drawing" style="width:300px;"/>

### Pagination
  * In case of large search results, the pagination links at the bottom can be clicked to view more movie results.

    <img src="project_assets/app_pagination.png" alt="drawing" style="width:300px;"/>

## Cleanup
- Pull the backend environment associated with the application to your local environment by running `amplify pull` command.
- Within the project directory, run the `amplify delete` command.