import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  BookOpen,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Cpu,
  Layers,
  Send
} from 'lucide-react';

interface Article {
  id: number;
  article_id: string;
  title: string;
  category: string;
  product: string;
  summary: string;
  content: string;
  steps: string[];
  error_codes: string;
  tags: string;
  updated_at?: string;
}

interface UniversalKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalKnowledgeModal: React.FC<UniversalKnowledgeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'crawler' | 'articles' | 'trainer' | 'test'>('crawler');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Crawler Form State
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlCategory, setCrawlCategory] = useState('');
  const [crawlProduct, setCrawlProduct] = useState('');
  const [crawlResult, setCrawlResult] = useState<any>(null);

  // Manual Knowledge State
  const [manualTitle, setManualTitle] = useState('');
  const [manualProduct, setManualProduct] = useState('');
  const [manualCategory, setManualCategory] = useState('Hardware & Troubleshooting');
  const [manualContent, setManualContent] = useState('');
  const [manualSteps, setManualSteps] = useState('');
  const [manualErrorCodes, setManualErrorCodes] = useState('');
  const [manualTags, setManualTags] = useState('');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Live Tester State
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Dataset Export State
  const [exportedDataset, setExportedDataset] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadArticles();
    }
  }, [isOpen]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/crawler/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (e) {
      console.error('Failed to load knowledge articles:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedUniversal = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/crawler/seed-universal-knowledge', {
        method: 'POST',
      });
      const data = await res.json();
      setStatusMessage({
        type: 'success',
        text: `Universal Knowledge Base initialized with ${data.articles_seeded || data.total_universal_guides} verified guides!`,
      });
      loadArticles();
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Failed to seed: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCrawlUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;

    setLoading(true);
    setStatusMessage(null);
    setCrawlResult(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/crawler/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: crawlUrl.trim(),
          category: crawlCategory || undefined,
          product: crawlProduct || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Crawling failed');
      }

      const data = await res.json();
      setCrawlResult(data);
      setStatusMessage({
        type: 'success',
        text: `Successfully crawled & trained Knowledge Engine from: ${crawlUrl}`,
      });
      setCrawlUrl('');
      loadArticles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Crawl error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    const stepsArray = manualSteps
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/crawler/ingest-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          content: manualContent.trim(),
          product: manualProduct.trim() || 'Universal Product',
          category: manualCategory.trim() || 'Hardware & Troubleshooting',
          steps: stepsArray,
          error_codes: manualErrorCodes.trim(),
          tags: manualTags.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save manual knowledge');
      }

      setStatusMessage({
        type: 'success',
        text: `Successfully ingested "${manualTitle}" into Knowledge Engine!`,
      });
      setManualTitle('');
      setManualContent('');
      setManualSteps('');
      setManualErrorCodes('');
      setManualTags('');
      loadArticles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Ingest error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleExportDataset = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/crawler/export-dataset');
      if (res.ok) {
        const data = await res.json();
        setExportedDataset(data);
      }
    } catch (e) {
      console.error('Failed to export dataset:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestUniversalQuery = async (queryText?: string) => {
    const q = queryText || testQuery;
    if (!q.trim()) return;

    setTestLoading(true);
    setTestResponse(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'cust_sarah',
          productId: 'PROD-001',
          message: q.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResponse(data);
      }
    } catch (e: any) {
      console.error('Test query failed:', e);
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Universal Knowledge & Web Trainer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Real-Time RAG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crawl technical websites, index diagnostic manuals, and train RecallAI for any universal problem.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 bg-slate-100 border-b border-slate-200 shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('crawler')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'crawler'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Web Crawler & Ingestion</span>
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'articles'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base ({articles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'test'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Real-Time Problem Solver Test</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('trainer');
                handleExportDataset();
              }}
              className={`px-4 py-3 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-colors ${
                activeTab === 'trainer'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Fine-Tuning Dataset</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSeedUniversal}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Seed Universal Guides</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center space-x-2 border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* 1. WEB CRAWLER TAB */}
          {activeTab === 'crawler' && (
            <div className="space-y-6">
              {/* Quick Suggestions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Sample Technical URLs to Crawl:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'HTTP 404 Spec', url: 'https://en.wikipedia.org/wiki/HTTP_404', cat: 'Web & Protocols', prod: 'Web Server' },
                    { label: 'Wi-Fi 6 Protocol', url: 'https://en.wikipedia.org/wiki/Wi-Fi_6', cat: 'Connectivity & Wireless', prod: 'Network Equipment' },
                    { label: 'Bluetooth Audio LDAC', url: 'https://en.wikipedia.org/wiki/LDAC_(codec)', cat: 'Audio & Sound', prod: 'Wireless Headphones' },
                    { label: 'Lithium-Ion Battery Health', url: 'https://en.wikipedia.org/wiki/Lithium-ion_battery', cat: 'Power & Battery', prod: 'Mobile Device' },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCrawlUrl(s.url);
                        setCrawlCategory(s.cat);
                        setCrawlProduct(s.prod);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-slate-700 transition-colors flex items-center space-x-1"
                    >
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Ingestion Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Crawl & Ingest Webpage / Online Documentation</span>
                  </h3>
                  <span className="text-xs text-slate-500">Auto-strips HTML, extracts step-by-step procedures</span>
                </div>

                <form onSubmit={handleCrawlUrl} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Webpage URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        required
                        placeholder="https://support.apple.com/... or https://support.dell.com/..."
                        value={crawlUrl}
                        onChange={(e) => setCrawlUrl(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={loading || !crawlUrl}
                        className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center space-x-2 disabled:opacity-50 transition-colors"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        <span>Crawl & Ingest</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Power & Battery, Connectivity"
                        value={crawlCategory}
                        onChange={(e) => setCrawlCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Product / Device (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Apple MacBook, Sony WH-1000XM5"
                        value={crawlProduct}
                        onChange={(e) => setCrawlProduct(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </form>

                {/* Crawl Result Preview */}
                {crawlResult && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Indexed as {crawlResult.article_id}</span>
                      </span>
                      <span className="text-xs text-slate-400">{crawlResult.category} • {crawlResult.product}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{crawlResult.title}</h4>
                    <p className="text-xs text-slate-300">{crawlResult.summary}</p>
                    {crawlResult.steps?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <span className="text-xs font-semibold text-blue-300 block mb-1">Extracted Troubleshooting Steps:</span>
                        <ul className="list-decimal list-inside text-xs text-slate-300 space-y-1">
                          {crawlResult.steps.map((st: string, i: number) => (
                            <li key={i}>{st}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Ingestion Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Manual Knowledge / Repair Procedure Ingestion</span>
                </h3>

                <form onSubmit={handleManualIngest} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Guide Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., PS5 Error CE-108255-1 Recovery Protocol"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Product
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Sony PlayStation 5"
                        value={manualProduct}
                        onChange={(e) => setManualProduct(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Hardware & Troubleshooting"
                        value={manualCategory}
                        onChange={(e) => setManualCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Problem Summary / Root Cause <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Explain what causes this issue and diagnostic symptoms..."
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recommended Troubleshooting Steps (One per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Step 1: Check for game application updates&#10;Step 2: Rebuild PS5 database in Safe Mode&#10;Step 3: Clear system cache"
                      value={manualSteps}
                      onChange={(e) => setManualSteps(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Error Codes (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., CE-108255-1, 0x80070005"
                        value={manualErrorCodes}
                        onChange={(e) => setManualErrorCodes(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Semantic Tags
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., ps5, crash, safe-mode, rebuild-database"
                        value={manualTags}
                        onChange={(e) => setManualTags(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || !manualTitle || !manualContent}
                      className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-2 disabled:opacity-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Universal Knowledge Pool</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 2. ARTICLES LIST TAB */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search articles by title, product, tag, or error code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {filteredArticles.length} of {articles.length} indexed articles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {art.article_id}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {art.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {art.summary}
                      </p>
                      {art.steps?.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Action Steps ({art.steps.length}):
                          </span>
                          <ul className="list-decimal list-inside text-[11px] text-slate-700 space-y-0.5">
                            {art.steps.slice(0, 3).map((st, i) => (
                              <li key={i} className="truncate">{st}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-semibold text-indigo-600">{art.product}</span>
                      {art.error_codes && (
                        <span className="font-mono bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
                          {art.error_codes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. REAL-TIME PROBLEM SOLVER TESTER */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Test Universal Problem Query Resolution</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ask any technical problem (electronics, software, error codes, smart appliances). RecallAI will match against indexed web guides, cite the verified knowledge badge, and formulate an accurate step-by-step resolution.
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-500 block w-full">Quick Test Scenarios:</span>
                  {[
                    "My Wi-Fi keeps disconnecting with DNS_PROBE_FINISHED_NO_INTERNET",
                    "Sony WH-1000XM5 keeps dropping Bluetooth audio connection",
                    "Smart refrigerator temperature is rising and not cooling",
                    "HDMI external monitor is flickering with black screen",
                    "I am getting an HTTP 404 Not Found error on my server",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTestQuery(preset);
                        handleTestUniversalQuery(preset);
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Enter any universal technical problem or symptom..."
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestUniversalQuery()}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50 focus:bg-white"
                  />
                  <button
                    onClick={() => handleTestUniversalQuery()}
                    disabled={testLoading || !testQuery.trim()}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
                  >
                    {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Solve in Real-Time</span>
                  </button>
                </div>
              </div>

              {testResponse && (
                <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Solution Synthesized</span>
                    </span>
                    <div className="flex space-x-1">
                      {testResponse.memory_used?.map((m: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {m.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                    {testResponse.message || testResponse.reply}
                  </div>

                  {testResponse.suggested_actions?.length > 0 && (
                    <div className="flex items-center space-x-2 text-xs text-slate-600">
                      <span className="font-bold">Next Contingency Action:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-semibold text-slate-800 border border-slate-200">
                        {testResponse.suggested_actions[0]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. FINE-TUNING DATASET TAB */}
          {activeTab === 'trainer' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Export OpenAI / ChatML Fine-Tuning Dataset</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Export all crawled guides, resolution journeys, and verified hindsight memories as standard JSONL training pairs.
                    </p>
                  </div>
                  <button
                    onClick={handleExportDataset}
                    disabled={loading}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Refresh Dataset</span>
                  </button>
                </div>

                {exportedDataset && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-emerald-700">
                      ✓ {exportedDataset.sample_count} Training Samples Generated
                    </span>
                    <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] max-h-96 overflow-y-auto leading-relaxed">
                      {JSON.stringify(exportedDataset.dataset, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
