import {
  isKnowledgeDocumentValid,
  MAX_KNOWLEDGE_DOCUMENTS,
} from "./policy";
import type {
  KnowledgeDocument,
  KnowledgeSelectionCriteria,
} from "./types";

function matchesChallenge(document: KnowledgeDocument, challengeId: string): boolean {
  return document.tags.includes(challengeId) || document.tags.includes(`challenge:${challengeId}`);
}

export function selectKnowledgeDocuments(
  candidates: readonly KnowledgeDocument[],
  criteria: KnowledgeSelectionCriteria = {},
): KnowledgeDocument[] {
  const maxDocuments = Math.min(
    criteria.maxDocuments ?? MAX_KNOWLEDGE_DOCUMENTS,
    MAX_KNOWLEDGE_DOCUMENTS,
  );
  if (maxDocuments <= 0) return [];

  return candidates
    .filter(isKnowledgeDocumentValid)
    .filter((document) =>
      criteria.challengeId ? matchesChallenge(document, criteria.challengeId) : true,
    )
    .filter((document) =>
      criteria.tags?.length
        ? criteria.tags.every((tag) => document.tags.includes(tag))
        : true,
    )
    .filter((document) =>
      criteria.kinds?.length ? criteria.kinds.includes(document.kind) : true,
    )
    .slice(0, maxDocuments)
    .map((document) => ({
      ...document,
      tags: [...document.tags],
    }));
}
