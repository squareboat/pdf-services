import { Inject, Injectable } from "@nestjs/common";
import { GeneratePdfDto, S3ConfigDto } from "../dto";
import { CompressPdf } from "./compressPdf";
import { PDF_WORKER_OPTIONS } from "../constants";
import type { PDFWorkerOptions } from "../interfaces/option";
import { Storage } from "@squareboat/nest-storage";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

@Injectable()
export class GeneratePdf {
  constructor(
    @Inject(PDF_WORKER_OPTIONS) private readonly options: PDFWorkerOptions
  ) {}

  async handle(inputs: GeneratePdfDto): Promise<Buffer> {
    const html = await this.getHtml(inputs);
    if (!html) return;

    const browser = await this.getBrowser();
    try {
      const page = await browser.newPage();
      // puppeteer's types leave networkidle0/2 out of setContent()'s waitUntil
      // (the CDP implementation still accepts them), so wait for the network
      // separately: same effect as the old networkidle2
      await page.setContent(html, { waitUntil: ["domcontentloaded", "load"] });
      await page.waitForNetworkIdle({ concurrency: 2, idleTime: 500 });

      const pdf = await this.generatePdf(inputs, page);
      if (!pdf) return;

      // puppeteer 22+ returns a Uint8Array
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
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

  async generatePdf(inputs: GeneratePdfDto, page: Page): Promise<Uint8Array> {
    const variant = inputs.pdfVariant || this.options.default;
    return page.pdf({
      ...this.options.variants[variant].pdfOption,
      displayHeaderFooter: true,
      footerTemplate: inputs.footer,
    });
  }

  async getBrowser(): Promise<Browser> {
    const executablePath = this.options.isLocal
      ? this.options.chromiumPath || "/opt/homebrew/bin/chromium"
      : await chromium.executablePath();

    // @sparticuz/chromium 137+ no longer exports `headless`/`defaultViewport`;
    // it is a headless shell build, so launch it with headless: "shell".
    return await puppeteer.launch({
      headless: "shell",
      args: await puppeteer.defaultArgs({
        args: [...chromium.args, "--single-process", "--disable-dev-shm-usage"],
        headless: "shell",
      }),
      // the viewport @sparticuz/chromium used to export as `defaultViewport`
      defaultViewport: {
        deviceScaleFactor: 1,
        hasTouch: false,
        height: 1080,
        isLandscape: true,
        isMobile: false,
        width: 1920,
      },
      executablePath: executablePath,
      acceptInsecureCerts: true,
    });
  }

  async getHtml(inputs: GeneratePdfDto): Promise<string | undefined> {
    if (inputs.sourceDisk === "html") {
      return inputs.html;
    }

    throw new Error("Either pass `html` or `s3.path`");
  }
}
