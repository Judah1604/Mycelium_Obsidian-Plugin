import { extractJson } from "./extractJson.js";

export async function writeReport(subjectFile, report, reportType, app) {
  const safeName = subjectFile.replace(".md", "").replace(/[<>:"/\\|?*]/g, "_");
  const backlink = `[[${subjectFile.replace(".md", "")}]]`;
  const data = extractJson(report);
  const analysisFolder = `Mycelium/${safeName}/analyses`;
  const comparisonFolder = `Mycelium/${safeName}/comparison`;
  let mdPath = "";
  let jsonPath = "";

  if (reportType == "analysis") {
    if (!(await app.vault.adapter.exists(analysisFolder))) {
      await app.vault.createFolder(analysisFolder);
    }
    mdPath = `${analysisFolder}/${safeName}_analysis.md`;
    jsonPath = `${analysisFolder}/${safeName}_analysis.json`;
  } else if (reportType == "comparison") {
    if (!(await app.vault.adapter.exists(comparisonFolder))) {
      await app.vault.createFolder(comparisonFolder);
    }
    mdPath = `${comparisonFolder}/${safeName}/${safeName}_comparison.md`;
    jsonPath = `${comparisonFolder}/${safeName}/${safeName}_comparison.json`;
  }

  await app.vault.adapter.write(mdPath, report);
  await app.vault.adapter.write(jsonPath, JSON.stringify(data, null, 2));
}
