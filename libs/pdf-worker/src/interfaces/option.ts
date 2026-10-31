import { ModuleMetadata, Type } from "@nestjs/common";
import type { PDFOptions } from "puppeteer-core";

export interface PDFWorkerOptions {
  default: string;
  isLocal: boolean;
  /** Chromium binary used when `isLocal` is true (defaults to /opt/homebrew/bin/chromium) */
  chromiumPath?: string;
  variants: { [key: string]: { pdfOption: PDFOptions; compress?: boolean } };
}

export interface PDFWorkerAsyncOptionsFactory {
  createPdfWorkerOptions(): Promise<PDFWorkerOptions> | PDFWorkerOptions;
}

export interface PdfWorkerAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  useExisting?: Type<PDFWorkerAsyncOptionsFactory>;
  useClass?: Type<PDFWorkerAsyncOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<PDFWorkerOptions> | PDFWorkerOptions;
  inject?: any[];
}
