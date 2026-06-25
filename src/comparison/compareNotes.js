import { askLLM } from "../llm/askLLM.js";
import { extractJson } from "../helpers/extractJson.js";
import { analyzeNote } from "../analysis/analyzeNote.js";

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
    const fileName = note.file.basename;
    const analysisPath = `Mycelium/${fileName}/analyses/${fileName}_analysis.json`;

    try {
      const analysisContent = await app.vault.adapter.read(analysisPath);

      relatedAnalyses += `Related Note: ${note.file.name}\n${analysisContent}`;
    } catch (error) {
      console.log(`Missing analysis for ${note.file.name}`);
      const { analysis: noteAnalysis } = await analyzeNote(app, apiKey, note.file);
      const jsonAnalysis = extractJson(noteAnalysis)
      relatedAnalyses += jsonAnalysis;
    }
  }

  console.log(JSON.stringify(relatedAnalyses, null, 2))

  const comparisonPrompt = `${comparisonInject} \n Subject Analysis:
        \n ${JSON.stringify(subjectAnalysis, null, 2)}\n
        Related Analyses:\n
        ${JSON.stringify(relatedAnalyses, null, 2)}`;
  return await askLLM(comparisonPrompt, apiKey);
}
