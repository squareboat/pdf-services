import { Inject, Injectable } from "@nestjs/common";
import { spawnSync } from "child_process";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { PDFWorkerOptions } from "../interfaces/option";
import { PDF_WORKER_OPTIONS } from "../constants";
import { MathHelpers } from "@libs/boat";

@Injectable()
export class CompressPdf {
  constructor(
    @Inject(PDF_WORKER_OPTIONS) private readonly options: PDFWorkerOptions
  ) {}

  async handle(pdf: Buffer, quality = 80): Promise<Buffer> {
    const ulid = MathHelpers.random();
    const pdfDirectory = `${process.cwd()}/pdf`;
    const pdfTmpName = `${pdfDirectory}/${ulid}.pdf`;
    const compressedPdfName = `${pdfDirectory}/compressed-${ulid}.pdf`;

    writeFileSync(pdfTmpName, pdf);
    await this.resamplePDF(pdfTmpName, compressedPdfName, quality);

    const compressedPdfBuffer = readFileSync(compressedPdfName);

    unlinkSync(pdfTmpName);

    return compressedPdfBuffer;
  }

  async resamplePDF(
    sourcePdf: string,
    outPdf: string,
    quality = 70
  ): Promise<void> {
    let gsOptions = ["-sDEVICE=pdfwrite", "-dNOPAUSE", "-dQUIET", "-dBATCH"];
    gsOptions = gsOptions.concat([
      "-dDetectDuplicateImages=true",
      "-dDownsampleColorImages=true",
      "-dDownsampleGrayImages=true",
      "-dDownsampleMonoImages=true",
      `-dColorImageResolution=${quality}`,
      `-dGrayImageResolution=${quality}`,
      `-dMonoImageResolution=${quality}`,
    ]);

    gsOptions = gsOptions.concat([`-sOutputFile=${outPdf}`, sourcePdf]);
    this.executeCommand(gsOptions);
  }

  executeCommand(parameters: string[]): boolean {
    const cmd = this.options.isLocal ? "/opt/homebrew/bin/gs" : "/opt/bin/gs";

    const result = spawnSync(cmd, parameters, {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe",
      encoding: "utf-8",
    });

    console.log(result);

    return result.stderr ? false : true;
  }
}
