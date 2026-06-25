export async function getRelatedNotes(keywords, subjectFile, app) {
  const safeName = subjectFile.replace(".md", "").replace(/[<>:"/\\|?*]/g, "_");
  const files = app.vault.getMarkdownFiles().filter((file) => {
    return !file.name.includes(safeName) && !file.path.includes(`Mycelium/`) && !file.path.includes(`Miscellaneous Files/`)
  });
  const results = [];

  for (const file of files) {
    const content = await app.vault.read(file);
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
