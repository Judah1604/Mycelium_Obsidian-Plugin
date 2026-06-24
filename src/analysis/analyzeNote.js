import { writeReport } from "../helpers/writeReport";
import { getAnalysis } from "./getAnalysis";

export async function analyzeNote(app, apiKey, file) {
  const reportType = "analysis";
  new Notice("Starting analysis...");

  if (!file) {
    new Notice("No active note.");
    return;
  }
  const fileName = file.name;
  const fileContent = app.vault.read(file)

  console.log(file);
  const analysis = getAnalysis(file, fileName, apiKey, app);

  if (!analysis) {
    new Notice("Analysis failed.");
    return;
  }
  new Notice(`✓ ${fileName} analysis complete`);
  await writeReport(fileName, analysis, reportType, app);
  new Notice("✓ Report Saved");
  return { analysis, file };
}
