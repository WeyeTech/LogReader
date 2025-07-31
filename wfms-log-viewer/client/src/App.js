import React, { useState, useEffect } from "react";
import { API_BASE_URL } from './config';

function ErrorHistory() {
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recheckResults, setRecheckResults] = useState({});

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  const fetchErrorLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/error-logs`);
      const data = await res.json();
      setErrorLogs(data.reverse()); // show latest first
    } catch (err) {
      setErrorLogs([]);
    }
    setLoading(false);
  };

  const recheckError = async (log, idx) => {
    setRecheckResults(prev => ({ ...prev, [idx]: { loading: true } }));
    try {
      const params = new URLSearchParams({
        demandId: log.request.demandId,
        duration: log.request.duration,
        unit: log.request.unit
      }).toString();
      const res = await fetch(`${API_BASE_URL}/api/logs?${params}`);
      const data = await res.json();
      if (data.errors && data.errors.length === 0) {
        setRecheckResults(prev => ({ ...prev, [idx]: { status: 'fixed' } }));
      } else {
        setRecheckResults(prev => ({ ...prev, [idx]: { status: 'error', errors: data.errors } }));
      }
    } catch (err) {
      setRecheckResults(prev => ({ ...prev, [idx]: { status: 'exception', message: err.message } }));
    }
  };

  return (
    <div style={{ background: '#f8fafc', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 24, marginBottom: 32, maxWidth: 900, margin: '32px auto' }}>
      <h2 style={{ color: '#3b82f6', fontWeight: 800, fontSize: 28, marginBottom: 16 }}>Error History</h2>
      {loading ? <div>Loading...</div> : errorLogs.length === 0 ? <div style={{ color: '#64748b' }}>No error logs found.</div> : (
        errorLogs.map((log, idx) => (
          <div key={idx} style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(60,60,120,0.04)' }}>
            <div style={{ fontSize: 15, color: '#64748b', marginBottom: 4 }}>Timestamp: {new Date(log.timestamp).toLocaleString()}</div>
            <div style={{ fontSize: 15, color: '#222', marginBottom: 4 }}>
              <b>Request:</b> demandId={log.request.demandId}, duration={log.request.duration}, unit={log.request.unit}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Errors:</b>
              {log.errors.map((err, i) => (
                <div key={i} style={{ color: '#b91c1c', fontWeight: 600 }}>
                  {err.pod}: {err.message}
                </div>
              ))}
            </div>
            <button
              onClick={() => recheckError(log, idx)}
              disabled={recheckResults[idx]?.loading}
              style={{
                background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 8
              }}
            >
              {recheckResults[idx]?.loading ? 'Rechecking...' : 'Recheck'}
            </button>
            {recheckResults[idx]?.status === 'fixed' && (
              <span style={{ color: '#16a34a', fontWeight: 700, marginLeft: 12 }}>Issue fixed!</span>
            )}
            {recheckResults[idx]?.status === 'error' && (
              <div style={{ color: '#b91c1c', marginTop: 8 }}>
                <b>Still errors:</b>
                {recheckResults[idx].errors.map((err, i) => (
                  <div key={i}>{err.pod}: {err.message}</div>
                ))}
              </div>
            )}
            {recheckResults[idx]?.status === 'exception' && (
              <div style={{ color: '#b91c1c', marginTop: 8 }}>Exception: {recheckResults[idx].message}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function App() {
  const [demandId, setDemandId] = useState("");
  const [duration, setDuration] = useState(24);
  const [durationUnit, setDurationUnit] = useState('hours');
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wfmsLogs, setWfmsLogs] = useState([]);
  const [pricingLogs, setPricingLogs] = useState([]);
  const [consignerLogs, setConsignerLogs] = useState([]);
  const [tesseractLogs, setTesseractLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [mergedLogs, setMergedLogs] = useState([]);
  const [mergedLoading, setMergedLoading] = useState(false);
  const [odinLogs, setOdinLogs] = useState([]);
  const [ravenLogs, setRavenLogs] = useState([]);
  const [umsLogs, setUmsLogs] = useState([]);
  const [argusLogs, setArgusLogs] = useState([]);
  const [shieldLogs, setShieldLogs] = useState([]);
  const [omsLogs, setOmsLogs] = useState([]);
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [mjolnirLogs, setMjolnirLogs] = useState([]);
  const [ocmsLogs, setOcmsLogs] = useState([]);
  const [apiErrors, setApiErrors] = useState([]);
  const [hasFetchedLogs, setHasFetchedLogs] = useState(false);
  const [activeTab, setActiveTab] = useState('mp'); // 'mp' or 'saas'

  useEffect(() => {
    document.title = 'Simple Log Viewer';
  }, []);

  // Clear errors and logs when tab changes
  useEffect(() => {
    setApiErrors([]);
    setHasFetchedLogs(false);
    setMergedLogs([]);
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    setWfmsLogs([]);
    setPricingLogs([]);
    setConsignerLogs([]);
    setTesseractLogs([]);
    setLogs([]);
    setCount(null);
    setSummary(null);
    setShowSummary(false);
    setOdinLogs([]);
    setRavenLogs([]);
    setUmsLogs([]);
    setArgusLogs([]);
    setShieldLogs([]);
    setOmsLogs([]);
    setPaymentLogs([]);
    setMjolnirLogs([]);
    setOcmsLogs([]);
    setMergedLogs([]);
    setApiErrors([]);
    setHasFetchedLogs(false);
    try {
      // Include UMS logs only when SaaS tab is active
      const includeUms = activeTab === 'saas' ? 'true' : 'false';
      const res = await fetch(`${API_BASE_URL}/api/logs?demandId=${demandId}&duration=${duration}&unit=${durationUnit}&includeUms=${includeUms}`);
      const data = await res.json();
      setWfmsLogs(data.wfmsLogs || []);
      setPricingLogs(data.pricingLogs || []);
      setConsignerLogs(data.consignerLogs || []);
      setTesseractLogs(data.tesseractLogs || []);
      setOdinLogs(data.odinLogs || []);
      setRavenLogs(data.ravenLogs || []);
      setUmsLogs(data.umsLogs || []);
      setArgusLogs(data.argusLogs || []);
      setShieldLogs(data.shieldLogs || []);
      setOmsLogs(data.omsLogs || []);
      setPaymentLogs(data.paymentLogs || []);
      setMjolnirLogs(data.mjolnirLogs || []);
      setOcmsLogs(data.ocmsLogs || []);
      setApiErrors(data.errors || []);
      setCount(data.count);
      setHasFetchedLogs(true);
    } catch (err) {
      setError(err.message);
      setApiErrors([{ pod: 'exception', message: err.message }]);
      setHasFetchedLogs(true);
    }
    setLoading(false);
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/summary?demandId=${demandId}&duration=${duration}&unit=${durationUnit}`);
      const data = await res.json();
      setSummary(data);
      setShowSummary(true);
    } catch (err) {
      setError(err.message);
    }
    setSummaryLoading(false);
  };

  const resetLogs = () => {
    setWfmsLogs([]);
    setPricingLogs([]);
    setConsignerLogs([]);
    setTesseractLogs([]);
    setLogs([]);
    setCount(null);
    setSummary(null);
    setShowSummary(false);
    setError(null);
    setOdinLogs([]);
    setRavenLogs([]);
    setUmsLogs([]);
    setArgusLogs([]);
    setShieldLogs([]);
    setOmsLogs([]);
    setPaymentLogs([]);
    setMjolnirLogs([]);
    setOcmsLogs([]);
    setMergedLogs([]);
    setApiErrors([]);
    setHasFetchedLogs(false);
  };

  const fetchMergedLogs = async () => {
    setMergedLoading(true);
    setError(null);
    setMergedLogs([]);
    try {
      // Fetch merged logs based on active tab
      const tabType = activeTab === 'mp' ? 'mp' : 'saas';
      const res = await fetch(`${API_BASE_URL}/api/logs/merged?demandId=${demandId}&duration=${duration}&unit=${durationUnit}&tab=${tabType}`);
      const data = await res.json();
      setMergedLogs(data.mergedLogs || []);
    } catch (err) {
      setError(err.message);
    }
    setMergedLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: 40, minWidth: 400, maxWidth: 600, textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6', marginBottom: 8, letterSpacing: 1 }}>Log Viewer</div>
        <div style={{ fontSize: 18, color: '#64748b', marginBottom: 24, fontWeight: 500 }}>View and analyze logs across services</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
          <input
            placeholder="Demand ID"
            value={demandId}
            onChange={e => setDemandId(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 16,
              outline: 'none',
              width: 120,
              transition: 'border 0.2s',
              boxShadow: '0 1px 2px rgba(60,60,120,0.04)'
            }}
          />
          <input
            type="number"
            placeholder="Duration"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 16,
              outline: 'none',
              width: 100,
              transition: 'border 0.2s',
              boxShadow: '0 1px 2px rgba(60,60,120,0.04)'
            }}
            min={1}
          />
          <select
            value={durationUnit}
            onChange={e => setDurationUnit(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 16,
              outline: 'none',
              background: '#f1f5f9',
              transition: 'border 0.2s',
              boxShadow: '0 1px 2px rgba(60,60,120,0.04)'
            }}
          >
            <option value="hours">Hours</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <button
            onClick={fetchLogs}
            disabled={loading || !demandId}
            style={{
              background: loading || !demandId ? '#cbd5e1' : 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 16,
              fontWeight: 600,
              cursor: loading || !demandId ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { if (!loading && demandId) e.target.style.background = '#2563eb'; }}
            onMouseOut={e => { if (!loading && demandId) e.target.style.background = 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'; }}
          >
            {loading ? "Loading..." : "Fetch Logs"}
          </button>
          <button
            onClick={fetchMergedLogs}
            disabled={mergedLoading || !demandId}
            style={{
              background: mergedLoading || !demandId ? '#cbd5e1' : 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 16,
              fontWeight: 600,
              cursor: mergedLoading || !demandId ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { if (!mergedLoading && demandId) e.target.style.background = '#f59e42'; }}
            onMouseOut={e => { if (!mergedLoading && demandId) e.target.style.background = 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)'; }}
          >
            {mergedLoading ? "Loading..." : `Show ${activeTab === 'mp' ? 'MP' : 'SaaS'} Logs (Merged & Sorted)`}
          </button>
          <button
            onClick={resetLogs}
            style={{
              background: '#f1f5f9',
              color: '#222',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(60,60,120,0.04)',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => { e.target.style.background = '#e0e7ef'; }}
            onMouseOut={e => { e.target.style.background = '#f1f5f9'; }}
          >
            Reset Logs
          </button>
        </div>
        {error && <div style={{ color: '#ef4444', marginBottom: 8, fontWeight: 500 }}>{error}</div>}
        {count !== null && <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: 8 }}>Log Count: {count}</div>}
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 4, marginTop: 16, justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('mp')}
            style={{
              background: activeTab === 'mp' ? '#3b82f6' : '#f1f5f9',
              color: activeTab === 'mp' ? '#fff' : '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            MP Services
          </button>
          <button
            onClick={() => setActiveTab('saas')}
            style={{
              background: activeTab === 'saas' ? '#3b82f6' : '#f1f5f9',
              color: activeTab === 'saas' ? '#fff' : '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            SaaS Services
          </button>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {apiErrors.length > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12, padding: 16, marginBottom: 16, fontWeight: 600, maxHeight: 400, overflow: 'auto' }}>
            <div style={{ fontSize: 18, marginBottom: 8, position: 'sticky', top: 0, background: '#fef2f2', padding: '4px 0' }}>Errors from {activeTab === 'mp' ? 'MP' : 'SaaS'} PODs:</div>
            {apiErrors
              .filter(err => {
                // Filter errors based on active tab
                if (activeTab === 'mp') {
                  // Show only MP pod errors
                  return ['wfmsLogs', 'pricingLogs', 'consignerLogs', 'tesseractLogs', 'odinLogs', 'ravenLogs'].includes(err.pod);
                } else {
                  // Show only SaaS pod errors
                  return ['umsLogs', 'argusLogs', 'shieldLogs', 'omsLogs', 'paymentLogs', 'mjolnirLogs', 'ocmsLogs'].includes(err.pod);
                }
              })
              .map((err, idx) => (
                <div key={idx} style={{ marginBottom: 16 }}>
                  <div style={{ color: '#b91c1c', fontWeight: 700 }}>{err.pod}:</div>
                  {err.message && <div style={{ marginBottom: 4 }}>Fetch/Query Error: {err.message}</div>}
                  {err.logLevelErrors && err.logLevelErrors.length > 0 && (
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ fontWeight: 600 }}>Log-level Errors:</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {err.logLevelErrors.map((log, i) => (
                          <li key={i} style={{ marginBottom: 4, fontFamily: 'Fira Mono, monospace', fontSize: 14 }}>
                            <span style={{ color: '#2563eb' }}>[{log['@timestamp'] || ''}]</span> {log.log || log.message || ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!err.message && (!err.logLevelErrors || err.logLevelErrors.length === 0) && <div>No errors found.</div>}
                </div>
              ))}
          </div>
        )}
        {hasFetchedLogs && apiErrors.filter(err => {
          if (activeTab === 'mp') {
            return ['wfmsLogs', 'pricingLogs', 'consignerLogs', 'tesseractLogs', 'odinLogs', 'ravenLogs'].includes(err.pod);
          } else {
            return ['umsLogs', 'argusLogs', 'shieldLogs', 'omsLogs', 'paymentLogs', 'mjolnirLogs', 'ocmsLogs'].includes(err.pod);
          }
        }).length === 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 12, padding: 16, marginBottom: 16, fontWeight: 600 }}>
            <div style={{ fontSize: 16 }}>No errors from any {activeTab === 'mp' ? 'MP' : 'SaaS'} POD.</div>
          </div>
        )}
        {mergedLogs.length > 0 && (
          <div style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e42 100%)', borderRadius: 16, boxShadow: '0 4px 16px rgba(251,191,36,0.08)', padding: 24 }}>
            <h3 style={{ color: '#b45309', fontWeight: 700, marginBottom: 16, fontSize: 22 }}>
              {activeTab === 'mp' ? 'MP Services' : 'SaaS Services'} Logs (Merged & Time Sorted)
            </h3>
            <div style={{ maxHeight: 400, overflow: "auto", background: "#fff7ed", padding: 16, borderRadius: 12, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
              {mergedLogs.map((log, i) => (
                <div key={i} style={{ marginBottom: 14, borderBottom: '1px solid #fde68a', paddingBottom: 8 }}>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span> <span style={{ color: '#64748b' }}>[{log['source'] || ''}]</span>
                  <br/>
                  <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  <br/>
                  <span style={{ color: '#a16207', fontSize: 13 }}>Pod: {log['pod_name'] || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tabbed Content */}
        {activeTab === 'mp' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#3b82f6', fontWeight: 700, marginBottom: 12 }}>WFMS Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {wfmsLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#f59e42', fontWeight: 700, marginBottom: 12 }}>Pricing Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {pricingLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#f59e42', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#10b981', fontWeight: 700, marginBottom: 12 }}>Consigner Aggregator Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {consignerLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#a21caf', fontWeight: 700, marginBottom: 12 }}>Tesseract Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {tesseractLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#a21caf', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#f43f5e', fontWeight: 700, marginBottom: 12 }}>Odin Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {odinLogs && odinLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#f43f5e', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#6366f1', fontWeight: 700, marginBottom: 12 }}>Raven Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {ravenLogs && ravenLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#6366f1', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'saas' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#8b5cf6', fontWeight: 700, marginBottom: 12 }}>UMS Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {umsLogs && umsLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#8b5cf6', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#dc2626', fontWeight: 700, marginBottom: 12 }}>Argus Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {argusLogs && argusLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#059669', fontWeight: 700, marginBottom: 12 }}>Shield Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {shieldLogs && shieldLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#059669', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#7c3aed', fontWeight: 700, marginBottom: 12 }}>OMS Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {omsLogs && omsLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#7c3aed', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#ea580c', fontWeight: 700, marginBottom: 12 }}>Payment Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {paymentLogs && paymentLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#ea580c', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#be185d', fontWeight: 700, marginBottom: 12 }}>Mjolnir Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {mjolnirLogs && mjolnirLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#be185d', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(60,60,120,0.06)', padding: 20 }}>
              <h3 style={{ color: '#0891b2', fontWeight: 700, marginBottom: 12 }}>OCMS Logs</h3>
              <div style={{ maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 12, borderRadius: 8, fontFamily: 'Fira Mono, monospace', fontSize: 15 }}>
                {ocmsLogs && ocmsLogs.map((log, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <span style={{ color: '#0891b2', fontWeight: 600 }}>[{log['@timestamp'] || ''}]</span>
                    <br/>
                    <span style={{ color: '#222', fontWeight: 500 }}>{log['log'] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 