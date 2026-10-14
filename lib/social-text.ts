const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";

type Alphabet = {
  upper?: number | readonly number[];
  lower?: number | readonly number[];
  digit?: number | readonly number[];
  space?: string;
  mark?: string;
};

function range(start: number, length: number, holes: Record<number, number> = {}): number[] {
  return Array.from({ length }, (_, index) => holes[index] ?? start + index);
}

function glyph(char: string, codes: number | readonly number[] | undefined, alphabet: string): string | null {
  if (codes === undefined) return null;
  const index = alphabet.indexOf(char);
  if (index < 0) return null;
  const code = typeof codes === "number" ? codes + index : codes[index];
  return code === undefined ? char : String.fromCodePoint(code);
}

export function stylize(text: string, alphabet: Alphabet): string {
  const styled = Array.from(text)
    .map((char) => {
      if (char === " " && alphabet.space) return alphabet.space;
      return (
        glyph(char, alphabet.upper, UPPER) ??
        glyph(char, alphabet.lower, LOWER) ??
        glyph(char, alphabet.digit, DIGITS) ??
        char
      );
    })
    .join("");

  if (!alphabet.mark) return styled;
  return Array.from(styled)
    .map((char) => (char === "\n" || char.trim() === "" ? char : `${char}${alphabet.mark}`))
    .join("");
}

const scriptUpper = [
  0x1d49c, 0x212c, 0x1d49e, 0x1d49f, 0x2130, 0x2131, 0x1d4a2, 0x210b, 0x2110, 0x1d4a5, 0x1d4a6, 0x2112, 0x2133,
  0x1d4a9, 0x1d4aa, 0x1d4ab, 0x1d4ac, 0x211b, 0x1d4ae, 0x1d4af, 0x1d4b0, 0x1d4b1, 0x1d4b2, 0x1d4b3, 0x1d4b4, 0x1d4b5,
] as const;

const scriptLower = [
  0x1d4b6, 0x1d4b7, 0x1d4b8, 0x1d4b9, 0x212f, 0x1d4bb, 0x210a, 0x1d4bd, 0x1d4be, 0x1d4bf, 0x1d4c0, 0x1d4c1, 0x1d4c2,
  0x1d4c3, 0x2134, 0x1d4c5, 0x1d4c6, 0x1d4c7, 0x1d4c8, 0x1d4c9, 0x1d4ca, 0x1d4cb, 0x1d4cc, 0x1d4cd, 0x1d4ce, 0x1d4cf,
] as const;

const frakturUpper = [
  0x1d504, 0x1d505, 0x212d, 0x1d507, 0x1d508, 0x1d509, 0x1d50a, 0x210c, 0x2111, 0x1d50d, 0x1d50e, 0x1d50f, 0x1d510,
  0x1d511, 0x1d512, 0x1d513, 0x1d514, 0x211c, 0x1d516, 0x1d517, 0x1d518, 0x1d519, 0x1d51a, 0x1d51b, 0x1d51c, 0x1d51d,
] as const;

const doubleUpper = [
  0x1d538, 0x1d539, 0x2102, 0x1d53b, 0x1d53c, 0x1d53d, 0x1d53e, 0x210d, 0x1d540, 0x1d541, 0x1d542, 0x1d543, 0x1d544,
  0x2115, 0x1d546, 0x2119, 0x211a, 0x211d, 0x1d54a, 0x1d54b, 0x1d54c, 0x1d54d, 0x1d54e, 0x1d54f, 0x1d550, 0x2124,
] as const;

const circledDigits = [0x24ea, 0x2460, 0x2461, 0x2462, 0x2463, 0x2464, 0x2465, 0x2466, 0x2467, 0x2468] as const;

const smallCaps = [
  0x1d00, 0x0299, 0x1d04, 0x1d05, 0x1d07, 0xa730, 0x0262, 0x029c, 0x026a, 0x1d0a, 0x1d0b, 0x029f, 0x1d0d, 0x0274,
  0x1d0f, 0x1d18, 0x01eb, 0x0280, 0xa731, 0x1d1b, 0x1d1c, 0x1d20, 0x1d21, 0x0078, 0x028f, 0x1d22,
] as const;

const upsideDown: Record<string, string> = {
  a: "ɐ",
  b: "q",
  c: "ɔ",
  d: "p",
  e: "ǝ",
  f: "ɟ",
  g: "ƃ",
  h: "ɥ",
  i: "ᴉ",
  j: "ɾ",
  k: "ʞ",
  l: "l",
  m: "ɯ",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "ɹ",
  s: "s",
  t: "ʇ",
  u: "n",
  v: "ʌ",
  w: "ʍ",
  x: "x",
  y: "ʎ",
  z: "z",
  A: "∀",
  B: "q",
  C: "Ɔ",
  D: "p",
  E: "Ǝ",
  F: "Ⅎ",
  G: "פ",
  H: "H",
  I: "I",
  J: "ſ",
  K: "ʞ",
  L: "˥",
  M: "W",
  N: "N",
  O: "O",
  P: "Ԁ",
  Q: "Q",
  R: "ɹ",
  S: "S",
  T: "┴",
  U: "∩",
  V: "Λ",
  W: "M",
  X: "X",
  Y: "⅄",
  Z: "Z",
  "0": "0",
  "1": "Ɩ",
  "2": "ᄅ",
  "3": "Ɛ",
  "4": "ㄣ",
  "5": "ϛ",
  "6": "9",
  "7": "ㄥ",
  "8": "8",
  "9": "6",
  "?": "¿",
  "!": "¡",
  ".": "˙",
  ",": "'",
  "'": ",",
  '"': "„",
  "(": ")",
  ")": "(",
  "[": "]",
  "]": "[",
  "{": "}",
  "}": "{",
  "<": ">",
  ">": "<",
  "&": "⅋",
};

export function flipText(text: string): string {
  return Array.from(text)
    .reverse()
    .map((char) => upsideDown[char] ?? char)
    .join("");
}

export const textStyles = [
  { id: "bold", label: "Bold", sample: "Bold", apply: (value: string) => stylize(value, { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce }) },
  { id: "italic", label: "Italic", sample: "Italic", apply: (value: string) => stylize(value, { upper: 0x1d434, lower: range(0x1d44e, 26, { 7: 0x210e }) }) },
  { id: "bold-italic", label: "Bold italic", sample: "Bold italic", apply: (value: string) => stylize(value, { upper: 0x1d468, lower: 0x1d482, digit: 0x1d7ce }) },
  { id: "script", label: "Script", sample: "Script", apply: (value: string) => stylize(value, { upper: scriptUpper, lower: scriptLower }) },
  { id: "bold-script", label: "Bold script", sample: "Script", apply: (value: string) => stylize(value, { upper: 0x1d4d0, lower: 0x1d4ea }) },
  { id: "fraktur", label: "Fraktur", sample: "Fraktur", apply: (value: string) => stylize(value, { upper: frakturUpper, lower: 0x1d51e }) },
  { id: "mono", label: "Monospace", sample: "Mono", apply: (value: string) => stylize(value, { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 }) },
  { id: "sans-bold", label: "Sans bold", sample: "Sans", apply: (value: string) => stylize(value, { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec }) },
  { id: "double", label: "Double struck", sample: "Double", apply: (value: string) => stylize(value, { upper: doubleUpper, lower: 0x1d552, digit: 0x1d7d8 }) },
  { id: "fullwidth", label: "Fullwidth", sample: "Wide", apply: (value: string) => stylize(value, { upper: 0xff21, lower: 0xff41, digit: 0xff10, space: "\u3000" }) },
  { id: "circled", label: "Circled", sample: "Circle", apply: (value: string) => stylize(value, { upper: 0x24b6, lower: 0x24d0, digit: circledDigits }) },
  { id: "small-caps", label: "Small caps", sample: "Small", apply: (value: string) => stylize(value, { upper: smallCaps, lower: smallCaps }) },
  { id: "strike", label: "Strikethrough", sample: "Strike", apply: (value: string) => stylize(value, { mark: "\u0336" }) },
  { id: "underline", label: "Underline", sample: "Line", apply: (value: string) => stylize(value, { mark: "\u0332" }) },
  { id: "flip", label: "Upside down", sample: "Flip", apply: flipText },
] as const;

export type TextStyleId = (typeof textStyles)[number]["id"];
