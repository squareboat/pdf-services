# PDF-Services

This repository provides a PDF generation service that converts HTML code to PDF. It is designed to be deployed on AWS Lambda and requires specific AWS permissions as outlined in `permissions.md`.

### Requirements:
- Node.js 24 (24.15 or newer). The Lambda runtime is `nodejs24.x`.
- AWS account with appropriate permissions (see `permissions.md`)
- Serverless framework v4 (a dev dependency, so `npx sls ...` works)

### Development:
- `npm run build`, `npm run lint`, `npm test`
- Local PDF generation (`NODE_ENV=local`): set `CHROMIUM_PATH` to a local Chrome/Chromium binary, e.g. one from `npx @puppeteer/browsers install chrome-headless-shell@stable`. `@sparticuz/chromium` only ships a Linux build.
- Local S3: set `APP_AWS_S3_ENDPOINT` (and `APP_AWS_S3_FORCE_PATH_STYLE=true`) to use an S3-compatible server such as MinIO.

### Lambda runtime and ESM:
NestJS 12 is ESM only and this app is CommonJS, so on Lambda it runs with `NODE_OPTIONS=--experimental-require-module` (set in the Dockerfile and in the provider environment). Lambda drops its own `--no-experimental-require-module` flag when NODE_OPTIONS asks for this, but per the [AWS Lambda Node.js runtime docs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html), functions that use experimental Node.js features aren't eligible for the Lambda SLA or AWS Support. The alternative is to build the app as ESM.

### Security:
`POST /pdf/generate` has no authorizer. Whoever can reach the endpoint can:
- have Chromium render any HTML they send. The page has network access and accepts invalid TLS certificates (`acceptInsecureCerts`), so it can fetch anything the function can reach;
- write a PDF to any key in the bucket (`destination.path` + `fileName`), including over existing objects.

Before exposing it, put the API behind an authorizer (IAM, Cognito or a Lambda authorizer) or make it a private API, and restrict the keys it may write (a fixed prefix in the code and in the function's IAM policy).

### Deployment:
To deploy this service to AWS Lambda, use the command: `serverless deploy`
