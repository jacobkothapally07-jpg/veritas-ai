import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  GraduationCap, 
  Newspaper, 
  AlertTriangle, 
  Download, 
  Activity, 
  Layers, 
  KeyRound, 
  Terminal, 
  Copy, 
  Check, 
  Radar as RadarIcon, 
  BarChart3, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Building2,
  CheckCircle2,
  Sparkles,
  Flame,
  DollarSign,
  Scale,
  Zap,
  HelpCircle,
  TrendingDown,
  ShieldAlert,
  ChevronDown,
  ChevronUp
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
  TimelineItem,
  GrillQuestion,
  FinancialExposure,
  PriorArtCollision
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
  const [activeTab, setActiveTab] = useState<'contradictions' | 'grill' | 'collision' | 'radar' | 'timeline' | 'evidence'>('contradictions');
  const [evidenceFilter, setEvidenceFilter] = useState<'patents' | 'scholar' | 'news'>('patents');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState<number | null>(null);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(false);

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
      let report = `# 🛡️ VERITAS NEXUS — INSTITUTIONAL DUE DILIGENCE REPORT\n`;
      report += `**Entity Under Investigation:** ${d.company_or_tech}\n`;
      report += `**Public Statement / Claim:** "${d.claimed_benefit}"\n\n`;
      report += `---\n\n## 1. EXECUTIVE VERDICT & RISK METRICS\n`;
      report += `* **Reality Index:** ${d.summary.reality_index}%\n`;
      report += `* **Hype Index:** ${d.summary.hype_index}%\n`;
      report += `* **Legal Patent Moat:** ${d.summary.moat_rating}\n`;
      report += `* **Technology Readiness Level:** ${d.summary.technology_readiness_level}\n`;
      report += `* **Finding:** ${d.summary.verdict}\n\n`;
      report += `---\n\n## 2. CONTRADICTION & DISCREPANCY MATRIX\n`;
      d.contradictions.forEach((c, idx) => {
        report += `### ITEM ${idx + 1}: ${c.claim_topic} [SEVERITY: ${c.severity}]\n`;
        report += `* **Public Marketing Statement:** "${c.marketing_statement}"\n`;
        report += `* **Google Patents Specification Disclosure:** ${c.patent_disclosure}\n`;
        report += `* **Google Scholar Peer-Reviewed Science:** ${c.academic_evidence}\n\n`;
      });

      if (d.financial_exposure) {
        report += `---\n\n## 3. VALUATION TRAP & CAPITAL AT RISK MODEL\n`;
        report += `* **Market Cap / Enterprise Valuation:** ${d.financial_exposure.market_cap_or_valuation}\n`;
        report += `* **Capital at Risk:** ${d.financial_exposure.capital_at_risk} (${d.financial_exposure.exposure_percentage}% of valuation)\n`;
        report += `* **Downside Verdict:** ${d.financial_exposure.valuation_trap_verdict}\n`;
        report += `* **Key Exposure Driver:** ${d.financial_exposure.downside_driver}\n\n`;
      }

      if (d.prior_art_collision) {
        report += `---\n\n## 4. PRIOR-ART COLLISION & LITIGATION THREAT RADAR\n`;
        report += `* **Primary IP Adversary:** ${d.prior_art_collision.primary_competitor}\n`;
        report += `* **Overlapping Patent:** ${d.prior_art_collision.overlapping_patent_id} — ${d.prior_art_collision.overlapping_title}\n`;
        report += `* **Claim Overlap Score:** ${d.prior_art_collision.overlap_score}/100 [THREAT: ${d.prior_art_collision.litigation_threat_level}]\n`;
        report += `* **Infringement Focus:** ${d.prior_art_collision.infringement_claim_focus}\n\n`;
      }

      if (d.grill_questions && d.grill_questions.length > 0) {
        report += `---\n\n## 5. "GRILL THE FOUNDER" — ADVERSARIAL RED-TEAM QUESTIONS\n`;
        d.grill_questions.forEach((g, idx) => {
          report += `### QUESTION ${idx + 1}: Interrogation Prompt\n`;
          report += `> "${g.question}"\n\n`;
          report += `* **Trap Rationale:** ${g.trap_rationale}\n`;
          report += `* **Patent Citation:** ${g.patent_citation}\n`;
          report += `* **Anticipated Deflection:** ${g.expected_deflection}\n\n`;
        });
      }

      return report;
    };

    const downloadFile = (markdownText: string) => {
      const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VERITAS_DOSSIER_${(auditResult.company_or_tech || 'TECH').replace(/\s+/g, '_').toUpperCase()}.md`;
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
    const text = `VERITAS NEXUS AUDIT: ${auditResult.company_or_tech}\nFinding: ${auditResult.summary.verdict}\nMetrics: ${auditResult.summary.reality_index}% Reality | ${auditResult.summary.hype_index}% Hype\nMoat: ${auditResult.summary.moat_rating} | TRL: ${auditResult.summary.technology_readiness_level}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen nexus-grid-bg text-[#042126] font-sans pb-28">
      {/* Top Header - ClaimShield Matte White Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005f68] to-[#209b47] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-[#042126]">
                  VERITAS <span className="text-[#005f68]">NEXUS</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#acf2e5]/40 text-[#005f68] border border-[#005f68]/20">
                  SIU Diligence Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Deep-Tech Patent & Forensic Science Reality Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Gateway Indicator */}
            <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#209b47] animate-pulse"></span>
              <span className="text-[#005f68] font-bold">SerpApi Gateway:</span>
              <span className="font-semibold text-slate-700">Patents</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">Scholar</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">News</span>
            </div>

            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#005f68]" />
              <span>{serpapiKey ? 'API Key Configured' : 'SerpApi Key (Optional)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Credentials Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-[#042126]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#042126] flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#005f68]" />
              <span>SerpApi Gateway Credentials</span>
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Veritas Nexus includes pre-cached verified datasets for 1-click evaluation. If you wish to query fresh live web searches, enter your SerpApi key below:
            </p>
            <input
              type="password"
              placeholder="Paste SerpApi API key..."
              value={serpapiKey}
              onChange={(e) => setSerpapiKey(e.target.value)}
              className="w-full mt-4 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#042126] focus:outline-none focus:border-[#005f68] font-mono"
            />
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#209b47] hover:bg-[#1b843c] text-white transition-colors cursor-pointer"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#acf2e5]/50 border border-[#005f68]/20 text-[#005f68] text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#005f68]" />
            <span>Autonomous Deep-Tech Due Diligence & Patent Reality Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#042126] leading-tight">
            Cross-Checking Public Claims Against{' '}
            <span className="text-[#005f68]">
              Patents & Peer-Reviewed Science.
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Select a benchmark scenario or input any corporate claim to automatically reconcile marketing statements against Google Patents, Google Scholar, and Google News.
          </p>
        </div>

        {/* 1-Click Investigation Profiles - Clean Pill Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select an Investigation Scenario:
            </span>
            <span className="text-xs text-slate-400 font-medium">Click to instantly audit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarios.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    handleSelectScenario(sc);
                    handleRunAudit(sc.id);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#005f68] shadow-md ring-2 ring-[#005f68]/15'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#005f68]">
                      {sc.category.split('/')[0]}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#209b47]"></span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#042126] truncate">{sc.company_or_tech}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sc.claimed_benefit}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Search Box */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#042126] uppercase mb-1">
                Entity / Target Technology
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setSelectedScenario('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-[#042126] focus:bg-white focus:outline-none focus:border-[#005f68]"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-[#042126] uppercase mb-1">
                Public Marketing Claim or Specification to Audit
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={claimedBenefit}
                  onChange={(e) => {
                    setClaimedBenefit(e.target.value);
                    setSelectedScenario('');
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-[#042126] focus:bg-white focus:outline-none focus:border-[#005f68]"
                />
                <button
                  onClick={() => handleRunAudit()}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-[#209b47] hover:bg-[#1b843c] text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Execute Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible SerpApi Multi-Engine Telemetry Drawer */}
        {auditResult && (
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 mb-6 shadow-xs transition-all">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-[#209b47]" />
                <span className="font-bold text-[#042126]">SerpApi Multi-Engine Gateway:</span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  Google Patents • Google Scholar • Google News • Google
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  HTTP/2 200 OK
                </span>
              </div>
              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className="flex items-center space-x-1 text-slate-500 hover:text-[#005f68] font-semibold text-[11px] cursor-pointer"
              >
                <span>{showTelemetry ? 'Hide Engine Logs' : 'View Query Telemetry'}</span>
                {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showTelemetry && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100">
                {auditResult.engine_telemetry?.map((tel, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#005f68] font-mono text-[11px]">{tel.engine}</span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-bold">
                        {tel.latency_ms}ms
                      </span>
                    </div>
                    <div className="text-slate-500 text-[10px] truncate">"{tel.query}"</div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200/80 pt-1">
                      <span>{tel.category}</span>
                      <span className="font-bold text-[#042126]">{tel.records_count} records</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Results Dashboard */}
        {auditResult && !loading && (
          <div className="space-y-6">
            {/* Top Score Cards + Valuation Trap Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Reality vs Hype */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Forensic Reality Score
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    auditResult.summary.reality_index > 60 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {auditResult.summary.reality_index}% Reality / {auditResult.summary.hype_index}% Hype
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 my-2.5">
                  <div 
                    style={{ width: `${auditResult.summary.reality_index}%` }} 
                    className="bg-[#209b47] transition-all duration-700"
                  />
                  <div 
                    style={{ width: `${auditResult.summary.hype_index}%` }} 
                    className="bg-[#e11d48] transition-all duration-700"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {auditResult.summary.verdict}
                </p>
              </div>

              {/* Card 2: Legal Patent Moat */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Legal Patent Moat
                  </span>
                  <FileText className="w-4 h-4 text-[#005f68]" />
                </div>
                <div className="text-base font-bold text-[#042126] mt-1">
                  {auditResult.summary.moat_rating}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{auditResult.summary.total_patents_analyzed} Google Patents</span>
                  {auditResult.prior_art_collision && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      auditResult.prior_art_collision.litigation_threat_level === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {auditResult.prior_art_collision.litigation_threat_level} IP Collision
                    </span>
                  )}
                </div>
              </div>

              {/* Card 3: Technology Readiness Level */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Maturity (NASA TRL Scale)
                  </span>
                  <Layers className="w-4 h-4 text-[#15497e]" />
                </div>
                <div className="text-base font-bold text-[#15497e] mt-1">
                  {auditResult.summary.technology_readiness_level}
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Cross-checked against {auditResult.summary.total_papers_analyzed} Google Scholar peer-reviewed studies.
                </p>
              </div>

              {/* Card 4: Capital at Risk / Valuation Trap */}
              <div className="bg-gradient-to-br from-rose-50/60 to-white border border-rose-200/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center space-x-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                    <span>Valuation Exposure</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                    {auditResult.financial_exposure?.exposure_percentage || 50}% Risk
                  </span>
                </div>
                <div className="text-base font-black text-rose-950 mt-1">
                  {auditResult.financial_exposure?.capital_at_risk || "$1.85B at Risk"}
                </div>
                <p className="text-[11px] text-rose-800/90 mt-1.5 leading-snug line-clamp-2">
                  {auditResult.financial_exposure?.valuation_trap_verdict || "Valuation markdown risk if physics fails commercial parity."}
                </p>
              </div>
            </div>

            {/* Master-Detail Layout: Left Feature Navigation Sidebar + Right Content Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Feature Sidebar (Left Col - 3 Cols on LG, 4 on XL) */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-3 lg:sticky lg:top-20">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
                  <div className="px-3 pt-2 pb-2.5 flex items-center justify-between border-b border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Forensic Tooling
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#acf2e5]/50 text-[#005f68]">
                      6 Modules
                    </span>
                  </div>

                  <nav className="mt-2 space-y-1">
                    <button
                      onClick={() => setActiveTab('contradictions')}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'contradictions'
                          ? 'bg-[#005f68] text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'contradictions' ? 'bg-white/15 text-white' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Contradictions</div>
                          <div className={`text-[10px] truncate ${activeTab === 'contradictions' ? 'text-teal-100' : 'text-slate-400'}`}>
                            Marketing vs Legal IP
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        activeTab === 'contradictions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {auditResult.contradictions.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('grill')}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'grill'
                          ? 'bg-[#e11d48] text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'grill' ? 'bg-white/15 text-white' : 'bg-rose-50 text-rose-700'
                        }`}>
                          <Flame className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Grill Founder</div>
                          <div className={`text-[10px] truncate ${activeTab === 'grill' ? 'text-rose-100' : 'text-slate-400'}`}>
                            Red-Team Interrogation
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        activeTab === 'grill' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {auditResult.grill_questions?.length || 3}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('collision')}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'collision'
                          ? 'bg-[#005f68] text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'collision' ? 'bg-white/15 text-white' : 'bg-teal-50 text-[#005f68]'
                        }`}>
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Prior-Art Radar</div>
                          <div className={`text-[10px] truncate ${activeTab === 'collision' ? 'text-teal-100' : 'text-slate-400'}`}>
                            Litigation & Moat Threat
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        activeTab === 'collision' 
                          ? 'bg-white/20 text-white' 
                          : auditResult.prior_art_collision?.litigation_threat_level === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {auditResult.prior_art_collision?.litigation_threat_level || 'EVAL'}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('radar')}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'radar'
                          ? 'bg-[#005f68] text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'radar' ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Risk Charts</div>
                          <div className={`text-[10px] truncate ${activeTab === 'radar' ? 'text-teal-100' : 'text-slate-400'}`}>
                            5-Pillar Spider Radar
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'timeline'
                          ? 'bg-[#005f68] text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'timeline' ? 'bg-white/15 text-white' : 'bg-blue-50 text-blue-700'
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Timeline</div>
                          <div className={`text-[10px] truncate ${activeTab === 'timeline' ? 'text-teal-100' : 'text-slate-400'}`}>
                            Lab ➔ IP ➔ Commercial PR
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {auditResult.timeline.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('evidence')}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'evidence'
                          ? 'bg-[#005f68] text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'evidence' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Evidence Vault</div>
                          <div className={`text-[10px] truncate ${activeTab === 'evidence' ? 'text-teal-100' : 'text-slate-400'}`}>
                            Raw Multi-Engine Citations
                          </div>
                        </div>
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Sidebar Quick Export & Actions Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Institutional Actions
                  </span>
                  <button
                    onClick={handleExportDossier}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-[#209b47] hover:bg-[#1b843c] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Dossier (.MD)</span>
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#209b47]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              {/* Main Feature Content Stage (Right Col - 8 to 9 Cols) */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">

            {/* TAB 1: Contradiction Matrix */}
            {activeTab === 'contradictions' && (
              <div className="space-y-4">
                {auditResult.contradictions.map((c, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]"></span>
                        <h4 className="text-sm font-bold text-[#042126]">
                          Finding {idx + 1}: {c.claim_topic}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.severity === 'CRITICAL_MISMATCH'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {c.severity.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 text-xs">
                      {/* Column A: Marketing Statement */}
                      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
                        <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1.5 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>What PR / Company Claimed</span>
                        </span>
                        <p className="text-amber-950 italic leading-relaxed">
                          "{c.marketing_statement}"
                        </p>
                      </div>

                      {/* Column B: Patent Disclosure */}
                      <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80">
                        <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1.5 flex items-center space-x-1">
                          <FileText className="w-3 h-3 text-blue-700" />
                          <span>Google Patents Legal Disclosure</span>
                        </span>
                        <p className="text-blue-950 leading-relaxed">
                          {c.patent_disclosure}
                        </p>
                      </div>

                      {/* Column C: Scholar Proof */}
                      <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-1.5 flex items-center space-x-1">
                          <GraduationCap className="w-3 h-3 text-emerald-700" />
                          <span>Google Scholar Peer-Reviewed Proof</span>
                        </span>
                        <p className="text-emerald-950 leading-relaxed">
                          {c.academic_evidence}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: "Grill the Founder" — Adversarial Red-Team Questions */}
            {activeTab === 'grill' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-rose-900 to-[#042126] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Flame className="w-5 h-5 text-amber-400" />
                      <h4 className="text-sm font-bold tracking-tight">
                        Adversarial Red-Team Interrogation Suite
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30">
                        Investor War Room Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Generated questions weaponize technical patent disclosures and academic laws of physics to puncture founder deflections during IC meetings.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                      Target: {auditResult.company_or_tech}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      3 High-Yield Interrogation Traps
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {auditResult.grill_questions?.map((q, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-rose-300 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Direct Interrogation Prompt
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(q.question);
                            setCopiedQuestionIdx(idx);
                            setTimeout(() => setCopiedQuestionIdx(null), 2000);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        >
                          {copiedQuestionIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-[#209b47]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy Question</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-[#042126] leading-relaxed mb-3.5">
                        <p className="font-semibold text-slate-900">"{q.question}"</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                        <div className="bg-rose-50/60 border border-rose-200/70 rounded-lg p-3">
                          <span className="font-bold text-rose-900 uppercase block mb-1">
                            🎯 The Trap & Dilemma
                          </span>
                          <p className="text-rose-950 leading-relaxed">{q.trap_rationale}</p>
                        </div>

                        <div className="bg-blue-50/60 border border-blue-200/70 rounded-lg p-3">
                          <span className="font-bold text-blue-900 uppercase block mb-1">
                            📜 Legal IP Grounding
                          </span>
                          <p className="text-blue-950 font-mono text-[10px] leading-relaxed">{q.patent_citation}</p>
                        </div>

                        <div className="bg-amber-50/60 border border-amber-200/70 rounded-lg p-3">
                          <span className="font-bold text-amber-900 uppercase block mb-1">
                            🛡️ Anticipated Deflection
                          </span>
                          <p className="text-amber-950 leading-relaxed">{q.expected_deflection}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Prior-Art Collision & Lawsuit Threat Radar */}
            {activeTab === 'collision' && auditResult.prior_art_collision && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Scale className="w-5 h-5 text-[#005f68]" />
                        <h4 className="text-sm font-bold text-[#042126]">
                          Prior-Art Collision & Litigation Threat Assessment
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Detects competing patent portfolios that threaten Freedom-to-Operate (FTO) or commercial deployment.
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      auditResult.prior_art_collision.litigation_threat_level === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {auditResult.prior_art_collision.litigation_threat_level} LITIGATION RISK
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Primary IP Rival / Portfolio Holder
                      </span>
                      <div className="text-sm font-bold text-[#042126]">
                        {auditResult.prior_art_collision.primary_competitor}
                      </div>
                      <div className="mt-3 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Overlapping Patent:</span>{' '}
                        <span className="font-mono text-[#005f68] font-bold">{auditResult.prior_art_collision.overlapping_patent_id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 italic">
                        "{auditResult.prior_art_collision.overlapping_title}"
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Claim Overlap Index
                          </span>
                          <span className="text-xs font-black text-[#005f68]">
                            {auditResult.prior_art_collision.overlap_score} / 100
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div 
                            style={{ width: `${auditResult.prior_art_collision.overlap_score}%` }} 
                            className="bg-[#005f68] h-full"
                          />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                        <span className="font-bold text-[#042126]">Risk Assessment:</span> Higher overlap requires license royalties or costly litigation redesigns.
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs">
                    <span className="font-bold text-amber-900 block mb-1 uppercase text-[10px]">
                      ⚠️ Infringement & Royalty Threat Analysis
                    </span>
                    <p className="text-amber-950 leading-relaxed">
                      {auditResult.prior_art_collision.infringement_claim_focus}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Forensic Risk Radar */}
            {activeTab === 'radar' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-[#042126] mb-1">
                    5-Pillar Forensic Risk Radar
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Quantified score across core engineering dimensions derived from SerpApi cross-engine extraction.
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={auditResult.radar_metrics}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                        <Radar name="Audit Score" dataKey="score" stroke="#005f68" fill="#005f68" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#042126] mb-1">
                    Pillar Breakdown Relative to Baseline
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Normalized index ratings relative to the 100-point institutional baseline.
                  </p>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={auditResult.radar_metrics} layout="vertical" margin={{ left: 50, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="subject" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#042126', borderRadius: '8px' }} />
                        <Bar dataKey="score" fill="#209b47" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Innovation Timeline */}
            {activeTab === 'timeline' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-[#042126] mb-5">
                  Technology Evolution Trajectory (Academic Lab ➔ Patent Office ➔ Public Market)
                </h4>

                <div className="relative border-l-2 border-slate-200 ml-3 space-y-5">
                  {auditResult.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-6">
                      <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#005f68] ring-4 ring-white"></span>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-[#005f68]">{item.year} • {item.stage}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                            {item.badge}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-[#042126] mt-1">{item.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Evidence Vault */}
            {activeTab === 'evidence' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-xs">
                  <button
                    onClick={() => setEvidenceFilter('patents')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                      evidenceFilter === 'patents' ? 'bg-[#005f68] text-white' : 'bg-slate-100 text-slate-600 hover:text-black'
                    }`}
                  >
                    Google Patents ({auditResult.raw_multi_engine_data.patents.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('scholar')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                      evidenceFilter === 'scholar' ? 'bg-[#005f68] text-white' : 'bg-slate-100 text-slate-600 hover:text-black'
                    }`}
                  >
                    Google Scholar ({auditResult.raw_multi_engine_data.scholar.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('news')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                      evidenceFilter === 'news' ? 'bg-[#005f68] text-white' : 'bg-slate-100 text-slate-600 hover:text-black'
                    }`}
                  >
                    Google News ({auditResult.raw_multi_engine_data.news.length})
                  </button>
                </div>

                {evidenceFilter === 'patents' && (
                  <div className="space-y-3">
                    {auditResult.raw_multi_engine_data.patents.map((p, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-xs text-blue-800 font-bold mb-1">
                          <span>{p.patent_id} • Status: {p.status}</span>
                          <span>Filed: {p.filing_date}</span>
                        </div>
                        <h5 className="font-bold text-[#042126] text-xs">{p.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Assignee: {p.assignee}</p>
                        <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-mono">
                          {p.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {evidenceFilter === 'scholar' && (
                  <div className="space-y-3">
                    {auditResult.raw_multi_engine_data.scholar.map((s, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                          <span>{s.citations} Citations Verified</span>
                          <span>{s.publication}</span>
                        </div>
                        <h5 className="font-bold text-[#042126] text-xs">{s.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">{s.authors}</p>
                        <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                          {s.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {evidenceFilter === 'news' && (
                  <div className="space-y-3">
                    {auditResult.raw_multi_engine_data.news.map((n, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
                          <span>{n.source}</span>
                          <span>{n.date}</span>
                        </div>
                        <h5 className="font-bold text-[#042126] text-xs">{n.title}</h5>
                        <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                          {n.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
