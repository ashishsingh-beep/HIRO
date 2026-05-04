import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../api/supabase';
import { API_ROUTES } from '../../api/config';

const EntryForm = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    position: '',
    role_type: '',
    resumes: 0,
    shortlisted: 0,
    interviews_scheduled: 0,
    interviews_completed: 0,
    offers: 0,
    closures: 0
  });

  const [positions, setPositions] = useState([]);
  const [isOtherPosition, setIsOtherPosition] = useState(false);
  const [customPosition, setCustomPosition] = useState('');
  
  const [isOtherVertical, setIsOtherVertical] = useState(false);
  const [customVertical, setCustomVertical] = useState('');
  
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Default static positions to ensure they always appear
  const staticPositions = [
    "PPC Expert",
    "SEO Specialist",
    "Sales Executive",
    "Business Development",
    "IT Support",
    "Software Developer"
  ];

  useEffect(() => {
    fetchRecentEntries();
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
        const response = await fetch(API_ROUTES.POSITIONS);
        const data = await response.json();
        // Merge static with database positions, filter duplicates
        const dynamicPositions = Array.isArray(data) ? data.map(p => p.name) : [];
        const combined = Array.from(new Set([...staticPositions, ...dynamicPositions]));
        setPositions(combined);
    } catch (error) {
        console.error('Error fetching positions:', error);
        setPositions(staticPositions);
    }
  };

  const fetchRecentEntries = async () => {
    if (!currentUser?.id) return;
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('entry_date', todayStr)
          .order('created_at', { ascending: false });
        setRecentEntries(data || []);
        setCurrentPage(1);
    } catch (error) {
        console.error('Error fetching entries:', error);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'entry-position') {
      if (value === 'OTHER') {
        setIsOtherPosition(true);
        setFormData(prev => ({ ...prev, position: '' }));
      } else {
        setIsOtherPosition(false);
        setFormData(prev => ({ ...prev, position: value }));
      }
      return;
    }

    if (id === 'entry-role-type') {
      if (value === 'OTHER') {
        setIsOtherVertical(true);
        setFormData(prev => ({ ...prev, role_type: '' }));
      } else {
        setIsOtherVertical(false);
        setFormData(prev => ({ ...prev, role_type: value }));
      }
      return;
    }

    const field = id.replace('entry-', '').replace(/-/g, '_');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const token = localStorage.getItem('hiro_token');
    if (!token) {
      toast.error('Session Expired: Please login again.');
      setLoading(false);
      return;
    }

    let finalPosition = formData.position;
    let finalVertical = formData.role_type;

    try {
      if (isOtherVertical) {
        if (!customVertical.trim()) {
          toast.error('Please enter vertical name.');
          throw new Error('Please enter vertical name.');
        }
        finalVertical = customVertical;
      }

      if (isOtherPosition) {
        if (!customPosition.trim()) {
          toast.error('Please enter position name.');
          throw new Error('Please enter position name.');
        }
        const posResponse = await fetch(API_ROUTES.POSITIONS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: customPosition, department: finalVertical })
        });
        const posData = await posResponse.json();
        finalPosition = customPosition;
      }

      if (!finalPosition || !finalVertical) {
        toast.error('Please specify both Position and Vertical.');
        throw new Error('Please specify both Position and Vertical.');
      }

      const response = await fetch(API_ROUTES.ENTRIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          position: finalPosition,
          role_type: finalVertical,
          entry_date: new Date().toISOString().split('T')[0]
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit');

      toast.success('Daily report published!');
      
      setFormData({
        position: '', role_type: '', resumes: 0, shortlisted: 0,
        interviews_scheduled: 0, interviews_completed: 0, offers: 0, closures: 0
      });
      setIsOtherPosition(false);
      setCustomPosition('');
      setIsOtherVertical(false);
      setCustomVertical('');
      fetchRecentEntries();
      fetchPositions(); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(recentEntries.length / itemsPerPage);
  const currentItems = recentEntries.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className="section-view">
      <div className="entry-header-creative">
        <div className="header-text">
          <h2>Submit Daily Activity</h2>
          <p>Track your wins, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="daily-progress-widget">
           <div className="progress-circle">
             <span className="p-text">
               {Math.min(Object.values(formData).filter(v => typeof v === 'number').reduce((a,b) => a+b,0), 100)}%
             </span>
             <span className="p-lbl">Activity</span>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="creative-form">
        <div className="card form-hero-card">
          <div className="form-row">
            <div className="form-group half">
              <label>Current Assignment</label>
              <div className="select-wrapper">
                <span className="material-icons-round">work_outline</span>
                <select id="entry-position" value={isOtherPosition ? 'OTHER' : (formData.position || '')} onChange={handleChange} required>
                  <option value="" disabled>Select Position</option>
                  {(Array.isArray(positions) ? positions : []).map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                  ))}
                  <option value="OTHER">+ Other Position...</option>
                </select>
              </div>
              
              {isOtherPosition && (
                  <div className="mt-4 animate-pop">
                    <div className="select-wrapper">
                        <span className="material-icons-round">edit_note</span>
                        <input 
                            type="text" 
                            placeholder="Specify Position Name..." 
                            className="form-input"
                            value={customPosition}
                            onChange={(e) => setCustomPosition(e.target.value)}
                            required
                        />
                    </div>
                  </div>
              )}
            </div>

            <div className="form-group half">
              <label>Vertical</label>
              <div className="select-wrapper">
                <span className="material-icons-round">category</span>
                <select id="entry-role-type" value={isOtherVertical ? 'OTHER' : (formData.role_type || '')} onChange={handleChange} required>
                  <option value="" disabled>Select Vertical</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="IT">IT</option>
                  <option value="Sales">Sales</option>
                  <option value="OTHER">+ Other Vertical...</option>
                </select>
              </div>

              {isOtherVertical && (
                  <div className="mt-4 animate-pop">
                    <div className="select-wrapper">
                        <span className="material-icons-round">account_tree</span>
                        <input 
                            type="text" 
                            placeholder="Specify Vertical Name..." 
                            className="form-input"
                            value={customVertical}
                            onChange={(e) => setCustomVertical(e.target.value)}
                            required
                        />
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="metrics-creative-grid">
          <MetricCounter id="resumes" label="Resumes" icon="description" color="blue" value={formData.resumes} onChange={setFormData} />
          <MetricCounter id="shortlisted" label="Shortlisted" icon="fact_check" color="yellow" value={formData.shortlisted} onChange={setFormData} />
          <MetricCounter id="interviews_scheduled" label="Scheduled" icon="event" color="purple" value={formData.interviews_scheduled} onChange={setFormData} />
          <MetricCounter id="interviews_completed" label="Conducted" icon="groups" color="purple" value={formData.interviews_completed} onChange={setFormData} />
          <MetricCounter id="offers" label="Offers" icon="card_membership" color="green" value={formData.offers} onChange={setFormData} />
          <MetricCounter id="closures" label="Closures" icon="verified" color="green" value={formData.closures} onChange={setFormData} />
        </div>

        <div className="form-submit-area">
          <button type="submit" className="btn btn-primary btn-xl" disabled={loading}>
            <span className="material-icons-round">{loading ? 'sync' : 'auto_graph'}</span>
            {loading ? 'Processing...' : 'Publish Daily Report'}
          </button>
        </div>
      </form>

      <div className="card recent-entries-card mt-4">
        <h3>Today's Activity Log</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
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
              {currentItems.map((e, i) => (
                <tr key={e.id || i}>
                  <td>{e.entry_date}</td>
                  <td><strong>{e.position}</strong></td>
                  <td>{e.role_type}</td>
                  <td>{e.resumes}</td>
                  <td>{e.shortlisted}</td>
                  <td>{e.interviews_completed}</td>
                  <td>{e.offers}</td>
                  <td><span className="text-success font-bold">{e.closures}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const MetricCounter = ({ id, label, icon, color, value, onChange }) => {
  const increment = () => onChange(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const decrement = () => onChange(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  return (
    <div className={`metric-counter-card ${color}`}>
      <div className="counter-icon"><span className="material-icons-round">{icon}</span></div>
      <div className="counter-body">
        <span className="counter-label">{label}</span>
        <div className="counter-controls">
          <button type="button" className="ctrl-btn" onClick={decrement}>remove</button>
          <span className="counter-value">{value || 0}</span>
          <button type="button" className="ctrl-btn" onClick={increment}>add</button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
