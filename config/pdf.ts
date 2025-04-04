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
    variants: {
      docs: {
        pdfOption: {
          landscape: false,
          format: "legal",
          margin: defaultMargin,
          printBackground: true,
          scale: +process.env.PDF_SCALE,
        },
        compress: true,
      },
    },
  },
  variants: ["docs"],
}));
