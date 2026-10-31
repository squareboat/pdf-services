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

### Deployment:
To deploy this service to AWS Lambda, use the command: `serverless deploy`
