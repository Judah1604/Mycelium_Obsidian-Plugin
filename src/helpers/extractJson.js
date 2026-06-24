export function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/`(?:json)?\s*([\s\S]*?)\s*`/i);

    if (!match) {
      throw new Error("No valid JSON found");
    }

    return JSON.parse(match[1]);
  }
}
