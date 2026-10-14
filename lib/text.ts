export type TextStats = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  speakingMinutes: number;
};

export function analyzeText(text: string): TextStats {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed
    ? (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).filter((part) => part.trim()).length
    : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((part) => part.trim()).length : 0;
  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingMinutes: words / 200,
    speakingMinutes: words / 130,
  };
}

function tokenize(input: string): string[] {
  return input
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function capitalize(word: string): string {
  if (!word) return word;
  const [first, ...rest] = Array.from(word);
  return `${first?.toUpperCase() ?? ""}${rest.join("").toLowerCase()}`;
}

export function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/(^|[\s\-_./([{])(\p{L})/gu, (_match, separator: string, char: string) => {
      return `${separator}${char.toUpperCase()}`;
    });
}

export function toSentenceCase(input: string): string {
  const lower = input.toLowerCase();
  return lower.replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (match) => match.toUpperCase());
}

export function toAlternatingCase(input: string): string {
  let letterIndex = 0;
  return Array.from(input)
    .map((char) => {
      if (!/\p{L}/u.test(char)) return char;
      const next = letterIndex % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
      letterIndex += 1;
      return next;
    })
    .join("");
}

export function toCamelCase(input: string): string {
  return tokenize(input)
    .map((word, index) => (index === 0 ? word.toLowerCase() : capitalize(word)))
    .join("");
}

export function toPascalCase(input: string): string {
  return tokenize(input).map((word) => capitalize(word)).join("");
}

export function toSnakeCase(input: string): string {
  return tokenize(input)
    .map((word) => word.toLowerCase())
    .join("_");
}

export function toKebabCase(input: string): string {
  return tokenize(input)
    .map((word) => word.toLowerCase())
    .join("-");
}

export function toConstantCase(input: string): string {
  return tokenize(input)
    .map((word) => word.toUpperCase())
    .join("_");
}

export const caseActions = [
  { id: "upper", label: "UPPERCASE", apply: (value: string) => value.toUpperCase() },
  { id: "lower", label: "lowercase", apply: (value: string) => value.toLowerCase() },
  { id: "title", label: "Title Case", apply: toTitleCase },
  { id: "sentence", label: "Sentence case", apply: toSentenceCase },
  { id: "camel", label: "camelCase", apply: toCamelCase },
  { id: "pascal", label: "PascalCase", apply: toPascalCase },
  { id: "snake", label: "snake_case", apply: toSnakeCase },
  { id: "kebab", label: "kebab-case", apply: toKebabCase },
  { id: "constant", label: "CONSTANT_CASE", apply: toConstantCase },
  { id: "alt", label: "aLtErNaTiNg", apply: toAlternatingCase },
] as const;
