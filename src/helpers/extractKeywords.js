export function extractKeywords(analysis) {
  const start = analysis.indexOf("# Related Note Search Terms");
  const end = analysis.indexOf("# Overall Assessment");

  const section = analysis.slice(start, end);
  const keywords = section
    .split("\n")
    .filter((line) => line.trim().startsWith("*"))
    .map((line) => line.replace("*", "").trim());

  return keywords;
}