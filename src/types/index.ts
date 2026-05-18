export interface AuthPayload {
  userId: string;
  role: "ADMIN" | "EMPLOYEE";
  department: string | null;
  email: string;
}

export interface ChunkedText {
  text: string;
  chunkIndex: number;
}

export interface RawChunk {
  _id: { $oid: string };
  text: string;
  score: number;
  documentId: { $oid: string };
  chunkIndex: number;
}

export interface ToolDraft {
  draftType: string;
  content: Record<string, unknown>;
}
