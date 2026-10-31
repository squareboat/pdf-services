import { Test, TestingModule } from "@nestjs/testing";
import { Injectable } from "@nestjs/common";
import { BaseValidator, ValidationFailed } from "@libs/boat";
import {
  GeneratePdfDto,
  PDFGeneratorLibModule,
  PDFWorkerAsyncOptionsFactory,
  PDFWorkerOptions,
  PDFWorkerService,
} from "@libs/pdf-worker";
import { PDFGeneratorModule } from "./module";
import { PdfGeneratorController } from "./controllers/pdf";
import { PdfService } from "./services/service";

const workerOptions: PDFWorkerOptions = {
  default: "docs",
  isLocal: true,
  variants: { docs: { pdfOption: { format: "a4" } } },
};

@Injectable()
class WorkerOptionsFactory implements PDFWorkerAsyncOptionsFactory {
  createPdfWorkerOptions(): PDFWorkerOptions {
    return workerOptions;
  }
}

describe("PDFGeneratorModule", () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [PDFGeneratorModule],
    }).compile();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("wires the controller, service and pdf worker", () => {
    expect(app.get(PdfGeneratorController)).toBeInstanceOf(
      PdfGeneratorController
    );
    expect(app.get(PdfService)).toBeInstanceOf(PdfService);
    expect(app.get(PDFWorkerService)).toBeInstanceOf(PDFWorkerService);
  });
});

describe("PDFGeneratorLibModule.registerAsync", () => {
  it("resolves options from a useClass factory", async () => {
    const app = await Test.createTestingModule({
      imports: [
        PDFGeneratorLibModule.registerAsync({ useClass: WorkerOptionsFactory }),
      ],
    }).compile();

    const worker = app.get(PDFWorkerService);
    expect(worker.generatePdfTask["options"]).toEqual(workerOptions);
    await app.close();
  });
});

describe("GeneratePdfDto validation", () => {
  const validator = new BaseValidator();

  it("accepts a html request", async () => {
    const dto = await validator.fire(
      {
        sourceDisk: "html",
        pdfVariant: "docs",
        destination: { path: "invoices" },
        htmlFileDataArray: [{ html: "<p>Hi</p>", fileName: "hi.pdf" }],
      },
      GeneratePdfDto
    );
    expect(dto).toBeInstanceOf(GeneratePdfDto);
    expect(dto.htmlFileDataArray[0].fileName).toBe("hi.pdf");
  });

  it("rejects a request without files or destination", async () => {
    await expect(
      validator.fire({ sourceDisk: "html", pdfVariant: "docs" }, GeneratePdfDto)
    ).rejects.toBeInstanceOf(ValidationFailed);
  });
});
