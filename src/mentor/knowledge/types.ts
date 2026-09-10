export type KnowledgeDocumentId = string;

export type KnowledgeDocumentKind = "note" | "reference" | "exercise" | "concept";

export interface KnowledgeDocument {
  id: KnowledgeDocumentId;
  kind: KnowledgeDocumentKind;
  title: string;
  relativePath: string;
  tags: string[];
  updatedAt?: string;
  content?: string;
}

export interface KnowledgeDocumentSummary {
  id: KnowledgeDocumentId;
  kind: KnowledgeDocumentKind;
  title: string;
  relativePath: string;
  tags: string[];
  updatedAt?: string;
}

export interface MentorKnowledgeContext {
  documents: KnowledgeDocument[];
  generatedAt: string;
  source: "obsidian";
}

export interface KnowledgeSelectionCriteria {
  challengeId?: string;
  tags?: string[];
  kinds?: KnowledgeDocumentKind[];
  maxDocuments?: number;
}
