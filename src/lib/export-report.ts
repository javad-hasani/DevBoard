import type { Analysis } from "@/domain/github";

export const exportExcel = async (analysis: Analysis) => {
  const XLSX = await import("xlsx");
  const rows = analysis.repositories.map((repo) => ({ Repository: repo.name, Language: repo.language, Stars: repo.stars, Forks: repo.forks, Commits: repo.commits, PullRequests: repo.pullRequests, Quality: repo.quality.total, README: repo.hasReadme, Tests: repo.hasTests, License: repo.hasLicense, Actions: repo.hasActions }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Repositories");
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(analysis.activity), "Activity");
  XLSX.writeFile(book, `devboard-${analysis.profile.login}.xlsx`);
};

export const exportPdf = async (analysis: Analysis) => {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  pdf.setFillColor(20, 18, 35);
  pdf.rect(0, 0, 210, 44, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text("DevBoard", 16, 20);
  pdf.setFontSize(11);
  pdf.text(`GitHub intelligence report · @${analysis.profile.login}`, 16, 31);
  pdf.setTextColor(28, 28, 36);
  pdf.setFontSize(16);
  pdf.text(analysis.profile.name, 16, 58);
  pdf.setFontSize(10);
  pdf.text(`Repositories ${analysis.profile.publicRepos}   Stars ${analysis.profile.totalStars}   Commits ${analysis.profile.totalCommits}   Pull requests ${analysis.profile.totalPullRequests}`, 16, 68);
  let y = 84;
  analysis.repositories.forEach((repo, index) => {
    if (y > 270) { pdf.addPage(); y = 20; }
    pdf.setFontSize(12);
    pdf.text(`${index + 1}. ${repo.name}`, 16, y);
    pdf.setFontSize(9);
    pdf.setTextColor(90, 90, 105);
    pdf.text(`${repo.language}  |  Quality ${repo.quality.total}/100  |  Stars ${repo.stars}  |  Commits ${repo.commits}`, 22, y + 7);
    pdf.setTextColor(28, 28, 36);
    y += 18;
  });
  pdf.save(`devboard-${analysis.profile.login}.pdf`);
};
