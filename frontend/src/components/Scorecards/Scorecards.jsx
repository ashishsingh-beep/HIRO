import React, { useState, useEffect } from 'react';
import { supabase } from '../../api/supabase';

const Scorecards = () => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScorecards();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('scorecards-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_entries'
        },
        () => fetchScorecards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchScorecards = async () => {
    const { data: entries, error } = await supabase.from('daily_entries').select('*, profiles(name)');
    if (error || !entries) return;
    
    const stats = {};
    entries.forEach(e => {
      const id = e.user_id;
      if (!stats[id]) {
        stats[id] = { name: e.profiles?.name || 'Unknown', resumes: 0, shortlisted: 0, interviews: 0, offers: 0, closures: 0 };
      }
      stats[id].resumes += e.resumes;
      stats[id].shortlisted += e.shortlisted;
      stats[id].interviews += e.interviews_completed;
      stats[id].offers += e.offers;
      stats[id].closures += e.closures;
    });
    
    const scorecardData = Object.keys(stats).map(id => {
      const s = stats[id];
      const score = (s.resumes * 0.2) + (s.shortlisted * 0.4) + (s.interviews * 1.5) + (s.offers * 3) + (s.closures * 5);
      return { ...s, score: Math.round(score * 10) / 10 };
    }).sort((a, b) => b.score - a.score);
    
    setScorecards(scorecardData);
    setLoading(false);
  };

  if (loading) return <p>Loading scorecards...</p>;

  return (
    <div className="section-view">
      <div className="header-with-actions">
        <h2>Recruiter Scorecards</h2>
        <div className="info-badge">
          <span className="material-icons-round">info</span>
          Weights: Resumes 20%, Shortlist 20%, Int. 20%, Offers 20%, Closures 20%
        </div>
      </div>
      
      <div className="scorecards-grid">
        {scorecards.map((s, index) => {
          const rankColor = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'standard';
          
          return (
            <div key={index} className={`score-card-premium ${rankColor}`}>
              <div className="card-rank">#{index + 1}</div>
              <div className="card-main">
                <div className="user-section">
                  <div className="avatar-large">{s.name.charAt(0)}</div>
                  <div className="user-meta">
                    <h4>{s.name}</h4>
                    <span className="role-tag">Recruiter</span>
                  </div>
                </div>
                <div className="score-summary">
                  <div className="score-value">{s.score}</div>
                  <div className="score-label">PROD. SCORE</div>
                </div>
              </div>

              <div className="performance-metrics">
                <div className="perf-item">
                  <span className="material-icons-round">description</span>
                  <div className="perf-info">
                    <span className="p-val">{s.resumes}</span>
                    <span className="p-lbl">Resumes</span>
                  </div>
                </div>
                <div className="perf-item">
                  <span className="material-icons-round">people</span>
                  <div className="perf-info">
                    <span className="p-val">{s.interviews}</span>
                    <span className="p-lbl">Interviews</span>
                  </div>
                </div>
                <div className="perf-item">
                  <span className="material-icons-round">check_circle</span>
                  <div className="perf-info">
                    <span className="p-val success-text">{s.closures}</span>
                    <span className="p-lbl">Closures</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="efficiency-bar">
                  <div className="fill" style={{ width: `${Math.min(s.score, 100)}%` }}></div>
                </div>
                <div className="footer-meta">
                  <span>Efficiency Ratio</span>
                  <span>{Math.round((s.closures / (s.resumes || 1)) * 100)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatItem = ({ label, val, success }) => (
  <div className="stat-item">
    <span className="stat-label">{label}</span>
    <span className={`stat-val ${success ? 'text-success' : ''}`}>{val}</span>
  </div>
);

export default Scorecards;
