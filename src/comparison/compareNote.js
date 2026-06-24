import { Notice } from "obsidian";
import { extractKeywords } from "../helpers/extractKeywords.js";
import { getRelatedNotes } from "../helpers/getRelatedNotes.js";
import { compareNotes } from "./compareNotes.js";
import { selectRelatedNotes } from "../helpers/selectRelatedNotes.js";
import { writeReport } from "../helpers/writeReport.js";
import { extractJson } from "../helpers/extractJson.js";

export async function compareNote(app, apiKey) {
  const reportType = "comparison";
  const comparisonInject = await app.vault.adapter.read(
    app.vault.configDir + "/plugins/mycelium/src/prompts/comparison_inject.md",
  );
  const { analysis, subjectFile } = await analyzeNote(app, apiKey);

  const keywords = extractKeywords(analysis);
  new Notice("Finding related notes...");
  const relatedNotes = await getRelatedNotes(keywords, subjectFile, app);
  if (relatedNotes.length === 0) {
    new Notice("No related notes found.");
    await writeResults(analysis, null, subjectFile, app);
    new Notice("✓ Reports Saved");
    return;
  }
  new Notice(`Found ${relatedNotes.length} related notes for ${subjectFile}.`);
  const selectedNotes = await selectRelatedNotes(relatedNotes, app);

  if (selectedNotes.length === 0) {
    new Notice("No notes selected.");
    return;
  }

  new Notice(`Comparing against ${selectedNotes.length} notes...`);

  const comparisonResponse = await compareNotes(
    analysis,
    comparisonInject,
    selectedNotes,
    app,
    apiKey,
  );

  if (!comparisonResponse) {
    new Notice("Skipping comparison report.");
    return;
  }
  new Notice("✓ Comparison complete");

  await writeReport(comparisonResponse, subjectFile, reportType, app);
  new Notice("✓ Reports Saved");
}
