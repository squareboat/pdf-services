import { Injectable } from "@nestjs/common";
import { GeneratePdf } from "./tasks/generatePdf";
import { CompressPdf } from "./tasks/compressPdf";
import { GeneratePdfDto } from "./dto";

@Injectable()
export class PDFWorkerService {
  constructor(
    public readonly generatePdfTask: GeneratePdf,
    public readonly compressPdfTask: CompressPdf
  ) {}

  async generateFromHtml(dto: GeneratePdfDto): Promise<string[]> {
    const { htmlFileDataArray } = dto;
    let urlArr = [];

    for (const htmlData of htmlFileDataArray) {
      dto["html"] = htmlData.html;
      const buffer = await this.generatePdfTask.handle(dto);
      const url = await this.generatePdfTask.storePdf(
        dto.destination,
        htmlData.fileName,
        buffer
      );
      urlArr.push(url);
    }

    return urlArr;
  }

  async compress(
    pdfBuffer: Buffer,
    quality: number
  ): Promise<string | void | Buffer> {
    return this.compressPdfTask.handle(pdfBuffer, quality);
  }
}
