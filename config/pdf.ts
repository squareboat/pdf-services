import { registerAs } from "@nestjs/config";

const defaultMargin = {
  top: "24px",
  right: "24px",
  bottom: "24px",
  left: "24px",
};

export default registerAs("pdf", () => ({
  moduleSettings: {
    default: "docs",
    isLocal: process.env.NODE_ENV === "local",
    chromiumPath: process.env.CHROMIUM_PATH,
    variants: {
      docs: {
        pdfOption: {
          landscape: false,
          format: "legal",
          margin: defaultMargin,
          printBackground: true,
          // Chrome rejects NaN, so fall back to 1 when PDF_SCALE is not set
          scale: +process.env.PDF_SCALE || 1,
        },
        compress: true,
      },
    },
  },
  variants: ["docs"],
  // Largest JSON request body accepted (Express defaults to 100kb). HTML with
  // inline CSS/images is often bigger. Lambda caps a synchronous request at 6 MB.
  maxBodySize: process.env.PDF_MAX_BODY || "5mb",
}));
