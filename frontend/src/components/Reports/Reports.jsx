import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

const Reports = () => {
    const [filter, setFilter] = useState({ timeframe: 'month', position: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    useEffect(() => {
        fetchReportData();
    }, [filter]);

    const fetchReportData = async () => {
        setLoading(true);
        let query = supabase.from('daily_entries').select('*, profiles(name)');
        
        if (filter.position !== 'all') {
            query = query.eq('position', filter.position);
        }

        const { data, error } = await query;
        if (!error && data) {
            setEntries(data);
            setCurrentPage(1); // Reset to first page when data changes
        }
        setLoading(false);
    };

    const filteredEntries = entries.filter(e => 
        e.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);

    const exportCSV = () => {
        const headers = ["Date", "Recruiter", "Position", "Role Type", "Resumes", "Shortlisted", "Interviews", "Offers", "Closures"];
        const rows = filteredEntries.map(e => [
            e.entry_date,
            e.profiles?.name || 'Unknown',
            e.position,
            e.role_type,
            e.resumes,
            e.shortlisted,
            e.interviews_completed,
            e.offers,
            e.closures
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `HIRO_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="section-view">
            <div className="filters-bar no-print">
                <div className="filter-group">
                    <label>Timeframe</label>
                    <select value={filter.timeframe} onChange={(e) => setFilter({ ...filter, timeframe: e.target.value })}>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Position</label>
                    <select value={filter.position} onChange={(e) => setFilter({ ...filter, position: e.target.value })}>
                        <option value="all">All Positions</option>
                        <option value="PPC">PPC</option>
                        <option value="SEO">SEO</option>
                        <option value="Sales">Sales</option>
                        <option value="BDE">BDE</option>
                        <option value="IT">IT Support</option>
                    </select>
                </div>
                <div className="filter-group search-filter">
                    <label>Search</label>
                    <div className="search-box">
                        <span className="material-icons-round">search</span>
                        <input 
                            type="text" 
                            placeholder="Search name, job..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to page 1 on search
                            }}
                        />
                    </div>
                </div>
                <div className="export-actions">
                    <button className="btn btn-outline" onClick={exportCSV}>
                        <span className="material-icons-round">table_view</span> Export CSV
                    </button>
                    <button className="btn btn-outline" onClick={() => window.print()}>
                        <span className="material-icons-round">picture_as_pdf</span> Print / PDF
                    </button>
                </div>
            </div>

            <div className="card mt-4 report-printable">
                <div className="section-header">
                    <h3>Recruitment Performance Report</h3>
                    <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Recruiter</th>
                                <th>Position</th>
                                <th>Resumes</th>
                                <th>Shortlisted</th>
                                <th>Interviews</th>
                                <th>Offers</th>
                                <th>Closures</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((e, i) => (
                                    <tr key={i}>
                                        <td>{e.entry_date}</td>
                                        <td><strong>{e.profiles?.name || 'Unknown'}</strong></td>
                                        <td>{e.position}</td>
                                        <td>{e.resumes}</td>
                                        <td>{e.shortlisted}</td>
                                        <td>{e.interviews_completed}</td>
                                        <td>{e.offers}</td>
                                        <td><span className="text-success font-bold">{e.closures}</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="text-center">{loading ? 'Loading data...' : 'No data found for the selected filters.'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pagination-bar no-print">
                        <div className="page-info">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEntries.length)} of {filteredEntries.length} records
                        </div>
                        <div className="pagination-controls">
                            <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <span className="material-icons-round">chevron_left</span> Previous
                            </button>
                            <span className="page-numbers">Page <strong>{currentPage}</strong> of {totalPages}</span>
                            <button 
                                className="btn btn-outline btn-sm" 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next <span className="material-icons-round">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    .no-print, .sidebar, .topbar { display: none !important; }
                    .main-content { margin-left: 0 !important; padding: 0 !important; }
                    .card { box-shadow: none !important; border: 1px solid #eee !important; }
                    .report-printable { width: 100% !important; }
                    .pagination-bar { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Reports;
