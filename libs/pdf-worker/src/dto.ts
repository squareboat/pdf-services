import {
  ArrayNotEmpty,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class S3ConfigDto {
  @IsNotEmpty()
  @IsString()
  path!: string;
}

export class GeneratePdfDto {
  @IsIn(["html", "s3"])
  sourceDisk!: "html" | "s3";

  @IsOptional()
  @IsString()
  html!: string;

  @IsOptional()
  @IsString()
  footer!: string;

  @ValidateNested({ each: true })
  @IsNotEmpty()
  @ArrayNotEmpty()
  @Type(() => HtmlFileDataDto)
  htmlFileDataArray!: HtmlFileDataDto[];

  @ValidateNested()
  @IsNotEmpty()
  @ValidateIf((o) => o.sourceDisk === "s3")
  @Type(() => S3ConfigDto)
  s3!: S3ConfigDto;

  @IsOptional()
  @ValidateIf((o) => o.sourceDisk === "s3")
  htmlInputs!: Record<string, any>;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => S3ConfigDto)
  destination!: S3ConfigDto;

  @IsString()
  pdfVariant!: string;
}

export class HtmlFileDataDto {
  @IsString()
  @IsNotEmpty()
  html!: string;

  @IsString()
  @IsNotEmpty()
  fileName!: string;
}
