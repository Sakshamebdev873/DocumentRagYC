import { AuthPayload } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

declare module "pdf-parse" {
  export class PDFParse {
    constructor(options: { data: Buffer | Uint8Array | string });
    getText(params?: object): Promise<{ text: string; total: number }>;
  }
}
