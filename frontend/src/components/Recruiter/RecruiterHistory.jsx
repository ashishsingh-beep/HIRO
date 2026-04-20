import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

const RecruiterHistory = ({ currentUser }) => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ resumes: 0, interviews: 0, closures: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        if (currentUser) {
            fetchMyData();
        }
    }, [currentUser, currentPage]);

    const fetchMyData = async () => {
        setLoading(true);
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('daily_entries')
            .select('*', { count: 'exact' })
            .eq('user_id', currentUser.id)
            .order('entry_date', { ascending: false })
            .range(from, to);

        if (!error && data) {
            setEntries(data);
            setTotalCount(count || 0);
            
            // Note: Stats should ideally be fetched separately for the full lifetime, 
            // but for simplicity here I'll fetch them once or keep them global.
            // Let's do a quick separate query for life totals to keep them accurate across pages.
            const { data: allData } = await supabase
                .from('daily_entries')
                .select('resumes, interviews_completed, closures')
                .eq('user_id', currentUser.id);
            
            if (allData) {
                const totals = allData.reduce((acc, curr) => ({
                    resumes: acc.resumes + curr.resumes,
                    interviews: acc.interviews + curr.interviews_completed,
                    closures: acc.closures + curr.closures
                }), { resumes: 0, interviews: 0, closures: 0 });
                setStats(totals);
            }
        }
        setLoading(false);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="section-view">
            <div className="entry-header-creative">
                <div className="header-text">
                    <h2>My Activity Log</h2>
                    <p>Track your personal recruitment journey and milestones.</p>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon blue"><span className="material-icons-round">description</span></div>
                    <div className="kpi-info">
                        <h3>Lifetime Resumes</h3>
                        <div className="kpi-value">{stats.resumes}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon purple"><span className="material-icons-round">groups</span></div>
                    <div className="kpi-info">
                        <h3>Total Interviews</h3>
                        <div className="kpi-value">{stats.interviews}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon green"><span className="material-icons-round">verified</span></div>
                    <div className="kpi-info">
                        <h3>Total Closures</h3>
                        <div className="kpi-value">{stats.closures}</div>
                    </div>
                </div>
            </div>

            <div className="card mt-4">
                <div className="section-header">
                    <h3>All Submissions</h3>
                    <p>Detailed breakdown of your daily reports</p>
                </div>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Recruiter</th>
                                <th>Position</th>
                                <th>Vertical</th>
                                <th>Resumes</th>
                                <th>Shortlisted</th>
                                <th>Interviews</th>
                                <th>Offers</th>
                                <th>Closures</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length > 0 ? (
                                entries.map((e, i) => (
                                    <tr key={i}>
                                        <td>{e.entry_date}</td>
                                        <td>{currentUser.name}</td>
                                        <td><strong>{e.position}</strong></td>
                                        <td>{e.role_type}</td>
                                        <td>{e.resumes}</td>
                                        <td>{e.shortlisted}</td>
                                        <td>{e.interviews_completed}</td>
                                        <td>{e.offers}</td>
                                        <td><span className="text-success font-bold">{e.closures}</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center">{loading ? 'Loading history...' : 'No entries found. Start by submitting a daily report!'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                  <div className="pagination-bar">
                      <button 
                          type="button"
                          className="btn btn-outline btn-sm" 
                          disabled={currentPage === 1} 
                          onClick={() => setCurrentPage(p => p - 1)}
                      >
                          <span className="material-icons-round">chevron_left</span> Previous
                      </button>
                      
                      <div className="page-info">
                          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                      </div>

                      <button 
                          type="button"
                          className="btn btn-outline btn-sm" 
                          disabled={currentPage === totalPages} 
                          onClick={() => setCurrentPage(p => p + 1)}
                      >
                          Next <span className="material-icons-round">chevron_right</span>
                      </button>
                  </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterHistory;
