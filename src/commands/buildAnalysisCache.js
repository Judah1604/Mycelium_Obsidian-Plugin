import { analyzeNote } from "../analysis/analyzeNote.js";
import { writeReport } from "../helpers/writeReport.js";

export async function buildAnalysisCache(app, apiKey) {
  const reportType = "analysis";
  const files = app.vault.getMarkdownFiles().filter((file) => {
    return (
      !file.path.includes(`Mycelium/`) &&
      !file.path.includes(`Miscellaneous Files/`)
    );
  });

  for (const file of files) {
    const analysisPath = `Mycelium/analyses/${file.baseName}/${file.baseName}.md`;

    const exists = await app.vault.adapter.exists(analysisPath);

    if (exists) continue;

    const { analysis, subjectNote } = await analyzeNote(app, apiKey, file);
    await writeReport(subjectNote.name, analysis, reportType, app);
  }
}
