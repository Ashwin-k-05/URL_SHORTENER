import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="notfound">
    <div className="notfound-code">404</div>
    <h1 className="notfound-title">Link not found</h1>
    <p className="notfound-desc">
      This short link doesn't exist or may have been deleted.
    </p>
    <Link to="/" className="btn btn-primary">
      ← Back to Home
    </Link>
  </div>
);

export default NotFound;
