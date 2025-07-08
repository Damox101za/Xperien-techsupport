'use client';
import { useEffect, useState, useRef } from 'react';

export default function Page() {
  const [devices, setDevices] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filterText, setFilterText] = useState('');
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadCSV = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/devices.csv');
      const text = await res.text();
      const rows = text
        .trim()
        .split('\n')
        .map(row => row.split(','));
      setDevices(rows);
    } catch (e) {
      setError('Unable to load the network devices data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCSV();
  }, []);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const headers = devices[0] || [];
  const dataRows = devices.slice(1);

  // Filter
  const filteredRows = dataRows.filter(row =>
    row.some(cell =>
      cell.toLowerCase().includes(filterText.toLowerCase())
    )
  );

  // Sort
  const sortedRows =
    sortColumn !== null
      ? [...filteredRows].sort((a, b) => {
          const valA = a[sortColumn] || '';
          const valB = b[sortColumn] || '';
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        })
      : filteredRows;

  return (
    <div>
      {/* Header */}
      <header className="sticky-header">
        <div className="header-content">
          <img
            src="/logo color@4x.png"
            alt="Company Logo"
            className="logo"
          />
          <div className="header-text">
            <h1>Network Devices for Sale</h1>
            <p className="subtitle">
              Professional Network Equipment Inventory
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={loadCSV}>
              <i className="fas fa-sync-alt"></i> Refresh Data
            </button>
            <input
              type="file"
              accept=".csv"
              id="csvFileInput"
              className="file-input"
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <label htmlFor="csvFileInput" className="btn btn-secondary">
              <i className="fas fa-upload"></i> Upload CSV
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="description-section">
            <p className="description">
              <i className="fas fa-info-circle"></i>
              Below is the current inventory of network devices available
              for sale. The data is automatically loaded and updated in
              real-time.
            </p>
          </div>

          {/* Filter Input */}
          {!loading && !error && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Filter table..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                className="btn"
                style={{ width: '100%', maxWidth: 400 }}
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loader">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading network devices...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <div className="error-content">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Failed to Load Data</h3>
                <p>{error}</p>
                <button onClick={loadCSV} className="btn btn-primary">
                  <i className="fas fa-redo"></i> Try Again
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        onClick={() => handleSort(i)}
                        style={{ cursor: 'pointer' }}
                      >
                        {header}
                        {sortColumn === i &&
                          (sortDirection === 'asc' ? ' 🔼' : ' 🔽')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
