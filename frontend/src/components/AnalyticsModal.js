import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { getUrlAnalytics } from '../utils/api';
import './AnalyticsModal.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const AnalyticsModal = ({ urlId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUrlAnalytics(urlId);
      setData(res.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [urlId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Close on escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📊 Analytics</h2>
          <button className="modal-close btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        {loading && (
          <div className="modal-loading">
            <div className="spinner" />
            <span>Loading analytics…</span>
          </div>
        )}

        {error && (
          <div className="modal-error">{error}</div>
        )}

        {data && !loading && (
          <div className="modal-body fade-in">
            <div className="analytics-stats">
              <div className="stat-card">
                <div className="stat-value">{data.clickCount}</div>
                <div className="stat-label">Total Clicks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {data.lastVisited
                    ? format(new Date(data.lastVisited), 'MMM d')
                    : '—'}
                </div>
                <div className="stat-label">Last Visited</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {format(new Date(data.createdAt), 'MMM d')}
                </div>
                <div className="stat-label">Created</div>
              </div>
            </div>

            <div className="analytics-urls">
              <div className="analytics-url-row">
                <span className="analytics-url-label">Short URL</span>
                <a
                  href={`${BASE_URL}/${data.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-accent"
                >
                  {BASE_URL}/{data.shortCode}
                </a>
              </div>
              <div className="analytics-url-row">
                <span className="analytics-url-label">Original URL</span>
                <a
                  href={data.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary analytics-original"
                >
                  {data.originalUrl}
                </a>
              </div>
            </div>

            <div className="analytics-visits-section">
              <h3 className="analytics-section-title">Recent Visits</h3>
              {data.recentVisits && data.recentVisits.length > 0 ? (
                <div className="visits-list">
                  {data.recentVisits.map((visit, i) => (
                    <div key={i} className="visit-row">
                      <div className="visit-time font-mono">
                        {format(new Date(visit.visitedAt), 'MMM d, HH:mm:ss')}
                      </div>
                      <div className="visit-referrer">
                        {visit.referrer === 'direct' ? '🔗 Direct' : `↪ ${visit.referrer.slice(0, 40)}`}
                      </div>
                      <div className="visit-ua text-muted" title={visit.userAgent}>
                        {visit.userAgent.slice(0, 30)}…
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-visits">No visits recorded yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
