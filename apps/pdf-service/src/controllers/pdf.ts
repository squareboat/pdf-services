import { Controller, Post, Req, Res } from "@nestjs/common";
import { PdfService } from "../services/service";
import {
  RestController,
  Request,
  Response,
  Validate,
  Dto,
} from "libs/boat/src";
import { GeneratePdfDto } from "@libs/pdf-worker";

@Controller()
export class PdfGeneratorController extends RestController {
  constructor(private readonly service: PdfService) {
    super();
  }

  @Post("pdf/generate")
  @Validate(GeneratePdfDto)
  async generatePdf(
    @Req() req: Request,
    @Res() res: Response,
    @Dto() dto: GeneratePdfDto
  ): Promise<Response> {
    const data = await this.service.generatePdf(dto);
    return res.success(data);
  }
}
