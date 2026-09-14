import type { Autopsy } from "./types";

export function autopsyToMarkdown(
  autopsy: Autopsy,
  opts: { jobId: string; unlocked: boolean; createdAt: string },
): string {
  const causes = opts.unlocked
    ? autopsy.rootCauses
    : autopsy.rootCauses.slice(0, 1);

  const lines: string[] = [
    `# CauseCI autopsy`,
    ``,
    `- **Job:** \`${opts.jobId}\``,
    `- **CI system:** ${autopsy.ciSystem}`,
    `- **Generated:** ${opts.createdAt}`,
    `- **Engine:** ${autopsy.generatedBy}`,
    `- **Access:** ${opts.unlocked ? "full" : "teaser (top cause only)"}`,
    ``,
    `## ${autopsy.headline}`,
    ``,
    autopsy.summary,
    ``,
    `## Ranked root causes`,
    ``,
  ];

  for (const cause of causes) {
    lines.push(
      `### ${cause.rank}. ${cause.title} (${cause.confidence}% confidence)`,
      ``,
      cause.summary,
      ``,
      `**Evidence**`,
      ``,
      ...cause.evidence.map((item) => `- ${item}`),
      ``,
      `**Fix steps**`,
      ``,
      ...cause.fixSteps.map((step, i) => `${i + 1}. ${step}`),
      ``,
    );
  }

  if (!opts.unlocked) {
    lines.push(
      `---`,
      ``,
      `_Teaser only. Unlock the full autopsy for remaining causes, fix steps, and the optional patch draft._`,
      ``,
    );
    return lines.join("\n");
  }

  if (autopsy.patchDraft) {
    lines.push(
      `## Suggested patch draft`,
      ``,
      autopsy.patchDraft.notes,
      ``,
      `\`\`\`${autopsy.patchDraft.language} ${autopsy.patchDraft.filename}`,
      autopsy.patchDraft.content.trimEnd(),
      `\`\`\``,
      ``,
    );
  }

  return lines.join("\n");
}
