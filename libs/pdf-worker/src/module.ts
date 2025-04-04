import { DynamicModule, Global, Module, Provider, Type } from "@nestjs/common";
import { PDF_WORKER_OPTIONS } from "./constants";
import { PDFWorkerService } from "./service";
import {
  PDFWorkerAsyncOptionsFactory,
  PDFWorkerOptions,
  PdfWorkerAsyncOptions,
} from "./interfaces/option";
import { GeneratePdf } from "./tasks/generatePdf";
import { CompressPdf } from "./tasks/compressPdf";

@Global()
@Module({})
export class PDFGeneratorLibModule {
  /**
   * Register options
   * @param options
   */
  static register(options: NotificationOptions): DynamicModule {
    return {
      global: false,
      module: PDFGeneratorLibModule,
      imports: [],
      providers: [
        PDFWorkerService,
        GeneratePdf,
        CompressPdf,
        { provide: PDF_WORKER_OPTIONS, useValue: options },
      ],
      exports: [PDFWorkerService],
    };
  }

  /**
   * Register Async Options
   */
  static registerAsync(options: PdfWorkerAsyncOptions): DynamicModule {
    return {
      global: false,
      module: PDFGeneratorLibModule,
      imports: [],
      providers: [
        PDFWorkerService,
        GeneratePdf,
        CompressPdf,
        this.createPdfWorkerOptionsProvider(options),
      ],
      exports: [PDFWorkerService],
    };
  }

  private static createPdfWorkerOptionsProvider(
    options: PdfWorkerAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: PDF_WORKER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<PDFWorkerOptions>,
    ];

    return {
      provide: PDF_WORKER_OPTIONS,
      useFactory: async (optionsFactory: PDFWorkerAsyncOptionsFactory) =>
        await optionsFactory.createPdfWorkerOptions(),
      inject,
    };
  }
}
