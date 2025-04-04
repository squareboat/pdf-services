import { Inject, Injectable } from "@nestjs/common";
import { GeneratePdfDto, S3ConfigDto } from "../dto";
import { CompressPdf } from "./compressPdf";
import { PDF_WORKER_OPTIONS } from "../constants";
import { PDFWorkerOptions } from "../interfaces/option";
import { Storage } from "@squareboat/nest-storage";

const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

@Injectable()
export class GeneratePdf {
  constructor(
    @Inject(PDF_WORKER_OPTIONS) private readonly options: PDFWorkerOptions
  ) {}

  async handle(inputs: GeneratePdfDto): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    const html = await this.getHtml(inputs);
    if (!html) return;

    await page.setContent(html, {
      waitUntil: ["domcontentloaded", "networkidle2", "load"],
    });

    let pdf = await this.generatePdf(inputs, page);

    if (!pdf || typeof pdf === "string") return;

    await browser.close();

    return pdf;
  }

  async storePdf(
    destination: S3ConfigDto,
    fileName: string,
    buffer: Buffer
  ): Promise<string | undefined> {
    if (!buffer) return;
    if (destination.path) {
      let path = destination.path + "/" + fileName;
      const res = await Storage.disk("original").put(path, buffer, {
        mimeType: "application/pdf",
      });
      return res.path;
    }
  }

  async compressPdf(pdf: Buffer): Promise<Buffer> {
    const compressTask = new CompressPdf(this.options);
    return await compressTask.handle(pdf);
  }

  async generatePdf(
    inputs: GeneratePdfDto,
    page: any
  ): Promise<string | void | Buffer> {
    const variant = inputs.pdfVariant || this.options.default;
    return page.pdf({
      ...this.options.variants[variant].pdfOption,
      displayHeaderFooter: true,
      footerTemplate: inputs.footer,
    });
  }

  async getBrowser() {
    const executablePath = this.options.isLocal
      ? "/opt/homebrew/bin/chromium"
      : await chromium.executablePath();

    return await puppeteer.launch({
      headless: chromium.headless,
      args: [...chromium.args, "--single-process", "--disable-dev-shm-usage"],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      ignoreHTTPSErrors: true,
    });
  }

  async getHtml(inputs: GeneratePdfDto): Promise<string | undefined> {
    if (inputs.sourceDisk === "html") {
      return inputs.html;
    }

    throw new Error("Either pass `html` or `s3.path`");
  }
}
