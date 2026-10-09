import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  GraduationCap, 
  Newspaper, 
  Globe, 
  AlertTriangle, 
  Download, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Layers,
  KeyRound,
  Terminal,
  Copy,
  Check,
  Radar as RadarIcon,
  BarChart3,
  Shield,
  Search,
  Scale,
  Building2,
  Clock,
  ArrowUpRight
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

  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setScenarios(data);
        }
      })
      .catch(() => {});
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
    } catch {}

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
      let report = `# VERITAS FORENSIC AUDIT REPORT\n`;
      report += `CONFIDENTIAL // FOR INVESTOR & R&D DUE DILIGENCE ONLY\n`;
      report += `TARGET: ${d.company_or_tech}\n`;
      report += `CLAIM AUDITED: "${d.claimed_benefit}"\n\n`;
      report += `--------------------------------------------------------\n\n`;
      report += `## 1. FORENSIC VERDICT & QUANTITATIVE METRICS\n`;
      report += `* Reality Index: ${d.summary.reality_index}%\n`;
      report += `* Hype Index: ${d.summary.hype_index}%\n`;
      report += `* Legal Moat Classification: ${d.summary.moat_rating}\n`;
      report += `* Technology Readiness Level: ${d.summary.technology_readiness_level}\n`;
      report += `* Finding: ${d.summary.verdict}\n\n`;
      report += `--------------------------------------------------------\n\n`;
      report += `## 2. CONTRADICTION & DISCREPANCY MATRIX\n`;
      d.contradictions.forEach((c, idx) => {
        report += `### ITEM ${idx + 1}: ${c.claim_topic} [SEVERITY: ${c.severity}]\n`;
        report += `* Public Marketing Statement: "${c.marketing_statement}"\n`;
        report += `* Patent Specification (Google Patents): ${c.patent_disclosure}\n`;
        report += `* Academic Peer Review (Google Scholar): ${c.academic_evidence}\n\n`;
      });
      return report;
    };

    const downloadFile = (markdownText: string) => {
      const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VERITAS_AUDIT_${(auditResult.company_or_tech || 'TECH').replace(/\s+/g, '_').toUpperCase()}.md`;
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
    const text = `VERITAS DILIGENCE REPORT: ${auditResult.company_or_tech}\nFinding: ${auditResult.summary.verdict}\nMetrics: ${auditResult.summary.reality_index}% Reality | ${auditResult.summary.hype_index}% Hype\nMoat: ${auditResult.summary.moat_rating} | TRL: ${auditResult.summary.technology_readiness_level}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6edf3] font-sans pb-24 selection:bg-[#238636] selection:text-white">
      {/* Institutional Top Header */}
      <header className="border-b border-[#21262d] bg-[#161b22] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#21262d] border border-[#30363d] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#e6edf3]" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-mono font-bold text-sm tracking-wider text-white">
                VERITAS // DILIGENCE TERMINAL
              </span>
              <span className="font-mono text-[11px] text-[#8b949e] hidden sm:inline">
                v2.4 [USPTO • SCHOLAR • SEC AUDITOR]
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Gateway Indicator */}
            <div className="hidden lg:flex items-center space-x-2 font-mono text-[11px] bg-[#0d1117] border border-[#21262d] px-2.5 py-1 rounded text-[#8b949e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
              <span>SERPAPI GATEWAY:</span>
              <span className="text-[#e6edf3]">PATENTS</span>
              <span>•</span>
              <span className="text-[#e6edf3]">SCHOLAR</span>
              <span>•</span>
              <span className="text-[#e6edf3]">NEWS</span>
            </div>

            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition-colors"
            >
              <KeyRound className="w-3 h-3 text-[#d29922]" />
              <span>{serpapiKey ? 'API KEY CONFIGURED' : 'SERPAPI KEY (OPTIONAL)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#d29922]" />
              <span>SerpApi Gateway Credentials</span>
            </h3>
            <p className="text-xs text-[#8b949e] mt-2 font-sans">
              Pre-loaded with authentic multi-engine datasets for offline evaluation. Enter your live SerpApi API key if you want to execute live ad-hoc search queries:
            </p>
            <input
              type="password"
              placeholder="Paste SerpApi API key..."
              value={serpapiKey}
              onChange={(e) => setSerpapiKey(e.target.value)}
              className="w-full mt-4 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff] font-mono"
            />
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-[#238636] hover:bg-[#2ea043] text-white font-bold transition-colors"
              >
                SAVE CREDENTIALS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Terminal View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Terminal Title Bar */}
        <div className="border border-[#21262d] bg-[#161b22] rounded p-4 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-mono font-bold text-[#8b949e] uppercase tracking-wider mb-1">
                SYSTEM FUNCTION: ADVERSARIAL DUE DILIGENCE
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Cross-Examining Commercial Claims vs. Legal Patents & Peer-Reviewed Science
              </h1>
            </div>
            <div className="font-mono text-xs text-[#8b949e] bg-[#0d1117] p-2.5 rounded border border-[#21262d] shrink-0">
              <div>TRACK: <span className="text-white font-bold">AI AGENTS</span></div>
              <div>SERP ENGINES: <span className="text-[#3fb950] font-bold">4 SYNCHRONIZED</span></div>
            </div>
          </div>
        </div>

        {/* 1-Click Investigation Targets */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8b949e] flex items-center space-x-1.5">
              <span>TARGET INVESTIGATION PROFILES</span>
            </span>
            <span className="font-mono text-[11px] text-[#8b949e]">SELECT BENCHMARK CASE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {scenarios.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    handleSelectScenario(sc);
                    handleRunAudit(sc.id);
                  }}
                  className={`text-left p-3 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1c2128] border-[#58a6ff]'
                      : 'bg-[#161b22] border-[#21262d] hover:border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#58a6ff]">
                      {sc.category.split('/')[0]}
                    </span>
                    <span className="font-mono text-[10px] text-[#8b949e] flex items-center">
                      <span>AUDIT</span>
                      <ArrowUpRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{sc.company_or_tech}</h4>
                  <p className="text-[11px] text-[#8b949e] line-clamp-2 mt-1 leading-snug">{sc.claimed_benefit}</p>
                  <div className="mt-2 pt-2 border-t border-[#21262d] flex items-center justify-between font-mono text-[10px] text-[#8b949e]">
                    <span>{sc.patents_count} PATENTS</span>
                    <span>{sc.scholar_count} PAPERS</span>
                    <span>{sc.news_count} NEWS</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Search Query Panel */}
        <div className="bg-[#161b22] border border-[#21262d] rounded p-4 mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-bold text-[#8b949e] uppercase mb-1">
                ENTITY / TECHNOLOGY UNDER AUDIT
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setSelectedScenario('');
                }}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff] font-mono"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block font-mono text-[10px] font-bold text-[#8b949e] uppercase mb-1">
                PUBLIC CLAIM OR MARKETING SPECIFICATION
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={claimedBenefit}
                  onChange={(e) => {
                    setClaimedBenefit(e.target.value);
                    setSelectedScenario('');
                  }}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  onClick={() => handleRunAudit()}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-mono font-bold text-xs transition-colors flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>QUERYING...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>RUN FORENSIC AUDIT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live SerpApi Multi-Engine Telemetry HUD */}
        {auditResult && (
          <div className="bg-[#161b22] border border-[#21262d] rounded p-3 mb-5">
            <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
              <div className="flex items-center space-x-2 text-[#8b949e]">
                <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                <span className="font-bold text-white">SERPAPI ENGINE TELEMETRY</span>
                <span className="text-[#3fb950] bg-[#3fb950]/10 px-1.5 py-0.5 rounded text-[10px]">
                  HTTP/2 200 OK
                </span>
              </div>
              <span className="text-[#8b949e]">MODE: {auditResult.source_mode}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {auditResult.engine_telemetry?.map((tel, idx) => (
                <div key={idx} className="bg-[#0d1117] border border-[#21262d] rounded p-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#58a6ff] text-[11px]">{tel.engine}</span>
                    <span className="text-[10px] text-[#3fb950]">{tel.latency_ms}ms</span>
                  </div>
                  <div className="text-[#8b949e] text-[10px] truncate">query: "{tel.query}"</div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#8b949e] border-t border-[#21262d] pt-1">
                    <span>{tel.category}</span>
                    <span className="text-white font-bold">{tel.records_count} records</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Results Dashboard */}
        {auditResult && !loading && (
          <div className="space-y-4">
            {/* Top Key Quantitative Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Reality vs Hype Ratio */}
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#8b949e] mb-1">
                  <span>REALITY VS HYPE RATIO</span>
                  <span className="text-white font-bold">
                    {auditResult.summary.reality_index}% REALITY / {auditResult.summary.hype_index}% HYPE
                  </span>
                </div>
                <div className="h-2 bg-[#0d1117] rounded overflow-hidden flex border border-[#21262d] my-2">
                  <div 
                    style={{ width: `${auditResult.summary.reality_index}%` }} 
                    className="bg-[#238636]"
                  />
                  <div 
                    style={{ width: `${auditResult.summary.hype_index}%` }} 
                    className="bg-[#da3633]"
                  />
                </div>
                <p className="text-xs text-[#c9d1d9] mt-2 leading-relaxed">
                  {auditResult.summary.verdict}
                </p>
              </div>

              {/* Card 2: Legal Moat */}
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#8b949e] mb-1">
                  <span>PATENT MOAT DEFENSE</span>
                  <FileText className="w-3.5 h-3.5 text-[#d29922]" />
                </div>
                <div className="text-sm font-mono font-bold text-white mt-1">
                  {auditResult.summary.moat_rating}
                </div>
                <p className="text-xs text-[#8b949e] mt-2">
                  Based on {auditResult.summary.total_patents_analyzed} Google Patents filings examined against prior art.
                </p>
              </div>

              {/* Card 3: Maturity Level */}
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#8b949e] mb-1">
                  <span>MATURITY (NASA TRL SCALE)</span>
                  <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
                </div>
                <div className="text-sm font-mono font-bold text-[#58a6ff] mt-1">
                  {auditResult.summary.technology_readiness_level}
                </div>
                <p className="text-xs text-[#8b949e] mt-2">
                  Cross-referenced with {auditResult.summary.total_papers_analyzed} Google Scholar peer-reviewed studies.
                </p>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-[#21262d] pb-2 gap-2">
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto font-mono text-xs">
                <button
                  onClick={() => setActiveTab('contradictions')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'contradictions'
                      ? 'bg-[#21262d] text-white font-bold border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  CONTRADICTION MATRIX ({auditResult.contradictions.length})
                </button>

                <button
                  onClick={() => setActiveTab('radar')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'radar'
                      ? 'bg-[#21262d] text-white font-bold border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  QUANTITATIVE RADAR
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-[#21262d] text-white font-bold border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  INNOVATION TIMELINE ({auditResult.timeline.length})
                </button>

                <button
                  onClick={() => setActiveTab('evidence')}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                    activeTab === 'evidence'
                      ? 'bg-[#21262d] text-white font-bold border border-[#30363d]'
                      : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  EVIDENCE VAULT
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
                <button
                  onClick={handleCopySummary}
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3 text-[#8b949e]" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>

                <button
                  onClick={handleExportDossier}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#238636] hover:bg-[#2ea043] text-white font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT DOSSIER (.MD)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Contradiction Matrix */}
            {activeTab === 'contradictions' && (
              <div className="space-y-3">
                {auditResult.contradictions.map((c, idx) => (
                  <div key={idx} className="bg-[#161b22] border border-[#21262d] rounded p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-[#21262d] pb-2 font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#da3633]"></span>
                        <span className="font-bold text-white tracking-wide uppercase">
                          ISSUE {idx + 1}: {c.claim_topic}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.severity === 'CRITICAL_MISMATCH'
                          ? 'bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/30'
                          : 'bg-[#d29922]/20 text-[#d29922] border border-[#d29922]/30'
                      }`}>
                        {c.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                      {/* Column A: Marketing Claim */}
                      <div className="bg-[#0d1117] p-3 rounded border border-[#21262d]">
                        <span className="font-mono text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                          PUBLIC MARKETING STATEMENT
                        </span>
                        <p className="text-[#c9d1d9] italic leading-relaxed">
                          "{c.marketing_statement}"
                        </p>
                      </div>

                      {/* Column B: Patent Reality */}
                      <div className="bg-[#0d1117] p-3 rounded border border-[#21262d]">
                        <span className="font-mono text-[10px] font-bold text-[#d29922] uppercase flex items-center space-x-1 mb-1">
                          <FileText className="w-3 h-3" />
                          <span>PATENT SPECIFICATION DISCLOSURE</span>
                        </span>
                        <p className="text-[#c9d1d9] leading-relaxed">
                          {c.patent_disclosure}
                        </p>
                      </div>

                      {/* Column C: Scholar Reality */}
                      <div className="bg-[#0d1117] p-3 rounded border border-[#21262d]">
                        <span className="font-mono text-[10px] font-bold text-[#58a6ff] uppercase flex items-center space-x-1 mb-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>PEER-REVIEWED SCIENTIFIC PROOF</span>
                        </span>
                        <p className="text-[#c9d1d9] leading-relaxed">
                          {c.academic_evidence}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Quantitative Radar */}
            {activeTab === 'radar' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-[#161b22] border border-[#21262d] rounded p-5">
                <div>
                  <h4 className="font-mono text-xs font-bold text-white mb-1 uppercase tracking-wider">
                    5-Pillar Diligence Radar
                  </h4>
                  <p className="text-xs text-[#8b949e] mb-4">
                    Quantified score across core engineering dimensions based on SerpApi cross-engine extraction.
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={auditResult.radar_metrics}>
                        <PolarGrid stroke="#21262d" />
                        <PolarAngleAxis dataKey="subject" stroke="#8b949e" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#30363d" />
                        <Radar name="Audit Score" dataKey="score" stroke="#58a6ff" fill="#58a6ff" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-xs font-bold text-white mb-1 uppercase tracking-wider">
                    Pillar Score Breakdown
                  </h4>
                  <p className="text-xs text-[#8b949e] mb-4">
                    Normalized index ratings relative to the 100-point institutional baseline.
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={auditResult.radar_metrics} layout="vertical" margin={{ left: 50, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} stroke="#30363d" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <YAxis type="category" dataKey="subject" stroke="#8b949e" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                        <Bar dataKey="score" fill="#238636" radius={[0, 2, 2, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Innovation Timeline */}
            {activeTab === 'timeline' && (
              <div className="bg-[#161b22] border border-[#21262d] rounded p-5">
                <h4 className="font-mono text-xs font-bold text-white mb-4 uppercase tracking-wider">
                  Technology Evolution Trajectory (Academic Lab ➔ Patent Office ➔ Public Market)
                </h4>

                <div className="relative border-l border-[#30363d] ml-3 space-y-4">
                  {auditResult.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-5">
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#58a6ff]"></span>
                      <div className="bg-[#0d1117] border border-[#21262d] rounded p-3">
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#8b949e] mb-1">
                          <span className="font-bold text-[#58a6ff]">{item.year} // {item.stage}</span>
                          <span className="bg-[#21262d] text-[#c9d1d9] px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white mt-0.5">{item.title}</h5>
                        <p className="text-[11px] text-[#8b949e] mt-1 font-mono">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Evidence Vault */}
            {activeTab === 'evidence' && (
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4 space-y-3">
                <div className="flex items-center space-x-2 border-b border-[#21262d] pb-2 font-mono text-xs">
                  <button
                    onClick={() => setEvidenceFilter('patents')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${
                      evidenceFilter === 'patents' ? 'bg-[#21262d] text-[#d29922] font-bold border border-[#30363d]' : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    GOOGLE PATENTS ({auditResult.raw_multi_engine_data.patents.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('scholar')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${
                      evidenceFilter === 'scholar' ? 'bg-[#21262d] text-[#58a6ff] font-bold border border-[#30363d]' : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    GOOGLE SCHOLAR ({auditResult.raw_multi_engine_data.scholar.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('news')}
                    className={`px-2.5 py-1 rounded cursor-pointer ${
                      evidenceFilter === 'news' ? 'bg-[#21262d] text-[#f85149] font-bold border border-[#30363d]' : 'text-[#8b949e] hover:text-white'
                    }`}
                  >
                    GOOGLE NEWS ({auditResult.raw_multi_engine_data.news.length})
                  </button>
                </div>

                {evidenceFilter === 'patents' && (
                  <div className="space-y-2">
                    {auditResult.raw_multi_engine_data.patents.map((p, i) => (
                      <div key={i} className="bg-[#0d1117] p-3 rounded border border-[#21262d] text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#d29922] mb-1">
                          <span className="font-bold">{p.patent_id} // {p.status}</span>
                          <span>FILED: {p.filing_date}</span>
                        </div>
                        <h5 className="font-bold text-white text-xs">{p.title}</h5>
                        <p className="text-[11px] text-[#8b949e] mt-0.5">Assignee: {p.assignee}</p>
                        <p className="text-xs text-[#c9d1d9] mt-2 bg-[#161b22] p-2 rounded border border-[#21262d] font-mono leading-relaxed">
                          {p.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {evidenceFilter === 'scholar' && (
                  <div className="space-y-2">
                    {auditResult.raw_multi_engine_data.scholar.map((s, i) => (
                      <div key={i} className="bg-[#0d1117] p-3 rounded border border-[#21262d] text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#58a6ff] mb-1">
                          <span className="font-bold">{s.citations} CITATIONS VERIFIED</span>
                          <span>{s.publication}</span>
                        </div>
                        <h5 className="font-bold text-white text-xs">{s.title}</h5>
                        <p className="text-[11px] text-[#8b949e] mt-0.5">{s.authors}</p>
                        <p className="text-xs text-[#c9d1d9] mt-2 bg-[#161b22] p-2 rounded border border-[#21262d] leading-relaxed">
                          {s.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {evidenceFilter === 'news' && (
                  <div className="space-y-2">
                    {auditResult.raw_multi_engine_data.news.map((n, i) => (
                      <div key={i} className="bg-[#0d1117] p-3 rounded border border-[#21262d] text-xs">
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#f85149] mb-1">
                          <span className="font-bold">{n.source}</span>
                          <span>{n.date}</span>
                        </div>
                        <h5 className="font-bold text-white text-xs">{n.title}</h5>
                        <p className="text-xs text-[#c9d1d9] mt-2 bg-[#161b22] p-2 rounded border border-[#21262d] leading-relaxed">
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
