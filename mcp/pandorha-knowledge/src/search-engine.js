import Fuse from "fuse.js";
import { walkMarkdownFiles, readUtf8File } from "./file-system.js";
import { buildMarkdownSegments } from "./markdown-segments.js";

const KIND_PRIORITY = {
  heading: 0.55,
  table: 0.7,
  section: 1
};

export async function loadKnowledgeIndex(config) {
  const files = await walkMarkdownFiles(config.roots);
  const segments = [];

  for (const filePath of files) {
    const markdown = await readUtf8File(filePath);
    segments.push(...buildMarkdownSegments(filePath, markdown, {
      projectRoot: config.projectRoot,
      maxSegmentChars: config.maxSegmentChars
    }));
  }

  return createSearchEngine(segments, {
    maxSnippetChars: config.maxSnippetChars,
    stats: {
      files: files.length,
      segments: segments.length,
      roots: config.roots
    }
  });
}

export function createSearchEngine(segments, options = {}) {
  const fuse = new Fuse(segments, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.38,
    minMatchCharLength: 2,
    keys: [
      { name: "title", weight: 0.36 },
      { name: "headingsText", weight: 0.28 },
      { name: "content", weight: 0.28 },
      { name: "relativePath", weight: 0.08 }
    ]
  });

  const maxSnippetChars = options.maxSnippetChars || 1400;

  return {
    stats: options.stats || { files: 0, segments: segments.length, roots: [] },
    searchRpgRule(term, searchOptions = {}) {
      const cleanTerm = normalizeTerm(term);
      const limit = clampLimit(searchOptions.limit);

      if (!cleanTerm) {
        return {
          query: term,
          count: 0,
          matches: [],
          warning: "term must contain at least two searchable characters"
        };
      }

      const ranked = fuse.search(cleanTerm, { limit: Math.max(limit * 4, limit) })
        .filter((result) => matchesTokenRequirement(result.item, cleanTerm))
        .map((result) => rankFuseResult(result, cleanTerm, maxSnippetChars))
        .sort((a, b) => a.adjustedScore - b.adjustedScore)
        .filter(uniqueSourceResult())
        .slice(0, limit);

      return {
        query: cleanTerm,
        count: ranked.length,
        index: this.stats,
        matches: ranked.map(({ adjustedScore, ...match }) => ({
          ...match,
          relevance: Number((1 - adjustedScore).toFixed(4))
        }))
      };
    }
  };
}

function rankFuseResult(result, term, maxSnippetChars) {
  const segment = result.item;
  const score = typeof result.score === "number" ? result.score : 1;
  const priority = KIND_PRIORITY[segment.kind] || 1;
  const adjustedScore = Math.min(score * priority, 1);

  return {
    adjustedScore,
    file: segment.relativePath,
    lineStart: segment.lineStart,
    kind: segment.kind,
    title: segment.title,
    headings: segment.headings,
    score: Number(score.toFixed(4)),
    snippet: buildSnippet(segment, term, maxSnippetChars)
  };
}

function uniqueSourceResult() {
  const seen = new Set();

  return (result) => {
    const key = `${result.file}:${result.lineStart}:${result.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}

function buildSnippet(segment, term, maxChars) {
  if (segment.kind === "table" || segment.kind === "heading") {
    return trimToLimit(segment.content, maxChars);
  }

  const lines = segment.content.split("\n");
  const tokens = tokenize(term);
  let bestIndex = 0;
  let bestScore = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const score = scoreLine(lines[index], tokens);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  const start = Math.max(0, bestIndex - 3);
  const end = Math.min(lines.length, bestIndex + 5);
  return trimToLimit(lines.slice(start, end).join("\n"), maxChars);
}

function scoreLine(line, tokens) {
  const normalized = normalizeForSearch(line);
  let score = 0;

  for (const token of tokens) {
    if (normalized.includes(token)) score += token.length;
  }

  if (line.trim().startsWith("|")) score += 2;
  if (line.trim().startsWith("#")) score += 3;
  return score;
}

function matchesTokenRequirement(segment, term) {
  const tokens = tokenize(term);
  if (tokens.length !== 1 || tokens[0].length > 4) return true;

  const haystack = normalizeForSearch([
    segment.title,
    segment.headingsText,
    segment.relativePath,
    segment.content
  ].join(" "));
  const tokenPattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(tokens[0])}(?=[^\\p{L}\\p{N}]|$)`, "u");

  return tokenPattern.test(haystack);
}

function tokenize(term) {
  return normalizeForSearch(term)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTerm(term) {
  return typeof term === "string" ? term.trim() : "";
}

function normalizeForSearch(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function trimToLimit(value, maxChars) {
  const trimmed = value.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars - 3).trimEnd()}...`;
}

function clampLimit(limit) {
  if (!Number.isFinite(limit)) return 5;
  return Math.max(1, Math.min(Math.trunc(limit), 10));
}
