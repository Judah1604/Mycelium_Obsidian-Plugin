import { analyzeNote } from "../analysis/analyzeNote.js";

export async function buildAnalysisCache(app, apiKey) {
  const files = app.vault.getMarkdownFiles().filter((file) => {
    return (
      file.name !== subjectFile && !file.path.includes("Mycelium/analyses/")
    );
  });

  for (const file of files) {
    const analysisPath = `Mycelium/analyses/${file.baseName}/${file.baseName}.md`;

    const exists = await app.vault.adapter.exists(analysisPath);

    if (exists) continue;

    const { analysis, subjectFile } = await analyzeNote(app, apiKey, file);
    await writeReport(comparisonResponse, subjectFile, reportType, app);
  }
}
