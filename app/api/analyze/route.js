import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { prompt, context } = await request.json();

    if (!prompt || prompt.trim().length < 5) {
      return Response.json({ error: 'Please enter a prompt to analyze.' }, { status: 400 });
    }

    const systemPrompt = `You are an expert prompt engineer with deep knowledge of how LLMs work. Your job is to analyze prompts written by users, score them, and rewrite them to be significantly better.

When rewriting, you produce a clean, concise, highly effective prompt. It should:
- Be direct and specific
- Include a clear role/persona for the AI where helpful
- Include relevant constraints and tone guidance
- Use negative prompting where it genuinely helps (e.g. "Do not use jargon", "Avoid bullet points unless necessary")
- NOT be bloated or unnecessarily long
- NOT rigidly follow any named framework — just be excellent

You must respond with ONLY a valid JSON object, no markdown, no explanation outside the JSON.`;

    const userMessage = `Analyze this prompt and return a JSON object.

ORIGINAL PROMPT:
"""
${prompt}
"""

${context ? `EXTRA CONTEXT FROM USER:\n"""\n${context}\n"""` : ''}

Return this exact JSON structure:
{
  "score": <number 0-100>,
  "grade": <"Weak" | "Average" | "Good" | "Excellent">,
  "one_line_verdict": <one punchy sentence summarizing the prompt's biggest issue or strength>,
  "breakdown": [
    { "dimension": "Clarity", "score": <0-20>, "feedback": "<one sentence>" },
    { "dimension": "Specificity", "score": <0-20>, "feedback": "<one sentence>" },
    { "dimension": "Context", "score": <0-20>, "feedback": "<one sentence>" },
    { "dimension": "Output Guidance", "score": <0-20>, "feedback": "<one sentence>" },
    { "dimension": "Constraints", "score": <0-20>, "feedback": "<one sentence>" }
  ],
  "whats_weak": [
    "<plain English issue 1>",
    "<plain English issue 2>",
    "<plain English issue 3>"
  ],
  "rewritten_prompt": "<the full rewritten prompt as a single string with line breaks using \\n>",
  "what_changed": [
    "<specific change made and why 1>",
    "<specific change made and why 2>",
    "<specific change made and why 3>"
  ]
}

Scoring guide:
0-25: Weak (vague, no context, no guidance)
26-50: Average (some clarity but missing key elements)
51-75: Good (solid but missing refinement)
76-100: Excellent (clear, specific, well constrained)`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: userMessage }],
      system: systemPrompt,
    });

    const rawText = message.content[0].text.trim();

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

    const result = JSON.parse(cleaned);

    return Response.json(result);
  } catch (err) {
    console.error('API error:', err);
    if (err instanceof SyntaxError) {
      return Response.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
    }
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
