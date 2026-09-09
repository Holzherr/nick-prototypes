import Anthropic from 'npm:@anthropic-ai/sdk@0.90.0';

export const MODELS = {
  /** Cheap and fast: search, enrichment, popular list. */
  fast: 'claude-haiku-4-5',
  /** Taste work: recommendations and Watch Tonight picks. */
  smart: 'claude-sonnet-5',
} as const;

type Tool = Omit<Anthropic.Tool, 'strict'>;

/** Error surfaced to the front end with the same status codes Lovable's gateway used (429, 402, 5xx). */
export class ClaudeError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * One forced tool call: Claude must answer by calling `tool`, and the parsed, schema-validated
 * tool input is returned. Replaces the OpenAI-shaped Lovable gateway call the functions were
 * written against.
 */
export async function callTool<T>(opts: { model: string; system: string; user: string; tool: Tool; maxTokens?: number }): Promise<T> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new ClaudeError(500, 'ANTHROPIC_API_KEY not configured');
  const client = new Anthropic({ apiKey });
  try {
    const response = await client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 8192,
      system: opts.system,
      messages: [{ role: 'user', content: opts.user }],
      tools: [{ ...opts.tool, strict: true }],
      tool_choice: { type: 'tool', name: opts.tool.name },
    });
    const block = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    if (!block) throw new ClaudeError(502, 'No tool_use block in Claude response');
    return block.input as T;
  } catch (e) {
    if (e instanceof ClaudeError) throw e;
    if (e instanceof Anthropic.RateLimitError) throw new ClaudeError(429, 'Rate limited');
    if (e instanceof Anthropic.APIError) throw new ClaudeError(e.status === 400 && /credit|billing/i.test(e.message) ? 402 : 502, `Claude ${e.status}: ${e.message}`);
    throw e;
  }
}

/** Maps a ClaudeError to the JSON bodies the front end already understands; null for other errors. */
export const claudeErrorResponse = (e: unknown, headers: Record<string, string>): Response | null => {
  if (!(e instanceof ClaudeError)) return null;
  if (e.status === 429) return new Response(JSON.stringify({ error: 'Rate limited, please try again later.' }), { status: 429, headers });
  if (e.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers });
  return null;
};
