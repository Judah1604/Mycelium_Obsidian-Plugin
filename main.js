var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.js
var main_exports = {};
__export(main_exports, {
  default: () => Mycelium
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/comparison/compareNote.js
var import_obsidian2 = require("obsidian");

// src/helpers/extractKeywords.js
function extractKeywords(analysis) {
  const start = analysis.indexOf("# Related Note Search Terms");
  const end = analysis.indexOf("# Overall Assessment");
  const section = analysis.slice(start, end);
  const keywords = section.split("\n").filter((line) => line.trim().startsWith("*")).map((line) => line.replace("*", "").trim());
  return keywords;
}

// src/helpers/getRelatedNotes.js
async function getRelatedNotes(keywords, subjectFile2, app2) {
  const files = app2.vault.getMarkdownFiles().filter((file) => {
    return file.name !== subjectFile2 && !file.path.includes("Mycelium/analyses/");
  });
  const results = [];
  for (const file of files) {
    const content = await app2.vault.read(file);
    const lineCount = content.split("\n").length;
    let score = 0;
    for (const keyword of keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        score++;
      }
    }
    results.push({ file, score, lines: lineCount });
  }
  return results.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

// src/llm/askLLM.js
async function askLLM(prompt, apiKey2) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey2}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("LLM Request Failed:", error);
    return null;
  }
}

// src/helpers/extractJson.js
function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/i);
    if (!match) {
      throw new Error("No valid JSON found");
    }
    return JSON.parse(match[1]);
  }
}

// src/comparison/compareNotes.js
async function compareNotes(analysis, comparisonInject2, relatedNotes, app2, apiKey2) {
  const subjectAnalysis = extractJson(analysis);
  if (relatedNotes.length === 0) {
    console.log("No related notes found.");
    return null;
  }
  let relatedAnalyses = "";
  for (const note of relatedNotes) {
    const fileName2 = note.file.basename;
    const analysisPath = `Mycelium/${fileName2}/analyses/${fileName2}_analysis.json`;
    try {
      const analysisContent = await app2.vault.adapter.read(analysisPath);
      relatedAnalyses += `


Related Note: ${note.file.name}

${analysisContent}

`;
    } catch (error) {
      console.log(`Missing analysis for ${note.file.name}`);
    }
  }
  const comparisonPrompt = `
${comparisonInject2}

Subject Analysis:

${JSON.stringify(subjectAnalysis, null, 2)}

Related Analyses:

${relatedAnalyses}
`;
  return await askLLM(comparisonPrompt, apiKey2);
}

// src/ui/RelatedNotesModal.js
var import_obsidian = require("obsidian");
var RelatedNotesModal = class extends import_obsidian.Modal {
  constructor(app2, relatedNotes, resolve) {
    super(app2);
    this.relatedNotes = relatedNotes;
    this.resolve = resolve;
    this.selectedNotes = new Set(relatedNotes);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", {
      text: "Select Related Notes"
    });
    this.relatedNotes.forEach((note) => {
      new import_obsidian.Setting(contentEl).setName(note.file).setDesc(`Score: ${note.score} \u2022 ${note.lines} lines`).addToggle(
        (toggle) => toggle.setValue(true).onChange((value) => {
          if (value) {
            this.selectedNotes.add(note);
          } else {
            this.selectedNotes.delete(note);
          }
        })
      );
    });
    new import_obsidian.Setting(contentEl).addButton(
      (button) => button.setButtonText("Analyze").setCta().onClick(() => {
        this.resolve([...this.selectedNotes]);
        this.close();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/helpers/selectRelatedNotes.js
function selectRelatedNotes(relatedNotes, app2) {
  return new Promise((resolve) => {
    new RelatedNotesModal(
      app2,
      relatedNotes,
      resolve
    ).open();
  });
}

// src/helpers/writeReport.js
async function writeReport2(subjectFile2, report, reportType2, app2) {
  const safeName = subjectFile2.replace(".md", "").replace(/[<>:"/\\|?*]/g, "_");
  const backlink = `[[${subjectFile2.replace(".md", "")}]]`;
  const data = extractJson(report);
  const analysisFolder = `Mycelium/${safeName}/analyses`;
  const comparisonFolder = `Mycelium/${safeName}/comparison/`;
  let mdPath = "";
  let jsonPath = "";
  if (reportType2 == "analysis") {
    if (!await app2.vault.adapter.exists(analysisFolder)) {
      await app2.vault.createFolder(analysisFolder);
    }
    mdPath = `${analysisFolder}/${safeName}_analysis.md`;
    jsonPath = `${analysisFolder}/${safeName}_analysis.json`;
  } else if (reportType2 == "comparison") {
    if (!await app2.vault.adapter.exists(comparisonFolder)) {
      await app2.vault.createFolder(comparisonFolder);
    }
    mdPath = `${comparisonFolder}/${safeName}/${safeName}_comparison.md`;
    jsonPath = `${comparisonFolder}/${safeName}/${safeName}_comparison.json`;
  }
  await app2.vault.adapter.write(mdPath, report);
  await app2.vault.adapter.write(jsonPath, JSON.stringify(data, null, 2));
}

// src/analysis/getAnalysis.js
async function getAnalysis(file, fileName2, apiKey2, app2) {
  const analysisInject = await app2.vault.adapter.read(
    app2.vault.configDir + "/plugins/mycelium/src/prompts/analysis_inject.md"
  );
  const fileContent = await app2.vault.read(file);
  const analysisPrompt = `Subject Note: ${fileName2}
${analysisInject}

${fileContent}`;
  const analysis = await askLLM(analysisPrompt, apiKey2);
  return analysis;
}

// src/analysis/analyzeNote.js
async function analyzeNote(app2, apiKey2, file) {
  const reportType2 = "analysis";
  new Notice("Starting analysis...");
  if (!file) {
    new Notice("No active note.");
    return;
  }
  const fileName2 = file.name;
  const fileContent = app2.vault.read(file);
  const analysis = await getAnalysis(file, fileName2, apiKey2, app2);
  if (!analysis) {
    new Notice("Analysis failed.");
    return;
  }
  new Notice(`\u2713 ${fileName2} analysis complete`);
  await writeReport2(fileName2, analysis, reportType2, app2);
  new Notice("\u2713 Report Saved");
  return { analysis, file };
}

// src/comparison/compareNote.js
async function compareNote(app2, apiKey2) {
  new import_obsidian2.Notice("Starting comparison...");
  const analysisPath = `Mycelium/${fileName}/analyses/${fileName}_analysis.json`;
  const reportType2 = "comparison";
  const comparisonInject2 = await app2.vault.adapter.read(
    app2.vault.configDir + "/plugins/mycelium/src/prompts/comparison_inject.md"
  );
  if (await app2.vault.adapter.exists(analysisPath)) {
    const fileContent = await app2.vault.adapter.read(analysisPath);
    console.log(fileContent);
    runComparison(fileContent);
  } else {
    const activeFile = app2.workspace.getActiveFile();
    if (!activeFile) {
      new import_obsidian2.Notice("No active note.");
      return;
    }
    const fileName2 = activeFile.basename;
    const { analysis, subjectFile: subjectFile2 } = await analyzeNote(app2, apiKey2);
    runComparison(analysis, subjectFile2);
  }
}
async function runComparison(analysis, subjectFile2) {
  const keywords = extractKeywords(analysis);
  new import_obsidian2.Notice("Finding related notes...");
  const relatedNotes = await getRelatedNotes(keywords, subjectFile2, app);
  if (relatedNotes.length === 0) {
    new import_obsidian2.Notice("No related notes found.");
    await writeResults(analysis, null, subjectFile2, app);
    new import_obsidian2.Notice("\u2713 Reports Saved");
    return;
  }
  new import_obsidian2.Notice(`Found ${relatedNotes.length} related notes for ${subjectFile2}.`);
  const selectedNotes = await selectRelatedNotes(relatedNotes, app);
  if (selectedNotes.length === 0) {
    new import_obsidian2.Notice("No notes selected.");
    return;
  }
  new import_obsidian2.Notice(`Comparing against ${selectedNotes.length} notes...`);
  const comparisonResponse2 = await compareNotes(
    analysis,
    comparisonInject,
    selectedNotes,
    app,
    apiKey
  );
  if (!comparisonResponse2) {
    new import_obsidian2.Notice("Skipping comparison report.");
    return;
  }
  new import_obsidian2.Notice("\u2713 Comparison complete");
  await writeReport2(comparisonResponse2, subjectFile2, reportType, app);
  new import_obsidian2.Notice("\u2713 Reports Saved");
}

// src/commands/buildAnalysisCache.js
async function buildAnalysisCache(app2, apiKey2) {
  const files = app2.vault.getMarkdownFiles().filter((file) => {
    return file.name !== subjectFile && !file.path.includes("Mycelium/analyses/");
  });
  for (const file of files) {
    const analysisPath = `Mycelium/analyses/${file.baseName}/${file.baseName}.md`;
    const exists = await app2.vault.adapter.exists(analysisPath);
    if (exists) continue;
    const { analysis, subjectFile: subjectFile2 } = await analyzeNote(app2, apiKey2, file);
    await writeReport(comparisonResponse, subjectFile2, reportType, app2);
  }
}

// src/main.js
var DEFAULT_SETTINGS = {
  apiKey: ""
};
var Mycelium = class extends import_obsidian3.Plugin {
  async onload() {
    await this.loadSettings();
    new import_obsidian3.Notice("Mycelium is alive");
    (0, import_obsidian3.addIcon)(
      "mycelium-icon",
      '<path xmlns="http://www.w3.org/2000/svg" fill="currentColor" d="M41.8398 28.6943C42.7547 29.0186 43.1484 30.0957 42.6582 30.9336L34.8525 44.2764C34.4853 44.9038 33.7305 45.1907 33.0391 44.9658L17.6074 39.9473L17.4873 39.9082C17.0313 39.7599 16.5317 39.8311 16.1357 40.1016L16.0303 40.1738L7.47363 46.0283L7.1748 46.2324C6.29584 46.8334 6.27302 48.1218 7.12988 48.7539L7.4209 48.9697L15.9785 55.2822L16.0146 55.3086C16.1669 55.4213 16.3389 55.505 16.5215 55.5557L16.5654 55.5684L25.915 58.1729C27.0841 58.4986 27.44 59.9822 26.5459 60.8027L9.59776 76.3533C8.50582 77.3552 6.78686 77.2372 5.95174 76.013C2.51204 70.9706 0.5 64.8768 0.5 58.3125V41.8125C0.500001 32.6721 4.40024 24.4437 10.6259 18.6972C11.1496 18.2137 12.094 18.519 12.7734 18.7344L17.25 20.1543C18.2805 20.4811 18.6663 21.7369 17.9971 22.5859L11.3848 30.9727C10.856 31.6434 10.971 32.6156 11.6416 33.1445L12.0459 33.4639C12.7168 33.9928 13.6898 33.8779 14.2188 33.207L20.2549 25.5518C20.9903 24.6191 22.4584 24.8286 22.9033 25.9297L25.5752 32.5459C25.8951 33.338 26.7967 33.7212 27.5889 33.4014L28.0674 33.208C28.8596 32.8882 29.2427 31.9865 28.9229 31.1943L26.875 26.1211C26.376 24.8852 27.5689 23.6391 28.8252 24.084L41.8398 28.6943ZM72.833 75.9072L71.4785 89.334C71.4648 89.4703 71.3688 89.5898 71.2325 89.6036C70.1849 89.7093 69.1223 89.7656 68.0469 89.7656H31.9531C24.4068 89.7656 17.4828 87.1063 12.0632 82.6755C10.9162 81.7379 10.9466 80.0159 12.0381 79.0143L28.2344 64.1533C29.1949 63.2721 30.7477 63.9009 30.8242 65.2021L31.6982 80.0752L31.7334 80.6709C31.813 82.0242 33.4714 82.628 34.4023 81.6426L34.8125 81.208L37.9141 77.9229C38.6504 77.1434 39.9373 77.3316 40.4199 78.2891L42.2783 81.9775C42.6629 82.7406 43.5935 83.0468 44.3564 82.6621L44.8164 82.4307C45.5789 82.0462 45.8859 81.1162 45.502 80.3535L42.5508 74.498C42.2579 73.9165 42.3607 73.2137 42.8076 72.7402L44.6807 70.7568C45.3639 70.0334 46.5429 70.1342 47.0938 70.9629L55.458 83.5459L55.5518 83.6865C55.8937 84.2012 56.5093 84.4631 57.1172 84.3525L57.2842 84.3223L64.2695 83.0518C65.1102 82.8989 65.6677 82.0936 65.5146 81.2529L65.4229 80.7461C65.2699 79.9058 64.4644 79.3482 63.624 79.501L58.8086 80.376C58.2009 80.4864 57.5851 80.2253 57.2432 79.7109L48.4844 66.5352C48.2712 66.2144 48.185 65.826 48.2432 65.4453L49.5439 56.9473C49.6596 56.1922 50.3094 55.6348 51.0732 55.6348H60.0508C60.1309 55.6348 60.2109 55.6409 60.29 55.6533L66.5186 56.6279C67.8829 56.8415 68.3045 58.5998 67.1855 59.4092L60.6182 64.1602L60.3115 64.3818C59.4274 65.0212 59.4656 66.3505 60.3848 66.9385L60.7031 67.1426L72.1279 74.4482C72.6193 74.7625 72.8916 75.3269 72.833 75.9072ZM57.3701 50.0566C57.6494 51.0439 56.9078 52.0253 55.8818 52.0254H47.9736C47.2098 52.0255 46.5599 52.5828 46.4443 53.3379L46.4111 53.5566L44.6367 65.1475C44.5892 65.4581 44.4482 65.7471 44.2324 65.9756L38.5684 71.9727L37.5156 73.0879C36.5848 74.0736 34.9263 73.4696 34.8467 72.1162L34.0127 57.9482L34.002 57.7646C33.9629 57.1052 33.5095 56.5425 32.873 56.3652L32.6953 56.3164L18.1289 52.2568C17.9478 52.2064 17.7773 52.1233 17.626 52.0117L13.3594 48.8643C12.503 48.2322 12.5258 46.9438 13.4043 46.3428L16.708 44.084C17.104 43.8131 17.6033 43.7413 18.0596 43.8896L34.4883 49.2334L34.5879 49.2656C34.9702 49.3901 35.386 49.3604 35.7471 49.1836L35.8398 49.1387L52.8604 40.8135C53.7269 40.3896 54.7667 40.854 55.0293 41.7822L57.3701 50.0566ZM44.0217 10.3594C44.2785 10.3594 44.457 10.6183 44.457 10.875V23.6045C44.457 24.6726 43.4003 25.4192 42.3936 25.0625L23.0166 18.1973L22.96 18.1777L19.8034 17.1765C17.7363 16.5209 17.408 13.8351 19.3956 12.9681C23.242 11.2905 27.4886 10.3594 31.9531 10.3594H44.0217ZM92.5264 48.6553C92.3051 48.7459 92.0656 48.784 91.8271 48.7666L85.4639 48.3008C85.303 48.289 85.1446 48.252 84.9951 48.1914L74.6943 44.0146C73.6949 43.6094 73.4063 42.3313 74.1348 41.5361L84.0586 30.707C84.6357 30.0773 84.5934 29.0988 83.9639 28.5215L83.7734 28.3477L83.584 28.1738C82.9542 27.5968 81.9756 27.6389 81.3984 28.2686L74.0352 36.3027C73.0819 37.3425 71.3477 36.6676 71.3477 35.2568V33.6572C71.3477 33.5487 71.3592 33.4401 71.3818 33.334L74.5615 18.4365C74.7398 17.6011 74.2065 16.7789 73.3711 16.6006L73.1182 16.5469L72.8672 16.4932C72.0317 16.3147 71.2097 16.8471 71.0312 17.6826L68.7207 28.5098C68.5041 29.5247 67.3686 30.0434 66.46 29.542L56.3516 23.9639C55.6037 23.5512 54.6629 23.8227 54.25 24.5703L54.001 25.0225C53.5882 25.7704 53.8595 26.7112 54.6074 27.124L66.9385 33.9287C67.4317 34.2009 67.7383 34.7198 67.7383 35.2832V44.0488C67.7383 44.6784 68.1199 45.2455 68.7031 45.4824L68.8643 45.5479L77.9365 49.2246C79.1158 49.7028 79.2454 51.3207 78.1572 51.9805L74.9482 53.9258C74.6363 54.1148 74.2676 54.1872 73.9072 54.1309L62.7139 52.3789C62.117 52.2855 61.6293 51.8528 61.4648 51.2715L57.4082 36.9385L57.3242 36.6416C57.0617 35.7133 56.0229 35.2491 55.1562 35.6729L54.8789 35.8086L44.2246 41.0195C42.8487 41.6925 41.4366 40.1707 42.21 38.8486L47.8193 29.2598L47.8555 29.1982C47.9938 28.9615 48.0664 28.6922 48.0664 28.418V10.875C48.0664 10.6184 48.2467 10.3594 48.5033 10.3594H68.0469C85.418 10.3594 99.5 24.4414 99.5 41.8125V44.0688C99.5 45.1153 98.8675 46.0579 97.8991 46.4546L92.5264 48.6553ZM98.4455 58.09C99.1037 58.5869 99.4915 59.3695 99.4429 60.1928C98.6854 73.0421 90.2155 83.8165 78.5957 87.9522C76.9323 88.5443 75.3275 87.1382 75.5048 85.3814L76.2871 77.6289C76.3742 76.7657 77.1536 76.1431 78.0146 76.249L85.627 77.1875C86.4747 77.292 87.2469 76.6895 87.3516 75.8418L87.4141 75.3301C87.5185 74.4822 86.9162 73.71 86.0684 73.6055L75.8125 72.3408C75.5831 72.3125 75.3626 72.2329 75.168 72.1084L66.7979 66.7549C65.8787 66.167 65.8406 64.8377 66.7246 64.1982L75.833 57.6104L84.8262 52.1602C85.1007 51.9938 85.4201 51.9171 85.7402 51.9404L90.3311 52.2754C90.628 52.2971 90.9127 52.4036 91.1504 52.583L98.4455 58.09Z"/>'
    );
    this.addRibbonIcon("mycelium-icon", "Mycelium", async () => {
      await analyzeNote(this.app, this.settings.apiKey);
    });
    this.addCommand({
      id: "mycelium-analyze-note",
      name: "Analyze Note",
      callback: async () => {
        const activeFile = app.workspace.getActiveFile();
        await analyzeNote(this.app, this.settings.apiKey, activeFile);
      }
    });
    this.addCommand({
      id: "mycelium-compare-note",
      name: "Compare Note",
      callback: async () => {
        await compareNote(this.app, this.settings.apiKey);
      }
    });
    this.addCommand({
      id: "mycelium-build-analysis-cache",
      name: "Build Analysis Cache",
      callback: async () => {
        await buildAnalysisCache(this.app, apiKey);
      }
    });
    this.addSettingTab(new MyceliumSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  onunload() {
    console.log("Mycelium unloaded");
  }
};
var MyceliumSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app2, plugin) {
    super(app2, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian3.Setting(containerEl).setName("API Key").setDesc("Your LLM API key").addText(
      (text) => text.setPlaceholder("gsk-...").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
        this.plugin.settings.apiKey = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
//# sourceMappingURL=main.js.map
