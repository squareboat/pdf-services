import { GeneratePdfDto, PDFWorkerService } from "@libs/pdf-worker";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PdfService {
  constructor(private lib: PDFWorkerService) {}

  async generatePdf(inputs: GeneratePdfDto): Promise<string[]> {
    return await this.lib.generateFromHtml(inputs);
  }
}
