import { Module } from "@nestjs/common";
import { PdfGeneratorController } from "./controllers/pdf";
import { PdfService } from "./services/service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PDFGeneratorLibModule } from "@libs/pdf-worker";
import { BoatModule } from "libs/boat/src";
import { ConsoleModule } from "@squareboat/nest-console";

@Module({
  imports: [
    PDFGeneratorLibModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get("pdf.moduleSettings"),
      inject: [ConfigService],
    }),
    BoatModule,
    ConsoleModule,
  ],
  controllers: [PdfGeneratorController],
  providers: [PdfService],
})
export class PDFGeneratorModule {}
