export type ProcessingMode = "client" | "ai" | "hybrid";

export type ToolCategorySlug =
  | "documents"
  | "text-writing"
  | "image-media"
  | "dev-data"
  | "calculators";

export type IconName =
  | "FileText"
  | "Files"
  | "Table"
  | "Type"
  | "Italic"
  | "CaseSensitive"
  | "SpellCheck"
  | "Eraser"
  | "Scaling"
  | "AudioLines"
  | "Braces"
  | "Binary"
  | "FileJson"
  | "Cake"
  | "ArrowLeftRight"
  | "QrCode"
  | "Image"
  | "Calculator"
  | "Mail"
  | "Sparkles"
  | "PenLine"
  | "Percent";

export type Faq = {
  q: string;
  a: string;
};

export type ToolDefinition = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: ToolCategorySlug;
  icon: IconName;
  processing: ProcessingMode;
  keywords: string[];
  steps: string[];
  faqs: Faq[];
  homeOrder: number;
  href: string;
};

export type CategoryDefinition = {
  slug: ToolCategorySlug;
  name: string;
  summary: string;
  description: string;
  icon: IconName;
  href: string;
  tone: string;
};

export const categories: CategoryDefinition[] = [
  {
    slug: "documents",
    name: "Documents",
    summary: "Swap between PDF and Word, or pull text into CSV.",
    description:
      "Document utilities for turning a PDF into Word, a Word file into a PDF, and extracting a text layer into CSV. The work runs in your browser.",
    icon: "Files",
    href: "/documents",
    tone: "bg-violet-500/15 text-violet-800 dark:bg-violet-400/15 dark:text-violet-100",
  },
  {
    slug: "text-writing",
    name: "Text & Writing",
    summary: "Count, style captions, and draft with AI.",
    description:
      "Writing utilities for live word counts, case conversion, Unicode caption styles, email drafts, prompt expansion, and an optional grammar pass. Counting, casing, and styling stay in the page. AI runs only after you press the button.",
    icon: "Type",
    href: "/text-writing",
    tone: "bg-sky-400/20 text-sky-800 dark:bg-sky-400/15 dark:text-sky-100",
  },
  {
    slug: "image-media",
    name: "Image & Media",
    summary: "Resize images, sign, cut audio, and remove backgrounds.",
    description:
      "Media utilities for cropping and exporting images, drawing a transparent signature, trimming audio, and removing a background in the browser.",
    icon: "Image",
    href: "/image-media",
    tone: "bg-white/70 text-violet-900 dark:bg-white/10 dark:text-white",
  },
  {
    slug: "dev-data",
    name: "Dev & Data",
    summary: "Format JSON, convert CSV, and encode Base64.",
    description:
      "Developer utilities for validating JSON, converting CSV into JSON, and encoding or decoding Base64. Parsing stays in the browser.",
    icon: "Braces",
    href: "/dev-data",
    tone: "bg-violet-500/10 text-violet-900 dark:bg-violet-300/10 dark:text-violet-100",
  },
  {
    slug: "calculators",
    name: "Calculators",
    summary: "Age, units, currency, percentages, and QR codes.",
    description:
      "Everyday calculators for exact age and date spans, unit and live currency conversion, percentages and margins, and QR codes rendered locally on a canvas.",
    icon: "Calculator",
    href: "/calculators",
    tone: "bg-sky-500/15 text-sky-950 dark:bg-sky-300/10 dark:text-sky-100",
  },
];

export const tools: ToolDefinition[] = [
  {
    slug: "pdf-to-word",
    name: "PDF to Word & Word to PDF",
    summary: "One converter. Swap between PDF to Word and Word to PDF.",
    description:
      "Convert in either direction from a single panel. PDF to Word reads the text layer in your browser, with an optional server fallback. Word to PDF turns .docx paragraphs into a PDF locally.",
    category: "documents",
    icon: "FileText",
    processing: "hybrid",
    keywords: ["pdf to word", "word to pdf", "pdf to docx", "docx to pdf", "convert pdf"],
    steps: [
      "Leave the arrow on PDF to Word, or press swap for Word to PDF.",
      "Drop the matching file into the panel.",
      "Press convert and download the other format.",
    ],
    faqs: [
      {
        q: "Does this upload my file?",
        a: "Both directions run in the browser. The server route runs only if you press the PDF to Word fallback.",
      },
      {
        q: "Will scanned PDFs convert?",
        a: "Only PDFs with a real text layer produce text. A scan that is just an image needs OCR, which this tool does not run.",
      },
      {
        q: "Does Word to PDF keep the layout?",
        a: "It keeps the paragraph text in reading order. Images, columns, and exact fonts are not copied.",
      },
    ],
    homeOrder: 1,
    href: "/documents/pdf-to-word",
  },
  {
    slug: "pdf-to-csv",
    name: "PDF to CSV",
    summary: "Pull text rows out of a PDF into CSV.",
    description:
      "Extract positioned text from a PDF and download it as CSV. Column gaps are inferred from the text layer, entirely in your browser.",
    category: "documents",
    icon: "Table",
    processing: "client",
    keywords: ["pdf to csv", "pdf table", "extract table", "pdf to excel"],
    steps: [
      "Drop a text-based PDF.",
      "Choose whether to include a page column.",
      "Download the CSV and open it in a spreadsheet.",
    ],
    faqs: [
      {
        q: "How are columns detected?",
        a: "Text items are grouped into rows by vertical position and split into cells when a wide horizontal gap appears.",
      },
      {
        q: "Does it work on scanned tables?",
        a: "No. The PDF needs a text layer. Image-only scans do not contain extractable cells.",
      },
      {
        q: "Is the file uploaded?",
        a: "No. pdf.js reads the document locally and the CSV is built in memory.",
      },
    ],
    homeOrder: 12,
    href: "/documents/pdf-to-csv",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    summary: "Live word, character, and reading-time counts.",
    description:
      "Count words, characters, sentences, paragraphs, and reading time as you type. The text never leaves your browser.",
    category: "text-writing",
    icon: "Type",
    processing: "client",
    keywords: ["word counter", "character count", "reading time", "sentence count"],
    steps: [
      "Paste or type into the editor.",
      "Read the live counts above the text.",
      "Copy the text when you are done. Nothing is stored.",
    ],
    faqs: [
      {
        q: "What counts as a word?",
        a: "Words are splits on whitespace. A hyphenated term stays one word.",
      },
      {
        q: "How is reading time calculated?",
        a: "Reading time uses 200 words per minute. Speaking time uses 130 words per minute.",
      },
      {
        q: "Is my draft saved?",
        a: "No. The text lives only in this tab and disappears when you leave or reload.",
      },
    ],
    homeOrder: 2,
    href: "/text-writing/word-counter",
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    summary: "Switch text between common case styles.",
    description:
      "Convert text to sentence case, title case, camelCase, snake_case, kebab-case, and more. Conversion is instant and local.",
    category: "text-writing",
    icon: "CaseSensitive",
    processing: "client",
    keywords: ["case converter", "camel case", "snake case", "title case", "uppercase"],
    steps: [
      "Paste the text you want to transform.",
      "Pick a case style.",
      "Copy the result from the output box.",
    ],
    faqs: [
      {
        q: "Will this change my original?",
        a: "The input stays put. Each style writes into the output panel.",
      },
      {
        q: "How are camelCase and snake_case split?",
        a: "Words are split on spaces, punctuation, and existing camelCase boundaries, then rejoined in the target style.",
      },
      {
        q: "Does it support letters beyond English?",
        a: "Yes. Casing uses Unicode letter detection, so accented letters are preserved.",
      },
    ],
    homeOrder: 8,
    href: "/text-writing/case-converter",
  },
  {
    slug: "social-text",
    name: "Social Text Styler",
    summary: "Bold, italic, and fancy caption styles you can paste.",
    description:
      "Turn a caption into bold, italic, script, monospace, and other Unicode styles. Copy the result straight into Instagram, X, TikTok, Facebook, or WhatsApp. Styling stays in your browser.",
    category: "text-writing",
    icon: "Italic",
    processing: "client",
    keywords: [
      "bold text",
      "italic text",
      "instagram fonts",
      "fancy text",
      "unicode text",
      "social media caption",
      "strikethrough text",
    ],
    steps: [
      "Type or paste the caption.",
      "Pick bold, italic, script, or another style.",
      "Copy the line and paste it into the social app.",
    ],
    faqs: [
      {
        q: "Why does this look like bold if it is still plain text?",
        a: "Social apps do not accept rich text in captions. These styles use Unicode letters that already look bold, italic, or script.",
      },
      {
        q: "Where can I paste it?",
        a: "Anywhere that accepts Unicode: Instagram, X, TikTok, Facebook, LinkedIn, Discord, and WhatsApp.",
      },
      {
        q: "Does the caption get uploaded?",
        a: "No. The conversion runs in the page and the copy goes to your clipboard.",
      },
    ],
    homeOrder: 3,
    href: "/text-writing/social-text",
  },
  {
    slug: "ai-grammar-fixer",
    name: "AI Grammar Fixer",
    summary: "Rewrite grammar when you press Fix.",
    description:
      "Send a passage to a grammar model only when you press Fix. The text stays in the editor until that moment, and the correction comes back for you to copy.",
    category: "text-writing",
    icon: "SpellCheck",
    processing: "ai",
    keywords: ["grammar checker", "spell check", "proofread", "ai writing"],
    steps: [
      "Paste the sentence or paragraph.",
      "Press Fix grammar to send that text to the model.",
      "Copy the correction or replace your draft with it.",
    ],
    faqs: [
      {
        q: "When does text leave my browser?",
        a: "Only after you press Fix grammar. Typing alone does not send anything.",
      },
      {
        q: "Which model runs?",
        a: "The server proxies a Hugging Face grammar model. The deployment owner sets the token and can override the model id.",
      },
      {
        q: "Is there a length limit?",
        a: "Yes. Requests are limited to 4,000 characters so the model response stays predictable.",
      },
    ],
    homeOrder: 15,
    href: "/text-writing/ai-grammar-fixer",
  },
  {
    slug: "remove-background",
    name: "Remove Background",
    summary: "Cut out a subject in the browser and download a transparent PNG.",
    description:
      "Remove an image background on your device with the ISNet model. The first run downloads the model into the browser cache. Preview the cutout on a checkerboard and download a PNG.",
    category: "image-media",
    icon: "Eraser",
    processing: "client",
    keywords: ["remove background", "background remover", "transparent png", "cutout"],
    steps: [
      "Drop a JPG, PNG, or WebP up to 8 MB and 4,096 pixels on the long side.",
      "Press Remove background. The first run downloads the model and shows progress.",
      "Download the transparent PNG. The photo stays on this device.",
    ],
    faqs: [
      {
        q: "Is the image uploaded?",
        a: "No. The photo is decoded and processed in your browser. The page downloads the model and WebAssembly runtime, and the browser caches them for the next run.",
      },
      {
        q: "What file do I get back?",
        a: "A PNG with transparency, so you can place the subject on another background.",
      },
      {
        q: "Which model runs, and under what license?",
        a: "The tool uses @imgly/background-removal 1.7.0 with the ISNet FP16 model. The library is AGPL-3.0 and the model weights are MIT. Source links are on the tool and the licenses page.",
      },
    ],
    homeOrder: 3,
    href: "/image-media/remove-background",
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    summary: "Crop and export PNG, JPEG, or WebP.",
    description:
      "Resize and crop an image with the canvas in your browser. Lock the aspect ratio, drag a crop, and download PNG, JPEG, or WebP.",
    category: "image-media",
    icon: "Scaling",
    processing: "client",
    keywords: ["image resizer", "crop image", "resize image", "webp converter"],
    steps: [
      "Drop an image to preview it.",
      "Drag a crop on the preview and set the output size.",
      "Choose a format and download the result.",
    ],
    faqs: [
      {
        q: "Does resizing upload the photo?",
        a: "No. The browser decodes the image and draws the export on a canvas.",
      },
      {
        q: "How do I crop?",
        a: "Drag across the preview. Reset crop returns to the full frame. Output width and height then scale that selection.",
      },
      {
        q: "What is the size limit?",
        a: "Output width and height are capped at 8,000 pixels to keep the tab responsive.",
      },
    ],
    homeOrder: 6,
    href: "/image-media/image-resizer",
  },
  {
    slug: "audio-cutter",
    name: "Audio Cutter",
    summary: "Trim audio and download a WAV instantly.",
    description:
      "Trim audio in the browser, preview the selection, and download a WAV. An MP3 encoder downloads only if you ask for MP3.",
    category: "image-media",
    icon: "AudioLines",
    processing: "client",
    keywords: ["audio cutter", "trim mp3", "audio trimmer", "cut audio"],
    steps: [
      "Drop an audio file the browser can decode.",
      "Set the start and end on the waveform or the sliders.",
      "Download WAV immediately, or export MP3 to load the encoder.",
    ],
    faqs: [
      {
        q: "Is ffmpeg loaded up front?",
        a: "No. Trimming uses the Web Audio API and writes a WAV locally. ffmpeg.wasm loads only when you press Export MP3.",
      },
      {
        q: "Which formats can I open?",
        a: "Anything your browser can decode, commonly MP3, WAV, OGG, M4A, and FLAC.",
      },
      {
        q: "Does export upload the audio?",
        a: "No. MP3 encoding runs in a local WASM module after that module has downloaded.",
      },
    ],
    homeOrder: 10,
    href: "/image-media/audio-cutter",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    summary: "Format, minify, and validate JSON.",
    description:
      "Pretty-print or minify JSON and see the exact line where invalid syntax fails. Parsing happens entirely in your browser.",
    category: "dev-data",
    icon: "Braces",
    processing: "client",
    keywords: ["json formatter", "json validator", "minify json", "pretty print json"],
    steps: [
      "Paste JSON into the editor.",
      "Press Format or Minify.",
      "If parsing fails, fix the reported line and try again.",
    ],
    faqs: [
      {
        q: "Is the JSON sent anywhere?",
        a: "No. JSON.parse runs locally in the page.",
      },
      {
        q: "What does the error show?",
        a: "The parser message plus a line and column when the engine reports a position.",
      },
      {
        q: "Can I format JSON with comments?",
        a: "No. Standard JSON does not allow comments or trailing commas.",
      },
    ],
    homeOrder: 4,
    href: "/dev-data/json-formatter",
  },
  {
    slug: "base64-decoder",
    name: "Base64 Encoder",
    summary: "Encode and decode text or files as Base64.",
    description:
      "Encode text and files to Base64 or decode Base64 back to text and a downloadable file. The conversion stays in your browser.",
    category: "dev-data",
    icon: "Binary",
    processing: "client",
    keywords: ["base64 decode", "base64 encode", "base64 converter", "data url"],
    steps: [
      "Choose text or file mode.",
      "Encode to Base64 or paste Base64 to decode.",
      "Copy the text or download the decoded file.",
    ],
    faqs: [
      {
        q: "Do you support data URLs?",
        a: "Yes. A data URL prefix is stripped automatically before decoding.",
      },
      {
        q: "Is this UTF-8 safe?",
        a: "Text encoding uses UTF-8 bytes, so characters outside Latin-1 survive a round trip.",
      },
      {
        q: "Are files uploaded?",
        a: "No. FileReader and the Base64 routines run locally.",
      },
    ],
    homeOrder: 13,
    href: "/dev-data/base64-decoder",
  },
  {
    slug: "csv-to-json",
    name: "CSV to JSON",
    summary: "Turn CSV rows into JSON records.",
    description:
      "Convert CSV into JSON with quoted fields, escaped quotes, and an optional header row. Parsing runs locally and can download the result.",
    category: "dev-data",
    icon: "FileJson",
    processing: "client",
    keywords: ["csv to json", "convert csv", "csv parser", "json converter"],
    steps: [
      "Paste CSV or drop a .csv file.",
      "Keep or ignore the header row.",
      "Copy the JSON or download it.",
    ],
    faqs: [
      {
        q: "Are quoted commas handled?",
        a: "Yes. Fields wrapped in double quotes can contain commas and line breaks. Doubled quotes become a literal quote.",
      },
      {
        q: "What if there is no header?",
        a: "Turn off header row and each record becomes an array of cells instead of an object.",
      },
      {
        q: "Is the CSV uploaded?",
        a: "No. The parser is a local function in the page.",
      },
    ],
    homeOrder: 9,
    href: "/dev-data/csv-to-json",
  },
  {
    slug: "age-calculator",
    name: "Age & Date Difference",
    summary: "Age to the minute, or the span between two dates.",
    description:
      "Calculate an exact age in years, months, days, hours, and minutes, or the weeks, days, hours, and minutes between two moments. The math runs locally.",
    category: "calculators",
    icon: "Cake",
    processing: "client",
    keywords: ["age calculator", "how old am i", "birthday calculator", "date difference", "days between dates"],
    steps: [
      "Choose Age or Date difference.",
      "Enter the birth moment, or a start and end.",
      "Read years through minutes, plus totals in weeks, days, and hours.",
    ],
    faqs: [
      {
        q: "How are months and days counted?",
        a: "Age walks calendar months from the birthday and counts the remaining days, then the leftover hours and minutes. If the clock is earlier than the birth time, it borrows a day.",
      },
      {
        q: "What about February 29?",
        a: "In non-leap years the birthday anniversary lands on February 28.",
      },
      {
        q: "Is the date sent to a server?",
        a: "No. It is calculated in the page from the values you type.",
      },
    ],
    homeOrder: 14,
    href: "/calculators/age-calculator",
  },
  {
    slug: "unit-converter",
    name: "Unit & Currency Converter",
    summary: "Metric, imperial, temperature, storage, and live currency.",
    description:
      "Convert length, mass, temperature, digital storage, time, and area instantly. Currency uses a public USD rate feed when you open that tab. Your amount stays in the browser.",
    category: "calculators",
    icon: "ArrowLeftRight",
    processing: "hybrid",
    keywords: ["unit converter", "cm to inches", "celsius to fahrenheit", "mb to gb", "currency converter", "usd to pkr"],
    steps: [
      "Pick a measurement category, including Currency.",
      "Enter a value and choose the source and target units.",
      "Read the converted value. Swap units with one click.",
    ],
    faqs: [
      {
        q: "Which temperature formula is used?",
        a: "Celsius, Fahrenheit, and Kelvin use the standard affine conversions, not a simple ratio.",
      },
      {
        q: "Are kilobytes decimal or binary?",
        a: "Storage units use powers of 1024, matching how operating systems often display file sizes.",
      },
      {
        q: "Does conversion need a network?",
        a: "Length, mass, temperature, storage, time, and area use factors in the page. Currency fetches public exchange rates and does not upload the amount you type.",
      },
    ],
    homeOrder: 11,
    href: "/calculators/unit-converter",
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    summary: "Draw a QR code and download the PNG.",
    description:
      "Generate a QR code from text or a URL in your browser and download it as a PNG. Colors and size update locally.",
    category: "calculators",
    icon: "QrCode",
    processing: "client",
    keywords: ["qr code generator", "make qr code", "qr png", "url qr"],
    steps: [
      "Type a URL or any text.",
      "Adjust the size and colors.",
      "Download the PNG.",
    ],
    faqs: [
      {
        q: "Is the text sent to a QR service?",
        a: "No. The code is drawn on a canvas by a local encoder.",
      },
      {
        q: "What error correction is used?",
        a: "Level M, which recovers a moderate amount of damage while keeping the code compact.",
      },
      {
        q: "Can I print it?",
        a: "Yes. Download the PNG and print it at the pixel size you chose.",
      },
    ],
    homeOrder: 5,
    href: "/calculators/qr-code-generator",
  },
  {
    slug: "email-generator",
    name: "AI Email Generator",
    summary: "Draft a reply from a few intent bullets.",
    description:
      "Turn short notes into a subject line and email. Choose a purpose and tone, then press Generate. The notes are sent to the model only at that moment.",
    category: "text-writing",
    icon: "Mail",
    processing: "ai",
    keywords: ["email generator", "ai email", "reply template", "professional email", "follow up email"],
    steps: [
      "Pick a purpose and a tone.",
      "List the facts as short bullets.",
      "Press Generate, then copy the draft.",
    ],
    faqs: [
      {
        q: "When do the notes leave this page?",
        a: "Only after you press Generate. The route forwards them to Hugging Face and returns the draft.",
      },
      {
        q: "Will it invent details?",
        a: "The instruction tells the model to use only your notes and to write [Name] when a name is missing. Still read the draft before you send it.",
      },
      {
        q: "What if the model is unavailable?",
        a: "The page shows the error from the proxy, including a missing token or a model that is still warming up.",
      },
    ],
    homeOrder: 16,
    href: "/text-writing/email-generator",
  },
  {
    slug: "prompt-enhancer",
    name: "AI Prompt Enhancer",
    summary: "Expand a rough prompt into structured instructions.",
    description:
      "Rewrite a short prompt into role, goal, context, constraints, output format, and a quality check for a general, coding, image, or research model. The enhancer returns a prompt, not the answer.",
    category: "text-writing",
    icon: "Sparkles",
    processing: "ai",
    keywords: ["prompt enhancer", "prompt engineer", "improve prompt", "llm prompt", "chatgpt prompt"],
    steps: [
      "Choose the kind of model you will paste into.",
      "Write the rough task in a sentence or two.",
      "Press Enhance and copy the structured prompt.",
    ],
    faqs: [
      {
        q: "Does this answer the task?",
        a: "No. It rewrites your request into a clearer prompt you can paste into another model.",
      },
      {
        q: "When is the text sent?",
        a: "Only when you press Enhance. Until then it stays in the editor.",
      },
      {
        q: "Which models is it for?",
        a: "The targets are a general chat model, a coding assistant, an image model, and a research assistant. You still paste the result yourself.",
      },
    ],
    homeOrder: 17,
    href: "/text-writing/prompt-enhancer",
  },
  {
    slug: "signature-generator",
    name: "Signature Generator",
    summary: "Draw or type a signature and save a transparent PNG.",
    description:
      "Draw a signature with a pen, or type a name in a handwritten font, then download a high-resolution PNG with a transparent background. The canvas never leaves the browser.",
    category: "image-media",
    icon: "PenLine",
    processing: "client",
    keywords: ["signature generator", "signature png", "handwritten signature", "transparent signature"],
    steps: [
      "Draw on the pad, or switch to Type and enter your name.",
      "Pick the ink color, pen size, or a script font.",
      "Download the transparent PNG.",
    ],
    faqs: [
      {
        q: "Is the background transparent?",
        a: "Yes. The exported PNG has no fill, so it can sit on a document or a light photo.",
      },
      {
        q: "How large is the file?",
        a: "Drawn signatures export at 1800 by 560 pixels. Typed signatures export at 2400 by 700 pixels.",
      },
      {
        q: "Is the drawing uploaded?",
        a: "No. The PNG is built on a canvas in this tab and downloaded directly.",
      },
    ],
    homeOrder: 18,
    href: "/image-media/signature-generator",
  },
  {
    slug: "percentage-calculator",
    name: "Percentage & Margin Calculator",
    summary: "Percent change, discounts, tips, and profit margins.",
    description:
      "Work out a percentage of a number, the change between two values, a discount, a tip split, or a profit margin and selling price. Every result is calculated in the page.",
    category: "calculators",
    icon: "Percent",
    processing: "client",
    keywords: ["percentage calculator", "discount calculator", "tip calculator", "profit margin", "markup calculator"],
    steps: [
      "Choose percent of, change, discount, tip, or margin.",
      "Enter the two numbers. Tips can also take a headcount.",
      "Read the result as you type.",
    ],
    faqs: [
      {
        q: "How is margin different from markup?",
        a: "Margin is profit divided by the selling price. Markup is profit divided by the cost. The margin tab shows both when you treat the second number as a price.",
      },
      {
        q: "What if the starting number is zero?",
        a: "Percent change needs a non-zero start. A 100% margin cannot produce a finite price.",
      },
      {
        q: "Are the numbers sent anywhere?",
        a: "No. The formulas run locally as you type.",
      },
    ],
    homeOrder: 19,
    href: "/calculators/percentage-calculator",
  },
];

export function getCategory(slug: string): CategoryDefinition {
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    throw new Error(`Unknown category: ${slug}`);
  }
  return category;
}

export function getTool(slug: string): ToolDefinition {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) {
    throw new Error(`Unknown tool: ${slug}`);
  }
  return tool;
}

export function getAllTools(): ToolDefinition[] {
  return [...tools].sort((a, b) => a.homeOrder - b.homeOrder);
}

export function getToolsByCategory(slug: ToolCategorySlug): ToolDefinition[] {
  return tools.filter((tool) => tool.category === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const needle = query.trim().toLowerCase();
  const list = getAllTools();
  if (!needle) return list;
  return list.filter((tool) => {
    const category = getCategory(tool.category);
    const haystack = [tool.name, tool.summary, tool.description, category.name, ...tool.keywords]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function processingLabel(mode: ProcessingMode): string {
  if (mode === "client") return "On device";
  if (mode === "ai") return "AI on demand";
  return "Local first";
}
