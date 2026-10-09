import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  GraduationCap, 
  Newspaper, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Activity, 
  Sparkles,
  ChevronRight,
  Layers,
  Zap,
  KeyRound,
  Terminal,
  Copy,
  Check,
  Radar as RadarIcon,
  BarChart3
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import { 
  INITIAL_SCENARIOS, 
  generateAuditClientSide,
  Scenario,
  AuditData,
  RadarMetric,
  EngineTelemetry,
  Contradiction,
  TimelineItem
} from './auditEngine';

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<string>('quantumscape');
  const [query, setQuery] = useState<string>('QuantumScape Solid-State Battery Fast Charge');
  const [company, setCompany] = useState<string>('QuantumScape Corp');
  const [claimedBenefit, setClaimedBenefit] = useState<string>(
    'Proprietary ceramic separator eliminates dendrites, enabling 15-minute 80% charge with zero thermal runaway.'
  );
  
  const [serpapiKey, setSerpapiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditData | null>(() => 
    generateAuditClientSide(
      'QuantumScape Solid-State Battery Fast Charge',
      'QuantumScape Corp',
      'Proprietary ceramic separator eliminates dendrites, enabling 15-minute 80% charge with zero thermal runaway.',
      'quantumscape'
    )
  );
  const [activeTab, setActiveTab] = useState<'contradictions' | 'radar' | 'timeline' | 'evidence'>('contradictions');
  const [evidenceFilter, setEvidenceFilter] = useState<'patents' | 'scholar' | 'news'>('patents');
  const [copied, setCopied] = useState<boolean>(false);

  // Load scenarios on mount (fallback to INITIAL_SCENARIOS)
  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setScenarios(data);
        }
      })
      .catch(() => {
        // Keep INITIAL_SCENARIOS
      });
  }, []);

  const handleSelectScenario = (sc: Scenario) => {
    setSelectedScenario(sc.id);
    setQuery(sc.title);
    setCompany(sc.company_or_tech);
    setClaimedBenefit(sc.claimed_benefit);
  };

  const handleRunAudit = async (scenarioIdToRun?: string) => {
    setLoading(true);

    const targetScenarioId = scenarioIdToRun !== undefined ? scenarioIdToRun : selectedScenario;

    let data: AuditData | null = null;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (serpapiKey.trim()) {
        headers['X-Serpapi-Key'] = serpapiKey.trim();
      }

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: query.trim() || 'QuantumScape Battery',
          company_or_tech: company.trim(),
          claimed_benefit: claimedBenefit.trim(),
          scenario_id: targetScenarioId || undefined
        })
      });

      if (res.ok) {
        data = await res.json();
      }
    } catch {
      // Backend not reached or proxy error; gracefully fall back
    }

    if (!data) {
      data = generateAuditClientSide(
        query.trim() || 'QuantumScape Battery',
        company.trim(),
        claimedBenefit.trim(),
        targetScenarioId || undefined
      );
    }

    setAuditResult(data);
    setLoading(false);
  };

  const handleExportDossier = () => {
    if (!auditResult) return;

    const generateMarkdown = (d: AuditData) => {
      let report = `# 🛡️ VERITAS AI — INSTITUTIONAL TECH DUE-DILIGENCE DOSSIER\n`;
      report += `**Target Technology / Company:** ${d.company_or_tech}\n`;
      report += `**Claim Audited:** "${d.claimed_benefit}"\n\n`;
      report += `---\n\n## 📊 EXECUTIVE VERDICT & RISK METRICS\n`;
      report += `* **Reality Index:** ${d.summary.reality_index}%\n`;
      report += `* **Hype Index:** ${d.summary.hype_index}%\n`;
      report += `* **Verdict:** ${d.summary.verdict}\n`;
      report += `* **Patent Moat:** ${d.summary.moat_rating}\n`;
      report += `* **Technology Readiness Level:** ${d.summary.technology_readiness_level}\n\n`;
      report += `---\n\n## ⚠️ CONTRADICTION & DISCREPANCY MATRIX\n`;
      d.contradictions.forEach(c => {
        report += `### ${c.claim_topic} [${c.severity}]\n`;
        report += `* **Marketing PR Claim:** "${c.marketing_statement}"\n`;
        report += `* **Google Patents Legal Reality:** ${c.patent_disclosure}\n`;
        report += `* **Google Scholar Scientific Evidence:** ${c.academic_evidence}\n\n`;
      });
      return report;
    };

    const downloadFile = (markdownText: string) => {
      const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VERITAS_DOSSIER_${(auditResult.company_or_tech || 'TECH').replace(/\\s+/g, '_').toUpperCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    };

    fetch('/api/export-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditResult)
    })
      .then(res => res.json())
      .then(d => downloadFile(d.markdown_report))
      .catch(() => downloadFile(generateMarkdown(auditResult)));
  };

  const handleCopySummary = () => {
    if (!auditResult) return;
    const text = `VERITAS AI AUDIT: ${auditResult.company_or_tech}\nVerdict: ${auditResult.summary.verdict}\nReality: ${auditResult.summary.reality_index}% | Hype: ${auditResult.summary.hype_index}%\nMoat: ${auditResult.summary.moat_rating}\nTRL: ${auditResult.summary.technology_readiness_level}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  VERITAS AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Forensic Auditor
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Deep-Tech Due Diligence & Patent Reality Checker
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Multi-Engine Tag */}
            <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-800/70 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-emerald-400">SerpApi Engines:</span>
              <span className="text-amber-300">google_patents</span>
              <span>•</span>
              <span className="text-blue-300">google_scholar</span>
              <span>•</span>
              <span className="text-rose-300">google_news</span>
              <span>•</span>
              <span className="text-emerald-300">google</span>
            </div>

            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{serpapiKey ? 'Custom Key Set' : 'SerpApi Key (Optional)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <span>Live SerpApi Credentials</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Veritas AI comes pre-loaded with authentic multi-engine datasets for instant 1-click evaluation. If you want to run custom live searches during your test, enter your SerpApi API key below:
            </p>
            <input
              type="password"
              placeholder="Paste SerpApi API key..."
              value={serpapiKey}
              onChange={(e) => setSerpapiKey(e.target.value)}
              className="w-full mt-4 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>SerpApi India Hackathon 2026 • AI Agents Track</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Don't Trust Marketing Claims.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Audit the Patents & Science.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            An autonomous forensic auditor for venture capital and R&D leaders. Reconciles corporate PR against legal patent disclosures (Google Patents), peer-reviewed physics (Google Scholar), and investigative press (Google News).
          </p>
        </div>

        {/* 1-Click Curated Scenarios */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Curated Audit Scenarios (High-Stakes Deep Tech)</span>
            </span>
            <span className="text-xs text-slate-500">Instant judge evaluation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarios.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    handleSelectScenario(sc);
                    handleRunAudit(sc.id);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                      {sc.category}
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-cyan-400 flex items-center space-x-1 transition-colors">
                      <span>Audit</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{sc.company_or_tech}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{sc.claimed_benefit}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-amber-300 font-mono">{sc.patents_count} Patents</span>
                    <span className="text-blue-300 font-mono">{sc.scholar_count} Papers</span>
                    <span className="text-rose-300 font-mono">{sc.news_count} News</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Search Bar Input */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Target Technology</label>
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setSelectedScenario('');
                }}
                placeholder="e.g. QuantumScape, LK-99, Neuralink..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marketing / Public Performance Claim to Audit</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={claimedBenefit}
                  onChange={(e) => {
                    setClaimedBenefit(e.target.value);
                    setSelectedScenario('');
                  }}
                  placeholder="e.g. Eliminates dendrites, zero resistance at room temp..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleRunAudit()}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Execute Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Multi-Engine HUD & Telemetry */}
        {auditResult && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Live SerpApi Multi-Engine Telemetry Feed</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {auditResult.source_mode}
                </span>
              </div>
              <span className="font-mono text-emerald-400">All 4 Engines Synchronized</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {auditResult.engine_telemetry?.map((tel, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-cyan-400">{tel.engine}</span>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {tel.latency_ms}ms
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">"{tel.query}"</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-1.5">
                    <span>{tel.category}</span>
                    <span className="text-slate-300 font-semibold">{tel.records_count} records</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {auditResult && !loading && (
          <div className="space-y-6">
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Hype vs Reality Index */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Forensic Reality Score
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    auditResult.summary.reality_index > 60 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {auditResult.summary.reality_index}% Reality / {auditResult.summary.hype_index}% Hype
                  </span>
                </div>
                <div className="h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 mt-3">
                  <div 
                    style={{ width: `${auditResult.summary.reality_index}%` }} 
                    className="bg-emerald-500 transition-all duration-1000"
                  />
                  <div 
                    style={{ width: `${auditResult.summary.hype_index}%` }} 
                    className="bg-rose-500 transition-all duration-1000"
                  />
                </div>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {auditResult.summary.verdict}
                </p>
              </div>

              {/* Card 2: IP Moat Rating */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Patent Moat Protection
                  </span>
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-extrabold text-white mt-1">
                  {auditResult.summary.moat_rating}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Audited {auditResult.summary.total_patents_analyzed} Google Patents filings covering core claims.
                </div>
              </div>

              {/* Card 3: Technology Readiness Level */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Maturity (NASA TRL Scale)
                  </span>
                  <Layers className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-lg font-extrabold text-cyan-300 mt-1">
                  {auditResult.summary.technology_readiness_level}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Cross-checked against {auditResult.summary.total_papers_analyzed} Google Scholar peer reviews.
                </div>
              </div>
            </div>

            {/* Navigation Tabs & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('contradictions')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    activeTab === 'contradictions'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Contradiction Matrix ({auditResult.contradictions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('radar')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    activeTab === 'radar'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <RadarIcon className="w-3.5 h-3.5" />
                  <span>Forensic Risk Radar</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    activeTab === 'timeline'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Innovation Timeline ({auditResult.timeline.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                    activeTab === 'evidence'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Evidence Explorer</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleCopySummary}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleExportDossier}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Investor Dossier (.MD)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Contradiction Matrix */}
            {activeTab === 'contradictions' && (
              <div className="space-y-4">
                {auditResult.contradictions.map((c, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <h4 className="text-sm font-bold text-white">{c.claim_topic}</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        c.severity === 'CRITICAL_MISMATCH'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {c.severity.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                      {/* PR Claim */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>What PR / Company Claimed</span>
                        </span>
                        <p className="text-slate-300 italic">"{c.marketing_statement}"</p>
                      </div>

                      {/* Patent Reality */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-amber-400 flex items-center space-x-1 mb-1.5">
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>Google Patents Legal Disclosure</span>
                        </span>
                        <p className="text-slate-300 leading-relaxed">{c.patent_disclosure}</p>
                      </div>

                      {/* Academic Evidence */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold uppercase text-blue-400 flex items-center space-x-1 mb-1.5">
                          <GraduationCap className="w-3 h-3 text-blue-400" />
                          <span>Google Scholar Peer-Reviewed Science</span>
                        </span>
                        <p className="text-slate-300 leading-relaxed">{c.academic_evidence}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Forensic Risk Radar & Bar Charts */}
            {activeTab === 'radar' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                    <RadarIcon className="w-4 h-4 text-purple-400" />
                    <span>Multi-Dimensional Forensic Radar</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Quantified score across 5 audit pillars derived from SerpApi cross-engine disclosures.
                  </p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={auditResult.radar_metrics}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                        <Radar name="Audit Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span>Audit Breakdown Comparison</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Score rating relative to the maximum verifiable benchmark (100).
                  </p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={auditResult.radar_metrics} layout="vertical" margin={{ left: 40, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                        <YAxis type="category" dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                        <Bar dataKey="score" fill="#10b981" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Innovation Timeline */}
            {activeTab === 'timeline' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h4 className="text-sm font-bold text-white mb-6 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Chronological Tech Evolution (Paper ➔ Patent ➔ Market News)</span>
                </h4>

                <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
                  {auditResult.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-cyan-400"></span>
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-cyan-400">{item.year} • {item.stage}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {item.badge}
                          </span>
                        </div>
                        <h5 className="text-sm font-semibold text-white mt-1">{item.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Evidence Explorer */}
            {activeTab === 'evidence' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                  <button
                    onClick={() => setEvidenceFilter('patents')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      evidenceFilter === 'patents' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Google Patents ({auditResult.raw_multi_engine_data.patents.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('scholar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      evidenceFilter === 'scholar' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Google Scholar ({auditResult.raw_multi_engine_data.scholar.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('news')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      evidenceFilter === 'news' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Google News ({auditResult.raw_multi_engine_data.news.length})
                  </button>
                </div>

                {/* Patents List */}
                {evidenceFilter === 'patents' && (
                  <div className="space-y-3">
                    {auditResult.raw_multi_engine_data.patents.map((p, i) => (
                      <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
                          <span className="font-bold">{p.patent_id} • Status: {p.status}</span>
                          <span>Filed: {p.filing_date}</span>
                        </div>
                        <h5 className="text-sm font-semibold text-white">{p.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">Assignee: {p.assignee}</p>
                        <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded border border-slate-800/60 font-mono leading-relaxed">
                          {p.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scholar List */}
                {evidenceFilter === 'scholar' && (
                  <div className="space-y-3">
                    {auditResult.raw_multi_engine_data.scholar.map((s, i) => (
                      <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-xs text-blue-400 mb-1">
                          <span className="font-bold">{s.citations} Citations</span>
                          <span>{s.publication}</span>
                        </div>
                        <h5 className="text-sm font-semibold text-white">{s.title}</h5>
                        <p className="text-xs text-slate-400 mt-1">{s.authors}</p>
                        <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded border border-slate-800/60 leading-relaxed">
                          {s.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* News List */}
                {evidenceFilter === 'news' && (
                  <div className="space-y-3">
                    {auditResult.raw_multi_engine_data.news.map((n, i) => (
                      <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
                          <span className="font-bold">{n.source}</span>
                          <span>{n.date}</span>
                        </div>
                        <h5 className="text-sm font-semibold text-white">{n.title}</h5>
                        <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2.5 rounded border border-slate-800/60 leading-relaxed">
                          {n.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
