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
  const activeFile = app.workspace.getActiveFile();

  if (!activeFile) {
    new Notice("No active note.");
    return;
  }

  const fileName = activeFile.basename;
  const analysisPath = `Mycelium/${fileName}/analyses/${fileName}_analysis.md`;
  const reportType = "comparison";
  const comparisonInject = await app.vault.adapter.read(
    app.vault.configDir + "/plugins/mycelium/src/prompts/comparison_inject.md",
  );
  let analysisText = "";
  const exists = await app.vault.adapter.exists(analysisPath);

  if (exists) {
    new Notice(`${fileName} analysis exists, using it now!`);
    analysisText = await app.vault.adapter.read(analysisPath);
  } else {
    new Notice(`${fileName} analysis doesnt exist, making one now!`);
    const { analysis } = await analyzeNote(app, apiKey, activeFile);
    analysisText = analysis;
  }
  const analysisData = extractJson(analysisText);

  const keywords = analysisData.search_terms;

  new Notice("Finding related notes...");
  const relatedNotes = await getRelatedNotes(
    keywords,
    activeFile.basename,
    app,
  );
  if (relatedNotes.length === 0) {
    new Notice("No related notes found.");
    await writeReport(analysisText, activeFile.basename, "analysis", app);
    new Notice("✓ Reports Saved");
    return;
  }
  new Notice(
    `Found ${relatedNotes.length} related notes for ${activeFile.basename}.`,
  );
  const selectedNotes = await selectRelatedNotes(relatedNotes, app);

  if (selectedNotes.length === 0) {
    new Notice("No notes selected.");
    return;
  }

  new Notice(`Comparing against ${selectedNotes.length} notes...`);

  const comparisonResponse = await compareNotes(
    analysisText,
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

  await writeReport(fileName, comparisonResponse, reportType, app);
  new Notice("✓ Reports Saved");
}
