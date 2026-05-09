const { generateResponse } = require('../utils/aiClient');

function cleanResponse(text) {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, '');
}

function parseJSON(text) {
  const cleaned = cleanResponse(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1].trim()); } catch { /* fall through */ }
    }
    const braceMatch = cleaned.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

function buildPrompt(idea) {
  return `You are an expert startup advisor preparing to evaluate a startup idea. Based on the idea below, generate exactly 5 context-specific questions that will help a panel of expert judges (CFO, CTO, Legal, Marketing, HR, Market Research) evaluate this startup more accurately.

Startup Idea: "${idea}"

For each question, decide the best answer format:
- "mcq" — when there are clear, finite choices the founder can pick from (provide 4-6 realistic options)
- "input" — when the answer is open-ended, numerical, or unique to the founder's situation

Guidelines:
- Questions should extract critical information the judges NEED but cannot infer from the idea description alone
- Think about what's missing: target audience specifics, monetization details, competitive landscape, technical feasibility, regulatory concerns, team capability, funding needs, go-to-market strategy
- At least 2 questions MUST be "mcq" type and at least 1 MUST be "input" type
- MCQ options should be realistic, mutually exclusive, and cover the most common scenarios
- Input questions should have a helpful placeholder showing an example answer
- Questions should be concise, conversational, and jargon-free
- Order from most critical to least critical for evaluation
- Each question key must be unique snake_case

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "key": "unique_snake_case_key",
      "question": "The question text?",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "placeholder": null
    },
    {
      "key": "unique_snake_case_key",
      "question": "The question text?",
      "type": "input",
      "options": null,
      "placeholder": "e.g. Brief example answer..."
    }
  ]
}`;
}

function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length < 3 || questions.length > 8) return false;
  for (const q of questions) {
    if (!q.key || !q.question || !q.type) return false;
    if (q.type !== 'mcq' && q.type !== 'input') return false;
    if (q.type === 'mcq' && (!Array.isArray(q.options) || q.options.length < 2)) return false;
  }
  return true;
}

async function generateQuestionsForIdea(idea, options = {}) {
  const prompt = buildPrompt(idea);
  const raw = await generateResponse(prompt, { ...options, maxTokens: 600 });
  const parsed = parseJSON(raw);

  if (!parsed || !parsed.questions || !validateQuestions(parsed.questions)) {
    console.warn('[QuestionService] Invalid response, falling back to null');
    return null;
  }

  return parsed.questions;
}

module.exports = { generateQuestionsForIdea };
