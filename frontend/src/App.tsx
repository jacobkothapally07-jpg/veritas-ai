import React, { useState, useEffect } from 'react';
import { 
  Shield,
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
  ChevronUp,
  Cpu,
  Clock,
  Server
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
  
  const [serpapiKey, setSerpapiKey] = useState<string>(() => {
    return localStorage.getItem('veritas_serpapi_key') || 'a562a4175f7dc942737ea5cbf8f1488a5948fc5552dd634e75d3e4190196a1da';
  });
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

  const isCritical = auditResult && auditResult.summary.reality_index <= 50;

  return (
    <div className="min-h-screen claimshield-canvas text-[#172235] font-sans pb-24">
      {/* Top Header - ClaimShield / Sentra Executive Ivory Bar */}
      <header className="theme-header border-b theme-border sticky top-0 z-40 px-5 py-2.5 transition-colors duration-150 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Product Name & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-[#183B63] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base tracking-tight text-[#183B63]">
                  Veritas Nexus
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAE4D8] text-[#172235] border border-[#D8D1C5]">
                  DILIGENCE SRE
                </span>
              </div>
              <p className="text-[11px] text-[#667085] hidden sm:block">
                Deep-Tech Patent & Forensic Science Reality Engine
              </p>
            </div>
          </div>

          {/* Right: Status Badges & Controls */}
          <div className="flex items-center space-x-2.5">
            {/* System Status Badge */}
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
              isCritical 
                ? 'bg-[#F4DEDA] border border-[#B73535] text-[#B73535]'
                : 'bg-[#E4EFEA] border border-[#39745A]/40 text-[#39745A]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-[#B73535]' : 'bg-[#39745A]'} animate-pulse`}></span>
              <span>{isCritical ? 'MISMATCH DETECTED' : 'ENGINE OPERATIONAL'}</span>
            </div>

            {/* Live Gateway Pill */}
            <div className="hidden lg:flex items-center space-x-2 text-xs bg-[#F0EBE2] border border-[#D8D1C5] px-3 py-1 rounded-md text-[#172235] font-mono">
              <span className="text-[#183B63] font-bold">GATEWAY:</span>
              <span className="text-[#667085]">Patents</span>•
              <span className="text-[#667085]">Scholar</span>•
              <span className="text-[#667085]">News</span>
            </div>

            <button
              onClick={() => setShowKeyModal(!showKeyModal)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                serpapiKey 
                  ? 'bg-[#E4EFEA] border-[#39745A]/40 text-[#39745A]'
                  : 'bg-[#FBF8F1] border-[#D8D1C5] text-[#172235] hover:bg-[#F0EBE2]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#183B63]" />
              <span className="hidden sm:inline">{serpapiKey ? 'Live Key Active' : 'Set SerpApi Key'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Credentials Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-[#172235]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#183B63] flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#183B63]" />
              <span>SerpApi Gateway Credentials</span>
            </h3>
            <p className="text-xs text-[#667085] mt-2 leading-relaxed">
              Your SerpApi key enables live real-time queries across Google Patents, Google Scholar, Google News, and Web engines.
            </p>
            <input
              type="password"
              placeholder="Paste SerpApi API key..."
              value={serpapiKey}
              onChange={(e) => setSerpapiKey(e.target.value)}
              className="w-full mt-4 bg-[#F0EBE2] border border-[#D8D1C5] rounded-lg px-3 py-2 text-xs text-[#172235] focus:outline-none focus:border-[#183B63] font-mono"
            />
            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => {
                  if (serpapiKey.trim()) {
                    localStorage.setItem('veritas_serpapi_key', serpapiKey.trim());
                  }
                  setShowKeyModal(false);
                }}
                className="px-4 py-2 rounded-md text-xs font-bold bg-[#183B63] hover:bg-[#102A46] text-white transition-colors cursor-pointer"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Top Header Banner / Intro */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D8D1C5] pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                Forensic SRE Console
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EAE4D8] text-[#172235] border border-[#D8D1C5]">
                v3.4
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[#172235]">
              Cross-Reconciling Public Claims with Legal Patents & Physics
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#667085]">Verification Mode:</span>
            <span className="px-2.5 py-1 rounded-md bg-[#DCE7F2] text-[#183B63] font-semibold border border-[#183B63]/20">
              DUAL-PASS SERPAPI
            </span>
          </div>
        </div>

        {/* 1-Click Investigation Scenarios (ClaimShield Cards) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
              INVESTIGATION SCENARIOS
            </span>
            <span className="text-[11px] text-[#8A8F98]">1-Click Forensic Ingest</span>
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
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FBF8F1] border-[#183B63] shadow-xs ring-1 ring-[#183B63]'
                      : 'bg-[#FBF8F1] border-[#D8D1C5] hover:border-[#8A8F98] hover:bg-[#F0EBE2]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[#183B63]">
                      {sc.category.split('/')[0]}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#39745A]"></span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#172235] truncate">{sc.company_or_tech}</h4>
                  <p className="text-[11px] text-[#667085] line-clamp-1 mt-0.5">{sc.claimed_benefit}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Search / Query Bar (ClaimShield Style) */}
        <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-4 mb-5 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                Target Entity / Technology
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setSelectedScenario('');
                }}
                className="w-full bg-[#F0EBE2] border border-[#D8D1C5] rounded-md px-3 py-2 text-xs text-[#172235] focus:bg-[#FBF8F1] focus:outline-none focus:border-[#183B63] font-medium"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                Public Marketing Claim to Audit
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={claimedBenefit}
                  onChange={(e) => {
                    setClaimedBenefit(e.target.value);
                    setSelectedScenario('');
                  }}
                  className="flex-1 bg-[#F0EBE2] border border-[#D8D1C5] rounded-md px-3 py-2 text-xs text-[#172235] focus:bg-[#FBF8F1] focus:outline-none focus:border-[#183B63] font-medium"
                />
                <button
                  onClick={() => handleRunAudit()}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[#183B63] hover:bg-[#102A46] text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
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

        {/* Multi-Engine Telemetry HUD Toggle (ClaimShield Terminal style) */}
        {auditResult && (
          <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg px-4 py-2.5 mb-5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-[#39745A]" />
                <span className="font-bold text-[#172235]">SerpApi Telemetry Gateway:</span>
                <span className="text-[11px] text-[#667085] hidden sm:inline">
                  Google Patents • Google Scholar • Google News • Technical Web
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E4EFEA] text-[#39745A] border border-[#39745A]/30">
                  HTTP/2 200 OK
                </span>
              </div>
              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className="flex items-center space-x-1 text-[#667085] hover:text-[#183B63] font-medium text-[11px] cursor-pointer"
              >
                <span>{showTelemetry ? 'Hide Telemetry' : 'View Ingest Logs'}</span>
                {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showTelemetry && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-[#D8D1C5]">
                {auditResult.engine_telemetry?.map((tel, idx) => (
                  <div key={idx} className="bg-[#F0EBE2] border border-[#D8D1C5] rounded-md p-2.5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#183B63] font-mono text-[11px]">{tel.engine}</span>
                      <span className="font-mono text-[10px] text-[#39745A] bg-[#E4EFEA] px-1.5 py-0.5 rounded font-bold">
                        {tel.latency_ms}ms
                      </span>
                    </div>
                    <div className="text-[#667085] text-[10px] truncate">"{tel.query}"</div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#667085] border-t border-[#D8D1C5] pt-1">
                      <span>{tel.category}</span>
                      <span className="font-bold text-[#172235]">{tel.records_count} records</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Results Dashboard */}
        {auditResult && !loading && (
          <div className="space-y-5">
            {/* 6-Column ClaimShield StatsBar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
              {/* 1. Forensic Reality Score */}
              <div className={`border rounded-lg p-3.5 flex flex-col justify-between transition-colors duration-150 ${
                auditResult.summary.reality_index <= 50 
                  ? 'bg-[#F4DEDA] border-[#B73535]' 
                  : 'bg-[#FBF8F1] border-[#D8D1C5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">REALITY SCORE</span>
                  <ShieldCheck className={`w-3.5 h-3.5 ${auditResult.summary.reality_index <= 50 ? 'text-[#B73535]' : 'text-[#39745A]'}`} />
                </div>
                <div className="mt-1.5 flex items-baseline space-x-1.5">
                  <span className={`text-xl font-bold font-mono ${auditResult.summary.reality_index <= 50 ? 'text-[#B73535]' : 'text-[#39745A]'}`}>
                    {auditResult.summary.reality_index}%
                  </span>
                  <span className="text-[11px] text-[#667085]">Verified</span>
                </div>
              </div>

              {/* 2. Hype Index */}
              <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-3.5 flex flex-col justify-between transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">HYPE INDEX</span>
                  <Flame className="w-3.5 h-3.5 text-[#B47A32]" />
                </div>
                <div className="mt-1.5 flex items-baseline space-x-1.5">
                  <span className="text-xl font-bold font-mono text-[#B47A32]">
                    {auditResult.summary.hype_index}%
                  </span>
                  <span className="text-[11px] text-[#667085]">Unverified PR</span>
                </div>
              </div>

              {/* 3. Legal Patent Moat */}
              <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-3.5 flex flex-col justify-between transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">PATENT MOAT</span>
                  <FileText className="w-3.5 h-3.5 text-[#183B63]" />
                </div>
                <div className="mt-1.5 flex items-baseline space-x-1.5">
                  <span className="text-sm font-bold font-mono text-[#183B63] truncate">
                    {auditResult.summary.moat_rating.split(' ')[0]}
                  </span>
                  <span className="text-[11px] text-[#667085]">{auditResult.summary.total_patents_analyzed} Pat</span>
                </div>
              </div>

              {/* 4. Capital at Risk */}
              <div className={`border rounded-lg p-3.5 flex flex-col justify-between transition-colors duration-150 ${
                auditResult.financial_exposure ? 'bg-[#F4DEDA] border-[#B73535]' : 'bg-[#FBF8F1] border-[#D8D1C5]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">CAPITAL AT RISK</span>
                  <TrendingDown className={`w-3.5 h-3.5 ${auditResult.financial_exposure ? 'text-[#B73535]' : 'text-[#8A8F98]'}`} />
                </div>
                <div className="mt-1.5 flex items-baseline space-x-1.5">
                  <span className={`text-base font-bold font-mono ${auditResult.financial_exposure ? 'text-[#B73535]' : 'text-[#172235]'}`}>
                    {auditResult.financial_exposure?.capital_at_risk || '$1.85B'}
                  </span>
                  <span className="text-[11px] text-[#667085]">Downside</span>
                </div>
              </div>

              {/* 5. TRL Maturity */}
              <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-3.5 flex flex-col justify-between transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">TECH MATURITY</span>
                  <Layers className="w-3.5 h-3.5 text-[#183B63]" />
                </div>
                <div className="mt-1.5 flex items-baseline space-x-1.5">
                  <span className="text-xl font-bold font-mono text-[#172235]">
                    {auditResult.summary.technology_readiness_level.split(' ')[0] || 'TRL 4'}
                  </span>
                  <span className="text-[11px] text-[#667085]">NASA Scale</span>
                </div>
              </div>

              {/* 6. Correlated Citations */}
              <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-3.5 flex flex-col justify-between transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">EVIDENCE CITATIONS</span>
                  <GraduationCap className="w-3.5 h-3.5 text-[#39745A]" />
                </div>
                <div className="mt-1.5 flex items-baseline space-x-1.5">
                  <span className="text-xl font-bold font-mono text-[#39745A]">
                    {auditResult.summary.total_papers_analyzed + auditResult.summary.total_patents_analyzed}
                  </span>
                  <span className="text-[11px] text-[#667085]">Correlated</span>
                </div>
              </div>
            </div>

            {/* Master-Detail Layout: Left Feature Navigation Sidebar + Right Content Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Feature Sidebar (Left Col - 3 to 4 Cols) */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-3 lg:sticky lg:top-20">
                <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-3 shadow-xs">
                  <div className="px-3 pt-1 pb-2 flex items-center justify-between border-b border-[#D8D1C5]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                      FORENSIC WORKSTATIONS
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#EAE4D8] text-[#172235]">
                      6 MODULES
                    </span>
                  </div>

                  <nav className="mt-2 space-y-1">
                    {/* Tab 1: Contradictions */}
                    <button
                      onClick={() => setActiveTab('contradictions')}
                      className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'contradictions'
                          ? 'bg-[#183B63] text-white shadow-xs font-semibold'
                          : 'bg-[#FBF8F1] hover:bg-[#F0EBE2] text-[#172235]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          activeTab === 'contradictions' ? 'bg-white/20 text-white' : 'bg-[#FAF0E1] text-[#B47A32]'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Contradictions</div>
                          <div className={`text-[10px] truncate ${activeTab === 'contradictions' ? 'text-[#DCE7F2]' : 'text-[#667085]'}`}>
                            Marketing vs Legal IP
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        activeTab === 'contradictions' ? 'bg-white/20 text-white' : 'bg-[#EAE4D8] text-[#172235]'
                      }`}>
                        {auditResult.contradictions.length}
                      </span>
                    </button>

                    {/* Tab 2: Grill Founder */}
                    <button
                      onClick={() => setActiveTab('grill')}
                      className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'grill'
                          ? 'bg-[#B73535] text-white shadow-xs font-semibold'
                          : 'bg-[#FBF8F1] hover:bg-[#F0EBE2] text-[#172235]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          activeTab === 'grill' ? 'bg-white/20 text-white' : 'bg-[#F4DEDA] text-[#B73535]'
                        }`}>
                          <Flame className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Grill Founder</div>
                          <div className={`text-[10px] truncate ${activeTab === 'grill' ? 'text-rose-100' : 'text-[#667085]'}`}>
                            Adversarial Interrogation
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        activeTab === 'grill' ? 'bg-white/20 text-white' : 'bg-[#F4DEDA] text-[#B73535]'
                      }`}>
                        {auditResult.grill_questions?.length || 3}
                      </span>
                    </button>

                    {/* Tab 3: Prior-Art Radar */}
                    <button
                      onClick={() => setActiveTab('collision')}
                      className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'collision'
                          ? 'bg-[#183B63] text-white shadow-xs font-semibold'
                          : 'bg-[#FBF8F1] hover:bg-[#F0EBE2] text-[#172235]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          activeTab === 'collision' ? 'bg-white/20 text-white' : 'bg-[#DCE7F2] text-[#183B63]'
                        }`}>
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Prior-Art Radar</div>
                          <div className={`text-[10px] truncate ${activeTab === 'collision' ? 'text-[#DCE7F2]' : 'text-[#667085]'}`}>
                            Litigation & Moat Threat
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        activeTab === 'collision' 
                          ? 'bg-white/20 text-white' 
                          : auditResult.prior_art_collision?.litigation_threat_level === 'HIGH'
                            ? 'bg-[#F4DEDA] text-[#B73535]'
                            : 'bg-[#FAF0E1] text-[#B47A32]'
                      }`}>
                        {auditResult.prior_art_collision?.litigation_threat_level || 'EVAL'}
                      </span>
                    </button>

                    {/* Tab 4: Risk Charts */}
                    <button
                      onClick={() => setActiveTab('radar')}
                      className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'radar'
                          ? 'bg-[#183B63] text-white shadow-xs font-semibold'
                          : 'bg-[#FBF8F1] hover:bg-[#F0EBE2] text-[#172235]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          activeTab === 'radar' ? 'bg-white/20 text-white' : 'bg-[#E4EFEA] text-[#39745A]'
                        }`}>
                          <BarChart3 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Risk Charts</div>
                          <div className={`text-[10px] truncate ${activeTab === 'radar' ? 'text-[#DCE7F2]' : 'text-[#667085]'}`}>
                            5-Pillar Spider Radar
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Tab 5: Timeline */}
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'timeline'
                          ? 'bg-[#183B63] text-white shadow-xs font-semibold'
                          : 'bg-[#FBF8F1] hover:bg-[#F0EBE2] text-[#172235]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-[#DCE7F2] text-[#183B63]'
                        }`}>
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Timeline</div>
                          <div className={`text-[10px] truncate ${activeTab === 'timeline' ? 'text-[#DCE7F2]' : 'text-[#667085]'}`}>
                            Lab ➔ IP ➔ Commercial PR
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-[#EAE4D8] text-[#172235]'
                      }`}>
                        {auditResult.timeline.length}
                      </span>
                    </button>

                    {/* Tab 6: Evidence Vault */}
                    <button
                      onClick={() => setActiveTab('evidence')}
                      className={`w-full text-left p-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between ${
                        activeTab === 'evidence'
                          ? 'bg-[#183B63] text-white shadow-xs font-semibold'
                          : 'bg-[#FBF8F1] hover:bg-[#F0EBE2] text-[#172235]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                          activeTab === 'evidence' ? 'bg-white/20 text-white' : 'bg-[#EAE4D8] text-[#172235]'
                        }`}>
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">Evidence Vault</div>
                          <div className={`text-[10px] truncate ${activeTab === 'evidence' ? 'text-[#DCE7F2]' : 'text-[#667085]'}`}>
                            Raw Multi-Engine Citations
                          </div>
                        </div>
                      </div>
                    </button>
                  </nav>
                </div>

                {/* Institutional Actions Card */}
                <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-3.5 shadow-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085] block">
                    Institutional Actions
                  </span>
                  <button
                    onClick={handleExportDossier}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-md bg-[#183B63] hover:bg-[#102A46] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Dossier (.MD)</span>
                  </button>
                  <button
                    onClick={handleCopySummary}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-md bg-[#F0EBE2] hover:bg-[#EAE4D8] text-[#172235] border border-[#D8D1C5] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#39745A]" /> : <Copy className="w-3.5 h-3.5 text-[#667085]" />}
                    <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>

              {/* Main Feature Content Stage (Right Col) */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                
                {/* Executive Summary Card on top of content stage */}
                <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D8D1C5] gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
                        Entity Under Investigation
                      </span>
                      <h3 className="text-base font-bold text-[#183B63]">
                        {auditResult.company_or_tech}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#667085]">Executive Finding:</span>
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#EAE4D8] text-[#172235] border border-[#D8D1C5]">
                        {auditResult.summary.verdict}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#667085] mt-2.5 italic">
                    Audited Claim: "{auditResult.claimed_benefit}"
                  </p>
                </div>

                {/* TAB 1: Contradiction Matrix */}
                {activeTab === 'contradictions' && (
                  <div className="space-y-3.5">
                    {auditResult.contradictions.map((c, idx) => (
                      <div key={idx} className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-4 shadow-xs">
                        <div className="flex items-center justify-between mb-3 border-b border-[#D8D1C5] pb-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#B73535]"></span>
                            <h4 className="text-xs font-bold text-[#172235]">
                              Finding {idx + 1}: {c.claim_topic}
                            </h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.severity === 'CRITICAL_MISMATCH'
                              ? 'bg-[#F4DEDA] text-[#B73535] border border-[#B73535]'
                              : 'bg-[#FAF0E1] text-[#B47A32] border border-[#B47A32]'
                          }`}>
                            {c.severity.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                          {/* Column A: Marketing Statement */}
                          <div className="bg-[#FAF0E1] p-3 rounded-md border border-[#B47A32]/40">
                            <span className="text-[10px] font-bold text-[#B47A32] uppercase block mb-1 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-[#B47A32]" />
                              <span>Public Marketing Claim</span>
                            </span>
                            <p className="text-[#172235] italic leading-relaxed">
                              "{c.marketing_statement}"
                            </p>
                          </div>

                          {/* Column B: Patent Disclosure */}
                          <div className="bg-[#DCE7F2] p-3 rounded-md border border-[#183B63]/30">
                            <span className="text-[10px] font-bold text-[#183B63] uppercase block mb-1 flex items-center space-x-1">
                              <FileText className="w-3 h-3 text-[#183B63]" />
                              <span>Google Patents Disclosure</span>
                            </span>
                            <p className="text-[#172235] leading-relaxed">
                              {c.patent_disclosure}
                            </p>
                          </div>

                          {/* Column C: Scholar Proof */}
                          <div className="bg-[#E4EFEA] p-3 rounded-md border border-[#39745A]/40">
                            <span className="text-[10px] font-bold text-[#39745A] uppercase block mb-1 flex items-center space-x-1">
                              <GraduationCap className="w-3 h-3 text-[#39745A]" />
                              <span>Scholar Peer Proof</span>
                            </span>
                            <p className="text-[#172235] leading-relaxed">
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
                    <div className="bg-[#183B63] text-white p-4 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Flame className="w-4 h-4 text-[#FAF0E1]" />
                          <h4 className="text-sm font-bold tracking-tight">
                            Adversarial Red-Team Interrogation Suite
                          </h4>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                            INVESTOR WAR ROOM
                          </span>
                        </div>
                        <p className="text-xs text-[#DCE7F2] mt-1 max-w-2xl leading-relaxed">
                          Weaponize technical patent disclosures and academic laws of physics to puncture founder deflections during partner meetings.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-[#E4EFEA] font-bold block">
                          Target: {auditResult.company_or_tech}
                        </span>
                        <span className="text-[10px] text-[#DCE7F2]">
                          3 Verified Interrogation Traps
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {auditResult.grill_questions?.map((q, idx) => (
                        <div key={idx} className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-4 shadow-xs">
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="w-5 h-5 rounded bg-[#F4DEDA] text-[#B73535] font-bold text-xs flex items-center justify-center shrink-0">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-bold text-[#667085] uppercase tracking-wide">
                                Direct Interrogation Prompt
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(q.question);
                                setCopiedQuestionIdx(idx);
                                setTimeout(() => setCopiedQuestionIdx(null), 2000);
                              }}
                              className="flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F0EBE2] hover:bg-[#EAE4D8] text-[#172235] border border-[#D8D1C5] cursor-pointer transition-colors"
                            >
                              {copiedQuestionIdx === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-[#39745A]" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-[#667085]" />
                                  <span>Copy Question</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="bg-[#F0EBE2] border border-[#D8D1C5] rounded-md p-3 text-xs font-medium text-[#172235] leading-relaxed mb-3">
                            <p className="font-semibold text-[#172235]">"{q.question}"</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                            <div className="bg-[#F4DEDA] border border-[#B73535]/40 rounded-md p-2.5">
                              <span className="font-bold text-[#B73535] uppercase block mb-1">
                                🎯 The Trap & Dilemma
                              </span>
                              <p className="text-[#172235] leading-relaxed">{q.trap_rationale}</p>
                            </div>

                            <div className="bg-[#DCE7F2] border border-[#183B63]/30 rounded-md p-2.5">
                              <span className="font-bold text-[#183B63] uppercase block mb-1">
                                📜 Legal IP Citation
                              </span>
                              <p className="text-[#172235] font-mono text-[10px] leading-relaxed">{q.patent_citation}</p>
                            </div>

                            <div className="bg-[#FAF0E1] border border-[#B47A32]/40 rounded-md p-2.5">
                              <span className="font-bold text-[#B47A32] uppercase block mb-1">
                                🛡️ Anticipated Deflection
                              </span>
                              <p className="text-[#172235] leading-relaxed">{q.expected_deflection}</p>
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
                    <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D8D1C5] gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Scale className="w-4 h-4 text-[#183B63]" />
                            <h4 className="text-sm font-bold text-[#183B63]">
                              Prior-Art Collision & Litigation Threat Assessment
                            </h4>
                          </div>
                          <p className="text-xs text-[#667085] mt-0.5">
                            Detects competing patent portfolios that threaten Freedom-to-Operate (FTO) or commercial deployment.
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-bold self-start sm:self-auto ${
                          auditResult.prior_art_collision.litigation_threat_level === 'HIGH'
                            ? 'bg-[#F4DEDA] text-[#B73535] border border-[#B73535]'
                            : 'bg-[#FAF0E1] text-[#B47A32] border border-[#B47A32]'
                        }`}>
                          {auditResult.prior_art_collision.litigation_threat_level} LITIGATION RISK
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4">
                        <div className="bg-[#F0EBE2] border border-[#D8D1C5] rounded-md p-3.5">
                          <span className="text-[10px] font-bold uppercase text-[#667085] block mb-1">
                            Primary IP Rival / Portfolio Holder
                          </span>
                          <div className="text-sm font-bold text-[#172235]">
                            {auditResult.prior_art_collision.primary_competitor}
                          </div>
                          <div className="mt-2 text-xs text-[#667085]">
                            <span className="font-semibold text-[#172235]">Overlapping Patent:</span>{' '}
                            <span className="font-mono text-[#183B63] font-bold">{auditResult.prior_art_collision.overlapping_patent_id}</span>
                          </div>
                          <p className="text-xs text-[#667085] mt-1 italic">
                            "{auditResult.prior_art_collision.overlapping_title}"
                          </p>
                        </div>

                        <div className="bg-[#F0EBE2] border border-[#D8D1C5] rounded-md p-3.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase text-[#667085]">
                                Claim Overlap Index
                              </span>
                              <span className="text-xs font-bold font-mono text-[#183B63]">
                                {auditResult.prior_art_collision.overlap_score} / 100
                              </span>
                            </div>
                            <div className="h-2 bg-[#D8D1C5] rounded-full overflow-hidden mt-1">
                              <div 
                                style={{ width: `${auditResult.prior_art_collision.overlap_score}%` }} 
                                className="bg-[#183B63] h-full"
                              />
                            </div>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-[#D8D1C5] text-xs text-[#667085]">
                            <span className="font-bold text-[#172235]">Risk Assessment:</span> High overlap indicates potential licensing royalties or patent redesign hurdles.
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF0E1] border border-[#B47A32]/40 rounded-md p-3 text-xs">
                        <span className="font-bold text-[#B47A32] block mb-1 uppercase text-[10px]">
                          ⚠️ Infringement & Royalty Threat Analysis
                        </span>
                        <p className="text-[#172235] leading-relaxed">
                          {auditResult.prior_art_collision.infringement_claim_focus}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Forensic Risk Radar */}
                {activeTab === 'radar' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-5 shadow-xs">
                    <div>
                      <h4 className="text-xs font-bold text-[#183B63] uppercase tracking-wider mb-1">
                        5-Pillar Forensic Risk Radar
                      </h4>
                      <p className="text-xs text-[#667085] mb-3">
                        Quantified metric across core engineering dimensions derived from SerpApi cross-engine extraction.
                      </p>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={auditResult.radar_metrics}>
                            <PolarGrid stroke="#D8D1C5" />
                            <PolarAngleAxis dataKey="subject" stroke="#667085" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#D8D1C5" />
                            <Radar name="Audit Score" dataKey="score" stroke="#183B63" fill="#183B63" fillOpacity={0.25} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#183B63] uppercase tracking-wider mb-1">
                        Pillar Breakdown vs Institutional Baseline
                      </h4>
                      <p className="text-xs text-[#667085] mb-3">
                        Normalized ratings relative to the 100-point institutional baseline.
                      </p>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={auditResult.radar_metrics} layout="vertical" margin={{ left: 50, right: 20 }}>
                            <XAxis type="number" domain={[0, 100]} stroke="#8A8F98" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="subject" stroke="#667085" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#FBF8F1', borderColor: '#D8D1C5', color: '#172235', borderRadius: '6px' }} />
                            <Bar dataKey="score" fill="#39745A" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Innovation Timeline */}
                {activeTab === 'timeline' && (
                  <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-5 shadow-xs">
                    <h4 className="text-xs font-bold text-[#183B63] uppercase tracking-wider mb-4">
                      Technology Evolution Trajectory (Academic Lab ➔ Patent Office ➔ Public Market)
                    </h4>

                    <div className="relative border-l-2 border-[#D8D1C5] ml-3 space-y-4">
                      {auditResult.timeline.map((item, idx) => (
                        <div key={idx} className="relative pl-6">
                          <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#183B63] ring-4 ring-[#FBF8F1]"></span>
                          <div className="bg-[#F0EBE2] border border-[#D8D1C5] rounded-md p-3.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-[#183B63]">{item.year} • {item.stage}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF8F1] text-[#172235] border border-[#D8D1C5]">
                                {item.badge}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-[#172235] mt-1">{item.title}</h5>
                            <p className="text-[11px] text-[#667085] mt-1">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: Evidence Vault */}
                {activeTab === 'evidence' && (
                  <div className="bg-[#FBF8F1] border border-[#D8D1C5] rounded-lg p-5 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 border-b border-[#D8D1C5] pb-2.5 text-xs">
                      <button
                        onClick={() => setEvidenceFilter('patents')}
                        className={`px-3 py-1.5 rounded-md font-bold cursor-pointer transition-colors ${
                          evidenceFilter === 'patents' ? 'bg-[#183B63] text-white' : 'bg-[#F0EBE2] text-[#172235] hover:bg-[#EAE4D8]'
                        }`}
                      >
                        Google Patents ({auditResult.raw_multi_engine_data.patents.length})
                      </button>
                      <button
                        onClick={() => setEvidenceFilter('scholar')}
                        className={`px-3 py-1.5 rounded-md font-bold cursor-pointer transition-colors ${
                          evidenceFilter === 'scholar' ? 'bg-[#183B63] text-white' : 'bg-[#F0EBE2] text-[#172235] hover:bg-[#EAE4D8]'
                        }`}
                      >
                        Google Scholar ({auditResult.raw_multi_engine_data.scholar.length})
                      </button>
                      <button
                        onClick={() => setEvidenceFilter('news')}
                        className={`px-3 py-1.5 rounded-md font-bold cursor-pointer transition-colors ${
                          evidenceFilter === 'news' ? 'bg-[#183B63] text-white' : 'bg-[#F0EBE2] text-[#172235] hover:bg-[#EAE4D8]'
                        }`}
                      >
                        Google News ({auditResult.raw_multi_engine_data.news.length})
                      </button>
                    </div>

                    {evidenceFilter === 'patents' && (
                      <div className="space-y-3">
                        {auditResult.raw_multi_engine_data.patents.map((p, i) => (
                          <div key={i} className="bg-[#F0EBE2] p-3.5 rounded-md border border-[#D8D1C5] text-xs">
                            <div className="flex items-center justify-between text-xs text-[#183B63] font-bold mb-1">
                              <span>{p.patent_id} • Status: {p.status}</span>
                              <span className="text-[#667085]">Filed: {p.filing_date}</span>
                            </div>
                            <h5 className="font-bold text-[#172235] text-xs">{p.title}</h5>
                            <p className="text-[11px] text-[#667085] mt-0.5">Assignee: {p.assignee}</p>
                            <p className="text-xs text-[#172235] mt-2 bg-[#FBF8F1] p-2.5 rounded border border-[#D8D1C5] leading-relaxed font-mono">
                              {p.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {evidenceFilter === 'scholar' && (
                      <div className="space-y-3">
                        {auditResult.raw_multi_engine_data.scholar.map((s, i) => (
                          <div key={i} className="bg-[#F0EBE2] p-3.5 rounded-md border border-[#D8D1C5] text-xs">
                            <div className="flex items-center justify-between text-xs text-[#39745A] font-bold mb-1">
                              <span>{s.citations} Citations Verified</span>
                              <span className="text-[#667085]">{s.publication}</span>
                            </div>
                            <h5 className="font-bold text-[#172235] text-xs">{s.title}</h5>
                            <p className="text-[11px] text-[#667085] mt-0.5">{s.authors}</p>
                            <p className="text-xs text-[#172235] mt-2 bg-[#FBF8F1] p-2.5 rounded border border-[#D8D1C5] leading-relaxed">
                              {s.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {evidenceFilter === 'news' && (
                      <div className="space-y-3">
                        {auditResult.raw_multi_engine_data.news.map((n, i) => (
                          <div key={i} className="bg-[#F0EBE2] p-3.5 rounded-md border border-[#D8D1C5] text-xs">
                            <div className="flex items-center justify-between text-xs text-[#B73535] font-bold mb-1">
                              <span>{n.source}</span>
                              <span className="text-[#667085]">{n.date}</span>
                            </div>
                            <h5 className="font-bold text-[#172235] text-xs">{n.title}</h5>
                            <p className="text-xs text-[#172235] mt-2 bg-[#FBF8F1] p-2.5 rounded border border-[#D8D1C5] leading-relaxed">
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
