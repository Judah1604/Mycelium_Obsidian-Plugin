import { askLLM } from "../llm/askLLM";

export async function getAnalysis(file, fileName, apiKey, app) {
  const analysisInject = await app.vault.adapter.read(
    app.vault.configDir + "/plugins/mycelium/src/prompts/analysis_inject.md",
  );
  const fileContent = await app.vault.read(file);
  const analysisPrompt = `Subject Note: ${fileName}\n${analysisInject}\n\n${fileContent}`;

  const analysis = await askLLM(analysisPrompt, apiKey);
  return analysis;
}
