import { ModuleMetadata, Type } from "@nestjs/common";
import { PDFOptions } from "puppeteer-core";

export interface PDFWorkerOptions {
  default: string;
  isLocal: boolean;
  variants: { [key: string]: { pdfOption: PDFOptions; compress?: boolean } };
}

export interface PDFWorkerAsyncOptionsFactory {
  createPdfWorkerOptions(): Promise<PDFWorkerOptions> | PDFWorkerOptions;
}

export interface PdfWorkerAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  name?: string;
  useExisting?: Type<PDFWorkerOptions>;
  useClass?: Type<PDFWorkerAsyncOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<PDFWorkerOptions> | PDFWorkerOptions;
  inject?: any[];
}
