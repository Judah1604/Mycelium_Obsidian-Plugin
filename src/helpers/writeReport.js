import { extractJson } from "./extractJson.js";

export async function writeReport(subjectFile, report, reportType, app) {
  const safeName = subjectFile.replace(".md", "").replace(/[<>:"/\\|?*]/g, "_");
  const backlink = `[[${subjectFile.replace(".md", "")}]]`;
  const analysisData = extractJson(report);
  const mdPath = "";
  const jsonPath = "";

  if (reportType == "analysis") {
    if (!(await app.vault.adapter.exists("Mycelium/analyses/"))) {
      await app.vault.createFolder("Mycelium/analyses/");
    }
    const mdPath = `Mycelium/analyses/${safeName}/${safeName}.md`;
    const jsonPath = `Mycelium/analyses/${safeName}/${safeName}.json`;
  } else if (reportType == "comparison") {
    if (!(await app.vault.adapter.exists("Mycelium/comparison/"))) {
      await app.vault.createFolder("Mycelium/comparison/");
    }
    const mdPath = `Mycelium/comparisons/${safeName}/${safeName}.md`;
    const jsonPath = `Mycelium/comparisons/${safeName}/${safeName}.json`;
  }

  await app.vault.adapter.write(mdPath, report);
  await app.vault.adapter.write(
    jsonPath,
    JSON.stringify(analysisData, null, 2),
  );
}
