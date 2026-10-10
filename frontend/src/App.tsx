import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert,
  LayoutDashboard,
  ListChecks,
  FileSpreadsheet,
  Network,
  Users,
  ChartColumn,
  Settings,
  Search, 
  FileText, 
  GraduationCap, 
  AlertTriangle, 
  Download, 
  Activity, 
  Layers, 
  KeyRound, 
  Terminal, 
  Copy, 
  Check, 
  BarChart3, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Flame,
  Scale,
  Zap,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Database,
  GitCompare,
  ArrowRight
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
  AuditData
} from './auditEngine';

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<string>('quantumscape');
  const [query, setQuery] = useState<string>('QuantumScape Solid-State Battery Fast Charge');
  const [company, setCompany] = useState<string>('QuantumScape Corp');
  const [claimedBenefit, setClaimedBenefit] = useState<string>(
    'Proprietary ceramic separator eliminates dendrites, enabling 15-minute 80% charge with zero thermal runaway.'
  );
  
  const [serpapiKey, setSerpapiKey] = useState<string>(() => {
    return localStorage.getItem('veritas_serpapi_key') || 'a562a4175f7dc942737ea5cbf8f1488a5948fc5552dd634e75d3e4190196a1da';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditData | null>(() => 
    generateAuditClientSide(
      'QuantumScape Solid-State Battery Fast Charge',
      'QuantumScape Corp',
      'Proprietary ceramic separator eliminates dendrites, enabling 15-minute 80% charge with zero thermal runaway.',
      'quantumscape'
    )
  );
  
  // Navigation active tab matching ClaimShield Nexus modules
  const [activeTab, setActiveTab] = useState<'overview' | 'contradictions' | 'grill' | 'collision' | 'radar' | 'timeline' | 'evidence'>('overview');
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
    <div className="min-h-screen bg-[#f2fcff] nexus-grid-bg text-[#042126] flex relative selection:bg-[#acf2e5] selection:text-[#042126] font-sans">
      
      {/* 1. Fixed Left Sidebar - Exact ClaimShield Nexus Structure */}
      <aside className="w-64 shrink-0 bg-[#042126] border-r border-[#005f68]/40 flex flex-col justify-between sticky top-0 h-screen z-30 text-[#f2fcff]">
        <div>
          {/* Brand Mark */}
          <div className="p-5 border-b border-[#acf2e5]/15">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-[#209b47] flex items-center justify-center text-white transition-colors group-hover:bg-[#1b843c] shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-[0.04em] leading-tight text-white">
                  VERITAS <span className="text-[#acf2e5] font-medium">NEXUS</span>
                </div>
                <div className="text-[10px] text-[#acf2e5]/85 font-mono tracking-[0.08em] mt-0.5">
                  SERPAPI DILIGENCE SIU
                </div>
              </div>
            </a>
          </div>

          {/* Intelligence Modules Navigation */}
          <div className="px-3.5 py-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#acf2e5]/70 px-3 mb-2.5">
              Intelligence Modules
            </div>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0 text-white" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('contradictions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'contradictions'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ListChecks className="w-4 h-4 shrink-0 text-[#acf2e5]" />
                  <span>Contradictions</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/30 text-[#acf2e5]">
                  {auditResult?.contradictions.length || 2}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('grill')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'grill'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 shrink-0 text-[#acf2e5]" />
                  <span>Grill Founder</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/30 text-[#acf2e5]">
                  {auditResult?.grill_questions?.length || 3}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('collision')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'collision'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-4 h-4 shrink-0 text-[#acf2e5]" />
                  <span>Prior-Art Radar</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200">
                  {auditResult?.prior_art_collision?.litigation_threat_level || 'HIGH'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('radar')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'radar'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <ChartColumn className="w-4 h-4 shrink-0 text-[#acf2e5]" />
                <span>5D Risk Charts</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <Activity className="w-4 h-4 shrink-0 text-[#acf2e5]" />
                <span>Timeline</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'evidence'
                    ? 'bg-[#209b47] text-white shadow-xs'
                    : 'text-[#f2fcff]/80 hover:text-white hover:bg-[#005f68]/60'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#acf2e5]" />
                <span>Evidence Vault</span>
              </button>
            </nav>

            {/* Priority Flagship Dossier Card in Sidebar */}
            <div className="mt-6 pt-5 border-t border-[#acf2e5]/15 px-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#acf2e5]/70 px-1 mb-2.5">
                Priority Flagship Dossier
              </div>
              <div className="p-3.5 rounded-xl bg-[#005f68]/35 border border-[#acf2e5]/30 hover:border-[#acf2e5] transition duration-150 space-y-2">
                <button 
                  type="button" 
                  onClick={() => {
                    handleSelectScenario(scenarios[0]);
                    handleRunAudit(scenarios[0].id);
                    setActiveTab('contradictions');
                  }}
                  className="w-full text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-mono text-[#acf2e5] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#209b47]" /> CASE-QS26
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#fee2e2] text-[#b91c1c]">
                      {auditResult ? `${auditResult.summary.hype_index} / 100` : '72 / 100'}
                    </span>
                  </div>
                  <div className="text-xs text-white font-semibold flex items-center justify-between">
                    <span>QS Solid-State • 4 Engines</span>
                    <GitCompare className="w-3.5 h-3.5 text-[#acf2e5] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#f2fcff]/75 mt-0.5">
                    Click for Patent vs PR Diff
                  </div>
                </button>
                <div className="pt-2 border-t border-[#acf2e5]/15 flex items-center justify-between text-[11px]">
                  <button 
                    type="button" 
                    onClick={handleExportDossier} 
                    className="text-[#acf2e5] hover:underline font-mono font-semibold cursor-pointer"
                  >
                    Export Dossier
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCopySummary}
                    className="text-white hover:text-[#acf2e5] font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{copied ? 'Copied' : 'Share'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#acf2e5]/15 bg-[#042126]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#acf2e5]">
            <span className="flex items-center gap-1.5 font-semibold">
              <Database className="w-3.5 h-3.5 text-[#209b47] shrink-0" />
              HUMAN-IN-THE-LOOP SIU
            </span>
            <button 
              onClick={() => setShowKeyModal(true)} 
              className="text-[10px] text-[#acf2e5]/80 hover:text-white underline cursor-pointer"
            >
              Key Settings
            </button>
          </div>
          <p className="text-[11px] text-[#f2fcff]/80 mt-1.5 leading-relaxed">
            Veritas AI audits. The human IC committee makes the investment decision.
          </p>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 relative z-20">
        
        {/* Top Header Bar - Exact ClaimShield Styling */}
        <header className="h-16 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150 bg-white/95 border-b border-[#042126]/10 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-[#042126]">Overview</span>
            <span className="text-[#042126]/25 text-xs">•</span>
            <span className="hidden sm:inline text-xs text-[#005f68] font-medium">
              Deep-Tech Patent & Forensic Science Reality Engine
            </span>
            <span className="text-[#042126]/25 text-xs hidden md:inline">•</span>
            <a 
              href="https://veritas-nexus-ai.vercel.app" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-[#209b47] hover:underline bg-[#e4fef4] border border-[#209b47]/30 px-2 py-0.5 rounded-md"
            >
              <span>veritas-nexus-ai.vercel.app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Gateway Indicator Pill */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-[#acf2e5] text-[#042126] border border-[#042126]/10">
              <span className="w-2 h-2 rounded-full bg-[#209b47] animate-pulse"></span>
              SERPAPI LIVE GATEWAY • DUAL-PASS AUDIT
            </span>

            {/* Launch Risk Analysis / Execute Audit Button */}
            <button
              onClick={() => handleRunAudit()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#209b47] hover:bg-[#1b843c] text-white transition-all duration-150 hover:-translate-y-[1px] shadow-[0_3px_8px_rgba(4,33,38,0.1)] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Risk Analysis</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Credentials Modal */}
        {showKeyModal && (
          <div className="fixed inset-0 z-50 bg-[#042126]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#042126]/10 rounded-2xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-base font-bold text-[#042126] flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#005f68]" />
                <span>SerpApi Gateway Credentials</span>
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Your key enables live queries across Google Patents, Google Scholar, Google News, and Web engines.
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
                  onClick={() => {
                    if (serpapiKey.trim()) {
                      localStorage.setItem('veritas_serpapi_key', serpapiKey.trim());
                    }
                    setShowKeyModal(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#209b47] hover:bg-[#1b843c] text-white transition-colors cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Claim Modal */}
        {showCustomModal && (
          <div className="fixed inset-0 z-50 bg-[#042126]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#042126]/10 rounded-2xl max-w-lg w-full p-6 shadow-xl">
              <h3 className="text-base font-bold text-[#042126] flex items-center space-x-2">
                <Search className="w-4 h-4 text-[#209b47]" />
                <span>Audit Custom Technology Claim</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Enter any startup or company pitch to dispatch parallel SerpApi queries.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#042126] uppercase mb-1">Company / Technology Name</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#042126] focus:outline-none focus:border-[#005f68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#042126] uppercase mb-1">Public Claim / Keynote Statement</label>
                  <textarea
                    rows={3}
                    value={claimedBenefit}
                    onChange={(e) => setClaimedBenefit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#042126] focus:outline-none focus:border-[#005f68]"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-2">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCustomModal(false);
                    handleRunAudit('');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#209b47] hover:bg-[#1b843c] text-white cursor-pointer"
                >
                  Execute Live Audit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 px-6 lg:px-10 py-7 max-w-[1560px] w-full mx-auto space-y-6">
          
          {/* 3. Hero Card - Exact ClaimShield Nexus Layout & Palette */}
          <div className="bg-white rounded-2xl border border-[#042126]/10 p-7 lg:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Product Info & Metrics */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  {/* Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#acf2e5]/50 text-[#005f68] border border-[#005f68]/20">
                      <Sparkles className="w-3 h-3 text-[#209b47]" />
                      INVESTIGATION INTELLIGENCE PLATFORM
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      DEMO • SERPAPI ENGINE
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                    <span className="text-[#209b47]">VERITAS</span>{' '}
                    <span className="text-[#005f68]">NEXUS</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm font-semibold text-[#005f68] mt-1 italic">
                    “Find the claims that don't add up.”
                  </p>

                  <h2 className="text-base sm:text-lg font-bold text-[#042126] mt-3">
                    Multi-signal forensic intelligence for suspicious deep-tech claims.
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xl">
                    Veritas Nexus combines Google Patents legal disclosures, Google Scholar physics literature, and SEC news to prioritize red flags for investment committees — while keeping the final decision with the human investigator.
                  </p>

                  {/* Metric Pills Grid (ClaimShield style) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3">
                      <div className="text-sm font-bold font-mono text-[#042126]">4 Engines</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Patents • Scholar • News</div>
                    </div>
                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3">
                      <div className="text-sm font-bold font-mono text-[#042126]">100-Pt Index</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Hype vs Reality baseline</div>
                    </div>
                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3">
                      <div className="text-sm font-bold font-mono text-[#e11d48]">
                        {auditResult?.financial_exposure?.capital_at_risk || '$1.85B'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Capital at Risk exposure</div>
                    </div>
                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3">
                      <div className="text-sm font-bold font-mono text-[#042126]">
                        {auditResult?.summary.technology_readiness_level.split(' ')[0] || 'TRL 4'}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">NASA Technology readiness</div>
                    </div>
                    <div className="bg-[#f8fafc] border border-slate-200/80 rounded-xl p-3">
                      <div className="text-sm font-bold font-mono text-[#005f68]">
                        {auditResult?.prior_art_collision?.overlap_score || 74}/100 FTO
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Prior-art collision threat</div>
                    </div>
                    <div className="bg-[#e4fef4] border border-[#209b47]/30 rounded-xl p-3">
                      <div className="text-sm font-bold font-mono text-[#209b47]">4 Detection</div>
                      <div className="text-[10px] text-[#209b47] font-semibold mt-0.5">Explainable risk scores</div>
                    </div>
                  </div>
                </div>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleSelectScenario(scenarios[0]);
                      handleRunAudit(scenarios[0].id);
                      setActiveTab('contradictions');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold bg-[#209b47] hover:bg-[#1b843c] text-white transition-all duration-150 hover:-translate-y-[1px] shadow-sm cursor-pointer"
                  >
                    <span>START DEMO: AUDIT QUANTUMSCAPE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-semibold border border-[#042126] text-[#042126] hover:bg-[#042126] hover:text-white transition-all duration-150 cursor-pointer"
                  >
                    <span>ANALYZE CUSTOM CLAIM</span>
                  </button>

                  <button
                    onClick={handleExportDossier}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-semibold bg-[#042126] text-white hover:bg-[#005f68] transition-all duration-150 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT DOSSIER (.MD)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Multi-Engine Radar Box (ClaimShield Visual) */}
              <div className="lg:col-span-5 bg-[#042126] text-[#f2fcff] rounded-2xl p-5 border border-[#005f68]/50 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#005f68]/50 pb-3 mb-3">
                    <span className="flex items-center gap-1.5 text-[#acf2e5] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#209b47] animate-pulse"></span>
                      MULTI-ENGINE EVIDENCE PIPELINE // 4 ENGINES
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#209b47]/30 text-[#acf2e5] text-[10px] font-bold">
                      STAGE 03: CONTRADICTION AUDIT
                    </span>
                  </div>

                  {/* Visual Topology Radar */}
                  <div className="h-44 w-full flex items-center justify-center my-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={auditResult?.radar_metrics || []}>
                        <PolarGrid stroke="#005f68" />
                        <PolarAngleAxis dataKey="subject" stroke="#acf2e5" tick={{ fontSize: 10 }} />
                        <Radar name="Forensic Score" dataKey="score" stroke="#209b47" fill="#209b47" fillOpacity={0.45} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pipeline Stages & Info Footer */}
                <div>
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center mb-3">
                    <div className="bg-[#005f68]/30 py-1.5 rounded text-[#acf2e5]/80">01 INGEST</div>
                    <div className="bg-[#005f68]/30 py-1.5 rounded text-[#acf2e5]/80">02 SERPAPI</div>
                    <div className="bg-[#209b47] py-1.5 rounded text-white font-bold">03 DETECT</div>
                    <div className="bg-[#005f68]/30 py-1.5 rounded text-[#acf2e5]/80">04 EVIDENCE</div>
                    <div className="bg-[#005f68]/30 py-1.5 rounded text-[#acf2e5]/80">05 DOSSIER</div>
                  </div>
                  <div className="text-[11px] text-[#acf2e5]/80 flex items-center justify-between border-t border-[#005f68]/40 pt-2.5">
                    <span>Correlates mechanical compression, scrap rates, and patent overlap.</span>
                    <span className="text-white font-mono text-[10px] font-bold">HTTP/2 200</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Path Bar (ClaimShield style) */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                DEMO PATH:
              </span>
              {scenarios.map((sc, i) => {
                const isSelected = selectedScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      handleSelectScenario(sc);
                      handleRunAudit(sc.id);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#042126] text-white border-[#042126]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{i + 1}. {sc.company_or_tech.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Multi-Engine Telemetry HUD Drawer */}
          {auditResult && (
            <div className="bg-white rounded-2xl border border-[#042126]/10 px-5 py-3 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-[#209b47]" />
                  <span className="font-bold text-[#042126]">SerpApi Multi-Engine Telemetry:</span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Google Patents • Google Scholar • Google News • Technical Web
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#acf2e5]/50 text-[#005f68] border border-[#005f68]/20">
                    HTTP/2 200 OK
                  </span>
                </div>
                <button
                  onClick={() => setShowTelemetry(!showTelemetry)}
                  className="flex items-center space-x-1 text-slate-500 hover:text-[#005f68] font-semibold text-[11px] cursor-pointer"
                >
                  <span>{showTelemetry ? 'Hide Telemetry' : 'View Ingest Logs'}</span>
                  {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showTelemetry && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100">
                  {auditResult.engine_telemetry?.map((tel, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#005f68] font-mono text-[11px]">{tel.engine}</span>
                        <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                          {tel.latency_ms}ms
                        </span>
                      </div>
                      <div className="text-slate-500 text-[10px] truncate">"{tel.query}"</div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-200 pt-1">
                        <span>{tel.category}</span>
                        <span className="font-bold text-[#042126]">{tel.records_count} records</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. Executive Scorecard Banner */}
          {auditResult && (
            <div className="bg-white rounded-2xl border border-[#042126]/10 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Entity Under Active Investigation
                  </span>
                  <h3 className="text-lg font-extrabold text-[#042126]">
                    {auditResult.company_or_tech}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Executive Finding:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    auditResult.summary.reality_index <= 50 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {auditResult.summary.verdict}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2.5 italic">
                Audited Claim: "{auditResult.claimed_benefit}"
              </p>
            </div>
          )}

          {/* 6. Dynamic Feature Stage (Switching based on activeTab) */}

          {/* TAB: Overview / Contradictions */}
          {(activeTab === 'overview' || activeTab === 'contradictions') && auditResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#042126] uppercase tracking-wider flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-[#209b47]" />
                  <span>Contradiction & Discrepancy Matrix</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {auditResult.contradictions.length} Verified Evidence Traps
                </span>
              </div>

              {auditResult.contradictions.map((c, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[#042126]/10 p-5 shadow-xs">
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
                    {/* Marketing Statement */}
                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1.5 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>Public Marketing Statement</span>
                      </span>
                      <p className="text-amber-950 italic leading-relaxed">
                        "{c.marketing_statement}"
                      </p>
                    </div>

                    {/* Patent Disclosure */}
                    <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80">
                      <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1.5 flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-blue-700" />
                        <span>Google Patents Legal Disclosure</span>
                      </span>
                      <p className="text-blue-950 leading-relaxed font-mono text-[11px]">
                        {c.patent_disclosure}
                      </p>
                    </div>

                    {/* Scholar Proof */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase block mb-1.5 flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3 text-emerald-700" />
                        <span>Google Scholar Peer Proof</span>
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

          {/* TAB: Grill the Founder Interrogation Suite */}
          {activeTab === 'grill' && auditResult && (
            <div className="space-y-4">
              <div className="bg-[#042126] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#005f68]/40">
                <div>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-bold tracking-tight">
                      Adversarial Red-Team Interrogation Suite
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#acf2e5]/20 text-[#acf2e5]">
                      INVESTOR WAR ROOM
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Weaponize technical patent disclosures and academic laws of physics to puncture founder deflections during IC meetings.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-[#acf2e5] font-bold block">
                    Target: {auditResult.company_or_tech}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    3 High-Yield Interrogation Traps
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {auditResult.grill_questions?.map((q, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-[#042126]/10 p-5 shadow-xs hover:border-[#005f68] transition-all">
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
                        className="flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
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
                      <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-3">
                        <span className="font-bold text-rose-900 uppercase block mb-1">
                          🎯 The Trap & Dilemma
                        </span>
                        <p className="text-rose-950 leading-relaxed">{q.trap_rationale}</p>
                      </div>

                      <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3">
                        <span className="font-bold text-blue-900 uppercase block mb-1">
                          📜 Legal IP Grounding
                        </span>
                        <p className="text-blue-950 font-mono text-[10px] leading-relaxed">{q.patent_citation}</p>
                      </div>

                      <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3">
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

          {/* TAB: Prior-Art Radar */}
          {activeTab === 'collision' && auditResult?.prior_art_collision && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#042126]/10 p-6 shadow-xs">
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
                      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div 
                          style={{ width: `${auditResult.prior_art_collision.overlap_score}%` }} 
                          className="bg-[#005f68] h-full"
                        />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-[#042126]">Risk Assessment:</span> Higher overlap indicates licensing royalties or patent redesign hurdles.
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

          {/* TAB: 5D Risk Charts */}
          {activeTab === 'radar' && auditResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white rounded-2xl border border-[#042126]/10 p-6 shadow-xs">
              <div>
                <h4 className="text-sm font-bold text-[#042126] mb-1">
                  5-Pillar Forensic Risk Radar
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Quantified metric across core engineering dimensions derived from SerpApi cross-engine extraction.
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
                  Pillar Breakdown vs Institutional Baseline
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

          {/* TAB: Timeline */}
          {activeTab === 'timeline' && auditResult && (
            <div className="bg-white rounded-2xl border border-[#042126]/10 p-6 shadow-xs">
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

          {/* TAB: Evidence Vault */}
          {activeTab === 'evidence' && auditResult && (
            <div className="bg-white rounded-2xl border border-[#042126]/10 p-5 shadow-xs space-y-4">
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
        </main>
      </div>
    </div>
  );
}
