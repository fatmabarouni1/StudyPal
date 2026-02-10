import RevisionModule from "../models/RevisionModule.js";
import ModuleNote from "../models/ModuleNote.js";
import ModuleLink from "../models/ModuleLink.js";
import ModuleDocument from "../models/ModuleDocument.js";
import ModuleResourceSuggestion from "../models/ModuleResourceSuggestion.js";

const NOTES_MAX_CHARS = 1200;
const AI_API_URL =
  process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

const truncateText = (value, maxChars) => {
  if (!value) return "";
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}...`;
};

const isYouTubeUrl = (value = "") =>
  /(?:youtube\.com|youtu\.be)/i.test(value);

const extractYouTubeId = (value = "") => {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch (error) {
    return null;
  }
  return null;
};

const normalizeUrl = (value = "") => value.trim().toLowerCase();

const buildContextSnapshot = (module, note, links, documents) => ({
  moduleTitle: module.title,
  notesExcerpt: truncateText(note?.content ?? "", NOTES_MAX_CHARS),
  links: links.map((link) => ({
    title: link.title,
    url: link.url,
    type: isYouTubeUrl(link.url) ? "video" : "article",
  })),
  documents: documents.map((doc) => ({
    filename: doc.originalName ?? doc.filename,
    url: doc.url,
  })),
});

const buildPrompt = (contextSnapshot, language, existingYouTubeLinks) => {
  const languageLabel = language === "fr" ? "French" : "English";
  return [
    {
      role: "system",
      content:
        "You are a study assistant. Return JSON only, with no markdown or extra text.",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "Generate concise learning resource recommendations.",
        language: languageLabel,
        constraints: [
          "Return JSON only that matches the provided schema.",
          "Be concise and practical.",
          "Prefer well-known platforms (YouTube, Coursera, freeCodeCamp, official docs).",
          "If a YouTube link already exists in module links, do NOT recommend it again.",
        ],
        existingYouTubeLinks,
        context: contextSnapshot,
        responseSchema: {
          moduleTitle: "string",
          recommendedResources: [
            {
              title: "string",
              type: "video | course | article | documentation",
              platform: "YouTube | Coursera | freeCodeCamp | Docs | Other",
              url: "string",
              whyThisHelps: "string",
              difficulty: "beginner | intermediate | advanced",
              estimatedTime: "short | medium | long",
            },
          ],
          studyAdvice: "string (1-2 sentences)",
        },
      }),
    },
  ];
};

const resolveApiKey = () => process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

const callAiApi = async (messages) => {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    const error = new Error("AI_API_KEY or OPENAI_API_KEY is not configured.");
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `AI request failed: ${response.status} ${errorText || response.statusText}`
    );
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI response missing content.");
  }

  return content.trim();
};

const parseAiJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const fixAiJson = async (raw, schemaHint) => {
  const messages = [
    {
      role: "system",
      content: "Fix invalid JSON. Return JSON only, no extra text.",
    },
    {
      role: "user",
      content: JSON.stringify({
        instruction: "Repair the JSON to match the schema exactly.",
        schema: schemaHint,
        invalidJson: raw,
      }),
    },
  ];
  return callAiApi(messages);
};

const getLatestResources = async (req, res) => {
  try {
    const suggestion = await ModuleResourceSuggestion.findOne({
      moduleId: req.params.moduleId,
      userId: req.user.id,
      type: "resources",
    }).sort({ createdAt: -1 });

    return res.json({ suggestion });
  } catch (error) {
    console.error("Failed to load AI resources:", error?.stack || error);
    return res.status(500).json({ message: "Failed to load AI resources." });
  }
};

const generateResources = async (req, res) => {
  try {
    const { language } = req.body;

    if (!["en", "fr"].includes(language)) {
      return res.status(400).json({ message: "Language must be 'en' or 'fr'." });
    }

    const apiKey = resolveApiKey();
    if (!apiKey) {
      return res.status(400).json({
        message: "Missing AI API key. Set AI_API_KEY or OPENAI_API_KEY.",
      });
    }

    const module = await RevisionModule.findOne({
      _id: req.params.moduleId,
      user_id: req.user.id,
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found." });
    }

    const [note, links, documents] = await Promise.all([
      ModuleNote.findOne({ module_id: module._id, user_id: req.user.id }),
      ModuleLink.find({ module_id: module._id, user_id: req.user.id }).sort({
        created_at: -1,
      }),
      ModuleDocument.find({ module_id: module._id, user_id: req.user.id }).sort({
        uploadedAt: -1,
      }),
    ]);

    const contextSnapshot = buildContextSnapshot(module, note, links, documents);
    const existingYouTubeLinks = links
      .filter((link) => isYouTubeUrl(link.url))
      .map((link) => link.url);

    const prompt = buildPrompt(contextSnapshot, language, existingYouTubeLinks);

    let raw = await callAiApi(prompt);
    let parsed = parseAiJson(raw);

    if (!parsed) {
      const fixed = await fixAiJson(raw, {
        moduleTitle: "string",
        recommendedResources: [
          {
            title: "string",
            type: "video | course | article | documentation",
            platform: "YouTube | Coursera | freeCodeCamp | Docs | Other",
            url: "string",
            whyThisHelps: "string",
            difficulty: "beginner | intermediate | advanced",
            estimatedTime: "short | medium | long",
          },
        ],
        studyAdvice: "string (1-2 sentences)",
      });
      raw = fixed;
      parsed = parseAiJson(raw);
    }

    if (!parsed) {
      return res.status(422).json({
        message: "AI returned invalid JSON.",
        raw: process.env.NODE_ENV === "production" ? undefined : raw,
      });
    }

    const youtubeIds = new Set(
      existingYouTubeLinks
        .map((url) => extractYouTubeId(url))
        .filter(Boolean)
    );

    if (Array.isArray(parsed.recommendedResources)) {
      parsed.recommendedResources = parsed.recommendedResources.filter((item) => {
        if (!item?.url) return false;
        if (!isYouTubeUrl(item.url)) return true;
        const id = extractYouTubeId(item.url);
        if (id && youtubeIds.has(id)) return false;
        if (existingYouTubeLinks.some((link) => normalizeUrl(link) === normalizeUrl(item.url))) {
          return false;
        }
        return true;
      });
    }

    const suggestion = await ModuleResourceSuggestion.create({
      userId: req.user.id,
      moduleId: module._id,
      type: "resources",
      contextSnapshot,
      outputJson: parsed,
    });

    return res.status(201).json({ suggestion });
  } catch (error) {
    console.error("AI resources generation failed:", error?.stack || error);
    const status = error?.statusCode;
    if (status === 401) {
      return res.status(401).json({ message: "AI provider rejected the API key." });
    }
    if (status === 429) {
      return res.status(429).json({ message: "AI provider rate limit exceeded." });
    }
    if (status && status >= 500) {
      return res.status(502).json({ message: "AI provider error. Try again." });
    }
    if (status === 400) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to generate AI resources." });
  }
};

export { generateResources, getLatestResources };
