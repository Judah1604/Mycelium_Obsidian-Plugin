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
  const conciseSubject = stripImportantData(analysis);

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
      const jsonAnalysis = extractJson(analysisContent);
      const strippedRelatedNote = stripImportantData(jsonAnalysis);

      relatedAnalyses += `Related Note: ${note.file.name}\n${strippedRelatedNote}`;
    } catch (error) {
      console.log(`Missing analysis for ${note.file.name}`);
      const { analysis: noteAnalysis } = await analyzeNote(
        app,
        apiKey,
        note.file,
      );
      const jsonAnalysis = extractJson(noteAnalysis);
      const strippedRelatedNote = stripImportantData(jsonAnalysis);
      relatedAnalyses += strippedRelatedNote;
    }
  }

  const comparisonPrompt = `${comparisonInject} \n Subject Analysis:
        \n ${JSON.stringify(conciseSubject, null, 2)}\n
        Related Analyses:\n
        ${JSON.stringify(relatedAnalyses, null, 2)}`;
  console.log("Prompt size:", comparisonPrompt.length, "characters");
  // return await askLLM(comparisonPrompt, apiKey);
}

function stripImportantData(analysisData) {
  const distilledAnalysis = {
    assumptions: analysisData.hidden_assumptions,
    weakPoints: analysisData.weak_points,
    questions: analysisData.unanswered_questions,
  };

  const polished = JSON.stringify(distilledAnalysis);

  return polished;
}
