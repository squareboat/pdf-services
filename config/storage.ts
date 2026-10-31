import { registerAs } from "@nestjs/config";
export default registerAs("storage", () => ({
  default: "original",
  disks: {
    original: {
      driver: "s3",
      bucket: process.env.APP_AWS_S3_BUCKET,
      accessKey: process.env.APP_AWS_KEY,
      secretKey: process.env.APP_AWS_SECRET,
      region: process.env.APP_AWS_REGION,
      // optional, for S3-compatible servers such as MinIO or LocalStack
      endpoint: process.env.APP_AWS_S3_ENDPOINT,
      forcePathStyle: process.env.APP_AWS_S3_FORCE_PATH_STYLE === "true",
    },
  },
}));
