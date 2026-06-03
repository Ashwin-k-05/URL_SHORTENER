import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getUserUrls, createUrl, deleteUrl } from '../utils/api';
import UrlCard from '../components/UrlCard';
import AnalyticsModal from '../components/AnalyticsModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [analyticsId, setAnalyticsId] = useState(null);
  const [search, setSearch] = useState('');

  // Form state
  const [form, setForm] = useState({ originalUrl: '', customAlias: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(true);

  const fetchUrls = useCallback(async () => {
    try {
      const { data } = await getUserUrls();
      setUrls(data.urls);
      setTotalClicks(data.totalClicks);
    } catch (err) {
      toast.error('Failed to load URLs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const validateForm = () => {
    const errs = {};
    if (!form.originalUrl) {
      errs.originalUrl = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(form.originalUrl)) {
      errs.originalUrl = 'URL must start with http:// or https://';
    }
    if (form.customAlias && !/^[a-zA-Z0-9_-]{3,20}$/.test(form.customAlias)) {
      errs.customAlias = 'Alias: 3-20 chars, letters/numbers/hyphens/underscores only';
    }
    return errs;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setCreating(true);
    try {
      const { data } = await createUrl({
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
      });
      setUrls((prev) => [data.url, ...prev]);
      setTotalClicks((prev) => prev + 0);
      setForm({ originalUrl: '', customAlias: '' });
      setFormErrors({});
      toast.success('Short URL created! 🎉');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create URL.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUrl(id);
      const deleted = urls.find((u) => u._id === id);
      setUrls((prev) => prev.filter((u) => u._id !== id));
      setTotalClicks((prev) => prev - (deleted?.clickCount || 0));
      toast.success('URL deleted.');
    } catch (err) {
      toast.error('Failed to delete URL.');
    }
  };

  const filteredUrls = urls.filter((u) =>
    u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    u.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="dashboard-inner">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Hey, <span className="text-accent">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-secondary" style={{ fontSize: 14 }}>
              Manage and track all your short links
            </p>
          </div>
          <div className="dashboard-stats">
            <div className="dash-stat">
              <div className="dash-stat-value">{urls.length}</div>
              <div className="dash-stat-label">Links</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">{totalClicks}</div>
              <div className="dash-stat-label">Total Clicks</div>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <div className="create-section card">
          <div
            className="create-header"
            onClick={() => setShowForm(!showForm)}
            style={{ cursor: 'pointer' }}
          >
            <h2 className="create-title">
              <span>✂</span> Shorten a URL
            </h2>
            <span className="create-toggle">{showForm ? '▲' : '▼'}</span>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="create-form fade-in" noValidate>
              <div className="create-fields">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label" htmlFor="originalUrl">
                    Paste your long URL
                  </label>
                  <input
                    id="originalUrl"
                    name="originalUrl"
                    type="url"
                    className={`form-input ${formErrors.originalUrl ? 'error' : ''}`}
                    placeholder="https://example.com/very/long/url/that/needs/shortening"
                    value={form.originalUrl}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, originalUrl: e.target.value }));
                      if (formErrors.originalUrl) setFormErrors((fe) => ({ ...fe, originalUrl: '' }));
                    }}
                    autoFocus
                  />
                  {formErrors.originalUrl && (
                    <span className="form-error">⚠ {formErrors.originalUrl}</span>
                  )}
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="customAlias">
                    Custom alias <span className="text-muted">(optional)</span>
                  </label>
                  <div className="alias-input-wrap">
                    <span className="alias-prefix font-mono">snip.ly/</span>
                    <input
                      id="customAlias"
                      name="customAlias"
                      type="text"
                      className={`form-input alias-input ${formErrors.customAlias ? 'error' : ''}`}
                      placeholder="my-link"
                      value={form.customAlias}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, customAlias: e.target.value }));
                        if (formErrors.customAlias) setFormErrors((fe) => ({ ...fe, customAlias: '' }));
                      }}
                    />
                  </div>
                  {formErrors.customAlias && (
                    <span className="form-error">⚠ {formErrors.customAlias}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary create-btn"
                disabled={creating}
              >
                {creating ? <><span className="spinner" /> Creating…</> : '⚡ Shorten URL'}
              </button>
            </form>
          )}
        </div>

        {/* URL List */}
        <div className="urls-section">
          <div className="urls-header">
            <h2 className="urls-title">Your Links</h2>
            {urls.length > 3 && (
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search URLs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </div>

          {loading && (
            <div className="urls-loading">
              <div className="spinner" />
              <span className="text-muted">Loading your links…</span>
            </div>
          )}

          {!loading && filteredUrls.length === 0 && (
            <div className="urls-empty">
              <div className="urls-empty-icon">🔗</div>
              <h3>
                {search ? 'No links match your search' : 'No links yet'}
              </h3>
              <p className="text-secondary">
                {search
                  ? 'Try a different search term'
                  : 'Paste a long URL above to create your first short link!'}
              </p>
            </div>
          )}

          {!loading && filteredUrls.length > 0 && (
            <div className="urls-list">
              {filteredUrls.map((url, i) => (
                <div
                  key={url._id}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <UrlCard
                    url={url}
                    onDelete={handleDelete}
                    onViewAnalytics={setAnalyticsId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {analyticsId && (
        <AnalyticsModal
          urlId={analyticsId}
          onClose={() => setAnalyticsId(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
