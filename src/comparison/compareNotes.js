import { askLLM } from "../llm/askLLM.js";
import { extractJson } from "../helpers/extractJson.js";

export async function compareNotes(
  analysis,
  comparisonInject,
  relatedNotes,
  app,
  apiKey,
) {
  const subjectAnalysis = extractJson(analysis);

  if (relatedNotes.length === 0) {
    console.log("No related notes found.");
    return null;
  }

  let relatedAnalyses = "";

  for (const note of relatedNotes) {
    const analysisPath = `mycelium/analyses/${note.file.basename}.json`;

    try {
      const analysisContent = await app.vault.adapter.read(analysisPath);

      relatedAnalyses += `


Related Note: ${note.file.name}

${analysisContent}

`;
    } catch (error) {
      console.log(`Missing analysis for ${note.file.name}`);
    }
  }

  const comparisonPrompt = `
${comparisonInject}

Subject Analysis:

${JSON.stringify(subjectAnalysis, null, 2)}

Related Analyses:

${relatedAnalyses}
`;

  return await askLLM(comparisonPrompt, apiKey);
}
