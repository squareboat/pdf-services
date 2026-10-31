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
    },
  },
}));
