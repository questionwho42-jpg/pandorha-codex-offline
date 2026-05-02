import path from "node:path";

const HEADING_PATTERN = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const TABLE_SEPARATOR_PATTERN = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

export function buildMarkdownSegments(filePath, markdown, options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const maxSegmentChars = options.maxSegmentChars || 2800;
  const relativePath = toPosixPath(path.relative(projectRoot, filePath));
  const rootKind = relativePath.split("/")[0] || "unknown";
  const lines = stripFrontmatter(normalizeNewlines(markdown).split("\n"));
  const segments = [];
  const headings = [];

  let sectionLines = [];
  let sectionStartLine = 1;

  const flushSection = (lineEnd) => {
    const content = sanitizeContent(trimBlock(sectionLines.join("\n")));
    if (!content || !isUsefulSection(content)) {
      sectionLines = [];
      sectionStartLine = lineEnd + 1;
      return;
    }

    pushChunks(segments, {
      kind: "section",
      filePath,
      relativePath,
      rootKind,
      lineStart: sectionStartLine,
      title: lastHeading(headings) || relativePath,
      headings: compactHeadings(headings),
      content,
      maxSegmentChars
    });

    sectionLines = [];
    sectionStartLine = lineEnd + 1;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = parseHeading(line);

    if (heading) {
      flushSection(index);
      headings.length = heading.level - 1;
      headings[heading.level - 1] = heading.title;

      segments.push(makeSegment({
        kind: "heading",
        filePath,
        relativePath,
        rootKind,
        lineStart: index + 1,
        title: heading.title,
        headings: compactHeadings(headings),
        content: buildHeadingPreview(lines, index)
      }));

      sectionStartLine = index + 1;
      sectionLines = [line];
      continue;
    }

    if (isTableStart(lines, index)) {
      flushSection(index);
      const { tableLines, nextIndex } = collectTable(lines, index);

      segments.push(makeSegment({
        kind: "table",
        filePath,
        relativePath,
        rootKind,
        lineStart: index + 1,
        title: lastHeading(headings) || relativePath,
        headings: compactHeadings(headings),
        content: tableLines.join("\n")
      }));

      index = nextIndex - 1;
      sectionStartLine = nextIndex + 1;
      sectionLines = [];
      continue;
    }

    if (sectionLines.length === 0) {
      sectionStartLine = index + 1;
    }

    sectionLines.push(line);
  }

  flushSection(lines.length);
  return segments;
}

function pushChunks(segments, source) {
  for (const chunk of splitLargeBlock(source.content, source.maxSegmentChars)) {
    segments.push(makeSegment({ ...source, content: chunk }));
  }
}

function makeSegment(source) {
  return {
    id: `${source.relativePath}:${source.lineStart}:${source.kind}:${hashFragment(source.content)}`,
    kind: source.kind,
    filePath: source.filePath,
    relativePath: source.relativePath,
    rootKind: source.rootKind,
    lineStart: source.lineStart,
    title: source.title,
    headings: source.headings,
    headingsText: source.headings.join(" > "),
    content: source.content
  };
}

function parseHeading(line) {
  const match = line.match(HEADING_PATTERN);
  if (!match) return null;

  return {
    level: match[1].length,
    title: match[2].trim()
  };
}

function isTableStart(lines, index) {
  const line = lines[index]?.trim() || "";
  const nextLine = lines[index + 1]?.trim() || "";

  return line.includes("|") && TABLE_SEPARATOR_PATTERN.test(nextLine);
}

function collectTable(lines, startIndex) {
  const tableLines = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim().includes("|")) break;
    tableLines.push(line);
    index += 1;
  }

  return { tableLines, nextIndex: index };
}

function buildHeadingPreview(lines, index) {
  const preview = [lines[index]];

  for (let cursor = index + 1; cursor < lines.length && preview.length < 5; cursor += 1) {
    const line = lines[cursor];
    if (parseHeading(line)) break;
    if (isTableStart(lines, cursor)) break;
    if (isMetadataLine(line)) continue;
    if (!line.trim()) continue;
    preview.push(line);
  }

  return preview.join("\n");
}

function splitLargeBlock(content, maxChars) {
  if (content.length <= maxChars) return [content];

  const chunks = [];
  const paragraphs = content.split(/\n{2,}/);
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current);
    current = paragraph.length > maxChars ? paragraph.slice(0, maxChars) : paragraph;
  }

  if (current) chunks.push(current);
  return chunks;
}

function isUsefulSection(content) {
  const withoutHeadings = content
    .split("\n")
    .filter((line) => !parseHeading(line))
    .join("\n")
    .trim();

  return withoutHeadings.length >= 24;
}

function compactHeadings(headings) {
  return headings.filter(Boolean);
}

function lastHeading(headings) {
  return compactHeadings(headings).at(-1);
}

function trimBlock(value) {
  return value.replace(/^\s+|\s+$/g, "");
}

function sanitizeContent(value) {
  return value
    .split("\n")
    .filter((line) => !isMetadataLine(line))
    .join("\n")
    .trim();
}

function stripFrontmatter(lines) {
  if (lines[0]?.trim() !== "---") return lines;

  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return lines;

  return lines.map((line, index) => (index <= endIndex ? "" : line));
}

function isMetadataLine(line) {
  return /^<\/?(ai_context|metadata|context)\b/i.test(line.trim());
}

function normalizeNewlines(value) {
  return value.replace(/\r\n?/g, "\n");
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function hashFragment(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16);
}
