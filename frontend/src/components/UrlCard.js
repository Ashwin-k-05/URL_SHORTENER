import React, { useState } from 'react';
import { format } from 'date-fns';
import './UrlCard.css';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const UrlCard = ({ url, onDelete, onViewAnalytics }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const shortUrl = `${BASE_URL}/${url.shortCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this short URL? This cannot be undone.')) return;
    setDeleting(true);
    await onDelete(url._id);
    setDeleting(false);
  };

  const truncate = (str, max = 50) =>
    str.length > max ? str.slice(0, max) + '…' : str;

  return (
    <div className="url-card fade-in">
      <div className="url-card-top">
        <div className="url-original-wrap">
          <span className="url-label">Original URL</span>
          <a
            href={url.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="url-original"
            title={url.originalUrl}
          >
            {truncate(url.originalUrl, 60)}
          </a>
        </div>

        <div className="url-actions">
          <button
            className={`btn btn-sm btn-ghost ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copy short URL"
          >
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => onViewAnalytics(url._id)}
            title="View analytics"
          >
            📊 Analytics
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete URL"
          >
            {deleting ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '🗑'}
          </button>
        </div>
      </div>

      <div className="url-short-row">
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="url-short font-mono"
        >
          {shortUrl}
        </a>
        {url.customAlias && (
          <span className="badge badge-warning">Custom</span>
        )}
      </div>

      <div className="url-meta">
        <span className="url-meta-item">
          <span className="url-meta-icon">🕐</span>
          {format(new Date(url.createdAt), 'MMM d, yyyy')}
        </span>
        <span className="url-meta-item">
          <span className="url-meta-icon">👆</span>
          <strong>{url.clickCount}</strong> click{url.clickCount !== 1 ? 's' : ''}
        </span>
        {url.lastVisited && (
          <span className="url-meta-item">
            <span className="url-meta-icon">🔄</span>
            Last: {format(new Date(url.lastVisited), 'MMM d, HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
};

export default UrlCard;
