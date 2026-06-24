import { Notice } from "obsidian";
import { extractKeywords } from "../helpers/extractKeywords.js";
import { getRelatedNotes } from "../helpers/getRelatedNotes.js";
import { compareNotes } from "./compareNotes.js";
import { selectRelatedNotes } from "../helpers/selectRelatedNotes.js";
import { writeReport } from "../helpers/writeReport.js";
import { extractJson } from "../helpers/extractJson.js";
import { analyzeNote } from "../analysis/analyzeNote.js";

export async function compareNote(app, apiKey) {
  new Notice("Starting comparison...");
  const analysisPath = `Mycelium/${fileName}/analyses/${fileName}_analysis.json`;
  const reportType = "comparison";
  const comparisonInject = await app.vault.adapter.read(
    app.vault.configDir + "/plugins/mycelium/src/prompts/comparison_inject.md",
  );

  if (await app.vault.adapter.exists(analysisPath)) {
    const fileContent = await app.vault.adapter.read(analysisPath);
    console.log(fileContent);
    runComparison(fileContent);
  } else {
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile) {
      new Notice("No active note.");
      return;
    }

    const fileName = activeFile.basename;
    const { analysis, subjectFile } = await analyzeNote(app, apiKey);
    runComparison(analysis, subjectFile);
  }
}

async function runComparison(analysis, subjectFile) {
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
