import { analyzeNote } from "../analysis/analyzeNote.js";
import { writeReport } from "../helpers/writeReport.js";

export async function buildAnalysisCache(app, apiKey) {
  const reportType = "analysis";
  const files = app.vault.getMarkdownFiles().filter((file) => {
    return (
      !file.path.includes(`Mycelium/`) &&
      !file.path.includes(`Miscellaneous Files/`) &&
      !file.name.includes("Untitled") &&
      !file.name.includes("_withRevisionQuestions") 
    );
  });
  let notAnalyzed = [];

  for (const file of files) {
    const analysisPath = `Mycelium/${file.basename}/analyses/${file.basename}_analysis.md`;

    const exists = await app.vault.adapter.exists(analysisPath);

    if (!exists) {
      notAnalyzed.push(file);
    }    
  }

  console.log(notAnalyzed)

  // notAnalyzed.forEach(async (file) => {
  //   const { analysis, subjectNote } = await analyzeNote(app, apiKey, file);
  //   await writeReport(subjectNote.name, analysis, reportType, app);
  //   console.log(`Analyzed ${file.basename} successfully!`);
  // })
}
