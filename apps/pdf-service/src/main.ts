import type { Handler, Context } from "aws-lambda";
import { Server } from "http";
import { createServer, proxy } from "aws-serverless-express";
import { eventContext } from "aws-serverless-express/middleware";

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";
import { PDFGeneratorModule } from "./module";
import { AttachHelpersGuard } from "@libs/boat";

const binaryMimeTypes: string[] = [];

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const nestApp = await NestFactory.create<NestExpressApplication>(
      PDFGeneratorModule,
      new ExpressAdapter()
    );
    nestApp.useBodyParser("json", {
      limit: nestApp.get(ConfigService).get<string>("pdf.maxBodySize"),
    });
    nestApp.useGlobalGuards(new AttachHelpersGuard());
    nestApp.use(eventContext());
    await nestApp.init();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedServer = createServer(expressApp, undefined, binaryMimeTypes);
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  cachedServer = await bootstrapServer();
  return proxy(cachedServer, event, context, "PROMISE").promise;
};
