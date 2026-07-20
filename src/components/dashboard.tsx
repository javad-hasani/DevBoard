"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Activity, ArrowUpRight, Check, Code2, Download, FileSpreadsheet, GitCommitHorizontal, GitCompareArrows, GitFork, GitPullRequest, Github, Languages, LoaderCircle, Menu, Moon, Search, ShieldCheck, Sparkles, Star, Sun, X } from "lucide-react";
import type { Analysis, Repository } from "@/domain/github";
import { dictionaries, type Locale } from "@/i18n/dictionary";
import { compactNumber } from "@/lib/utils";
import { exportExcel, exportPdf } from "@/lib/export-report";
import { ActivityChart, LanguageChart } from "./charts";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

const qualityColor = (value: number) => value >= 80 ? "#62d393" : value >= 55 ? "#f3c84b" : "#ee6b64";
const localeTags: Record<Locale, string> = { fa: "fa-IR", en: "en-US", ar: "ar-SA" };
const localeOptions: Array<{ value: Locale; label: string; code: string }> = [
  { value: "fa", label: "فارسی", code: "FA" },
  { value: "en", label: "English", code: "EN" },
  { value: "ar", label: "العربية", code: "AR" },
];

const StatCard = ({ icon: Icon, label, value, accent }: { icon: typeof Github; label: string; value: string; accent: string }) => (
  <Card className="stat-card"><CardContent className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-xl" style={{ background: `${accent}18`, color: accent }}><Icon size={20} /></span><div><p className="text-xs text-[var(--muted)]">{label}</p><strong className="mt-1 block text-2xl tracking-tight">{value}</strong></div></CardContent></Card>
);

const ScoreRing = ({ value, size = 72 }: { value: number; size?: number }) => (
  <div className="score-ring" style={{ width: size, height: size, background: `conic-gradient(${qualityColor(value)} ${value * 3.6}deg, var(--surface-3) 0deg)` }}><span>{value}</span></div>
);

const RepositoryCard = ({ repo, locale }: { repo: Repository; locale: Locale }) => {
  const t = dictionaries[locale];
  return <Card className="repo-card overflow-hidden"><CardContent>
    <div className="mb-5 flex items-start justify-between gap-4"><div className="min-w-0"><a href={repo.url} target="_blank" className="group flex items-center gap-1.5 text-lg font-bold hover:text-violet-500">{repo.name}<ArrowUpRight size={15} className="opacity-0 transition group-hover:opacity-100" /></a><p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--muted)]">{repo.description || "—"}</p></div><ScoreRing value={repo.quality.total} size={62} /></div>
    <div className="mb-4 flex flex-wrap gap-3 text-xs text-[var(--muted)]"><span className="flex items-center gap-1"><i className="size-2 rounded-full bg-violet-500" />{repo.language}</span><span className="flex items-center gap-1"><Star size={13} />{compactNumber(repo.stars, localeTags[locale])}</span><span className="flex items-center gap-1"><GitFork size={13} />{compactNumber(repo.forks, localeTags[locale])}</span><span className="flex items-center gap-1"><GitCommitHorizontal size={13} />{compactNumber(repo.commits, localeTags[locale])}</span></div>
    <div className="grid grid-cols-4 gap-2">{(["readme", "tests", "license", "actions"] as const).map((key) => <div key={key} title={t.checks[key]} className={`check-pill ${repo[`has${key === "readme" ? "Readme" : key.charAt(0).toUpperCase() + key.slice(1)}` as keyof Repository] ? "is-ok" : ""}`}>{repo[`has${key === "readme" ? "Readme" : key.charAt(0).toUpperCase() + key.slice(1)}` as keyof Repository] ? <Check size={13} /> : <X size={13} />}<span>{key === "readme" ? "DOC" : key.slice(0, 3).toUpperCase()}</span></div>)}</div>
    {repo.suggestions.length > 0 && <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-5 text-[var(--muted)]"><Sparkles className="me-1 inline text-violet-500" size={14} />{t.suggestions[repo.suggestions[0] as keyof typeof t.suggestions]}</div>}
  </CardContent></Card>;
};

const ComparePanel = ({ repositories, locale }: { repositories: Repository[]; locale: Locale }) => {
  const [left, setLeft] = useState(repositories[0]?.id);
  const [right, setRight] = useState(repositories[1]?.id);
  const first = repositories.find((repo) => repo.id === left) ?? repositories[0];
  const second = repositories.find((repo) => repo.id === right) ?? repositories[1];
  const t = dictionaries[locale];
  if (!first || !second) return null;
  const metrics = [
    [t.score, first.quality.total, second.quality.total],
    [t.stars, first.stars, second.stars],
    [t.commits, first.commits, second.commits],
    [t.prs, first.pullRequests, second.pullRequests],
  ] as const;
  return <Card id="compare"><CardHeader><div><h2>{t.compare}</h2><p className="section-help">{t.compareHelp}</p></div><GitCompareArrows className="text-violet-500" /></CardHeader><CardContent>
    <div className="mb-6 grid gap-3 sm:grid-cols-2"><select value={left} onChange={(event) => setLeft(Number(event.target.value))}>{repositories.map((repo) => <option key={repo.id} value={repo.id}>{repo.name}</option>)}</select><select value={right} onChange={(event) => setRight(Number(event.target.value))}>{repositories.map((repo) => <option key={repo.id} value={repo.id}>{repo.name}</option>)}</select></div>
    <div className="compare-grid"><strong>{first.name}</strong><span className="text-center text-xs text-[var(--muted)]">VS</span><strong className="text-end">{second.name}</strong>{metrics.map(([label, a, b]) => <div className="contents" key={label}><div><b>{compactNumber(a, localeTags[locale])}</b><Progress value={a / Math.max(a, b) * 100} /></div><span className="text-center text-xs text-[var(--muted)]">{label}</span><div className="text-end"><b>{compactNumber(b, localeTags[locale])}</b><Progress value={b / Math.max(a, b) * 100} color="#43c6db" /></div></div>)}</div>
  </CardContent></Card>;
};

export const Dashboard = () => {
  const [locale, setLocale] = useState<Locale>("fa");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState(false);
  const [languageMenu, setLanguageMenu] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const t = dictionaries[locale];
  const direction = locale === "en" ? "ltr" : "rtl";

  const loadDemo = async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/demo");
    setAnalysis(await response.json());
    setLoading(false);
  };

  useEffect(() => { void loadDemo(); }, []);

  const analyze = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/.test(username.trim())) { setError(t.errors.invalid); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAnalysis(result);
    } catch (reason) {
      setError(reason instanceof Error && reason.message === "NOT_FOUND" ? t.errors.missing : t.errors.generic);
    } finally { setLoading(false); }
  };

  const averageQuality = useMemo(() => analysis ? Math.round(analysis.repositories.reduce((sum, repo) => sum + repo.quality.total, 0) / Math.max(analysis.repositories.length, 1)) : 0, [analysis]);

  return <div dir={direction} lang={locale} className="min-h-screen">
    <header className="topbar"><div className="container flex h-16 items-center justify-between gap-4"><a href="#top" className="flex items-center gap-2 text-lg font-black"><span className="logo-mark"><Activity size={20} /></span>DevBoard</a><nav className={menu ? "is-open" : ""}>{t.nav.map((item, index) => <a key={item} href={["#overview", "#repositories", "#compare", "#activity"][index]} onClick={() => setMenu(false)}>{item}</a>)}</nav><div className="flex items-center gap-1"><div className="language-picker"><Button variant="ghost" className="language-trigger" onClick={() => setLanguageMenu(!languageMenu)} aria-label="Language" aria-expanded={languageMenu}><Languages size={18} /><span>{localeOptions.find((option) => option.value === locale)?.code}</span></Button>{languageMenu && <div className="language-menu" role="menu">{localeOptions.map((option) => <button key={option.value} type="button" role="menuitem" lang={option.value} dir={option.value === "en" ? "ltr" : "rtl"} className={option.value === locale ? "is-active" : ""} onClick={() => { setLocale(option.value); setLanguageMenu(false); }}><span>{option.label}</span><small>{option.code}</small>{option.value === locale && <Check size={14} />}</button>)}</div>}</div><Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Theme">{resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</Button><Button variant="ghost" size="icon" className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Menu"><Menu size={20} /></Button></div></div></header>
    <main id="top" className="container pb-16 pt-10">
      <section className="hero"><div><span className="eyebrow"><Sparkles size={14} />{t.eyebrow}</span><h1>{t.search}</h1><p>{t.subtitle}</p></div><form onSubmit={analyze} className="search-box"><div className="relative flex-1"><Github className="absolute start-4 top-3.5 text-[var(--muted)]" size={20} /><Input value={username} onChange={(event) => setUsername(event.target.value)} className="ps-12" placeholder={t.placeholder} aria-label={t.placeholder} dir="ltr" /></div><Button type="submit" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" size={18} /> : <Search size={18} />}{t.analyze}</Button><Button type="button" variant="secondary" onClick={() => void loadDemo()}>{t.demo}</Button>{error && <p className="w-full text-sm text-red-500">{error}</p>}</form></section>
      {loading && !analysis ? <div className="loading-state"><LoaderCircle className="animate-spin text-violet-500" size={30} /></div> : analysis && <>
        <section id="overview" className="profile-strip"><div className="flex min-w-0 items-center gap-4"><Image src={analysis.profile.avatarUrl} alt={analysis.profile.name} width={48} height={48} unoptimized /><div className="min-w-0"><h2 className="truncate">{analysis.profile.name}</h2><p className="truncate text-sm text-[var(--muted)]" dir="ltr">@{analysis.profile.login} · {compactNumber(analysis.profile.followers, localeTags[locale])} {t.followers}</p></div></div><span className="data-source"><i />{analysis.source === "demo" ? t.demoData : t.liveData}</span><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => void exportPdf(analysis)}><Download size={15} />{t.exportPdf}</Button><Button variant="secondary" size="sm" onClick={() => void exportExcel(analysis)}><FileSpreadsheet size={15} />{t.exportExcel}</Button></div></section>
        <div className="mb-4 flex items-end justify-between"><div><h2 className="section-title">{t.overview}</h2><p className="section-help">{t.subtitle}</p></div><p className="hidden text-xs text-[var(--muted)] sm:block">{t.analyzed} {new Date(analysis.generatedAt).toLocaleString(localeTags[locale])}</p></div>
        <section className="stats-grid"><StatCard icon={Code2} label={t.repositories} value={compactNumber(analysis.profile.publicRepos, localeTags[locale])} accent="#7c6cff" /><StatCard icon={Star} label={t.stars} value={compactNumber(analysis.profile.totalStars, localeTags[locale])} accent="#f3c84b" /><StatCard icon={GitCommitHorizontal} label={t.commits} value={compactNumber(analysis.profile.totalCommits, localeTags[locale])} accent="#43c6db" /><StatCard icon={GitPullRequest} label={t.prs} value={compactNumber(analysis.profile.totalPullRequests, localeTags[locale])} accent="#62d393" /></section>
        <section className="charts-grid" id="activity"><Card><CardHeader><div><h2>{t.activity}</h2><p className="section-help">{t.recentActivity}</p></div><Activity className="text-violet-500" /></CardHeader><CardContent><ActivityChart data={analysis.activity} /></CardContent></Card><Card><CardHeader><div><h2>{t.languages}</h2><p className="section-help">{t.originalRepositories}</p></div><Code2 className="text-cyan-500" /></CardHeader><CardContent><LanguageChart data={analysis.languages} /></CardContent></Card></section>
        <section className="quality-banner"><div><ShieldCheck /><span><small>{t.quality}</small><strong>{averageQuality}/100</strong></span></div><Progress value={averageQuality} color={qualityColor(averageQuality)} /><ScoreRing value={averageQuality} /></section>
        <section id="repositories"><div className="mb-4"><h2 className="section-title">{t.repoHealth}</h2><p className="section-help">{t.repoAdvice}</p></div><div className="repos-grid">{analysis.repositories.map((repo) => <RepositoryCard key={repo.id} repo={repo} locale={locale} />)}</div></section>
        <section className="mt-7"><ComparePanel repositories={analysis.repositories} locale={locale} /></section>
      </>}
    </main>
    <footer><div className="container flex flex-col items-center justify-between gap-3 py-7 text-sm text-[var(--muted)] sm:flex-row"><span className="flex items-center gap-2"><span className="logo-mark small"><Activity size={14} /></span>DevBoard · {t.footer}</span><a href="https://github.com/javad-hasani/DevBoard" className="hover:text-violet-500">GitHub ↗</a></div></footer>
  </div>;
};
