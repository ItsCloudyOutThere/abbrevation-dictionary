import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, ExternalLink, X, Lock, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';

export default function AbbreviationDictionary() {
  const [abbreviations, setAbbreviations] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ abbr: '', description: '', link: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);

  const ADMIN_PASSWORD = 'admin123'; // Change this to your preferred password

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load approved abbreviations
      const approvedResponse = await fetch('/api/abbreviations');
      const approvedData = await approvedResponse.json();
      
      if (approvedData && Array.isArray(approvedData)) {
        setAbbreviations(approvedData);
      } else {
        // Set initial sample data
        const sampleData = [
          { id: 1, abbr: 'API', description: 'Application Programming Interface', link: 'https://en.wikipedia.org/wiki/API', status: 'approved' },
          { id: 2, abbr: 'HTML', description: 'HyperText Markup Language', link: 'https://developer.mozilla.org/en-US/docs/Web/HTML', status: 'approved' },
          { id: 3, abbr: 'CSS', description: 'Cascading Style Sheets', link: '', status: 'approved' },
        ];
        setAbbreviations(sampleData);
        await fetch('/api/abbreviations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ abbreviations: sampleData }),
        });
      }

      // Load pending submissions
      const pendingResponse = await fetch('/api/pending');
      const pendingData = await pendingResponse.json();
      
      if (pendingData && Array.isArray(pendingData)) {
        setPendingSubmissions(pendingData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to sample data
      setAbbreviations([
        { id: 1, abbr: 'API', description: 'Application Programming Interface', link: 'https://en.wikipedia.org/wiki/API', status: 'approved' },
        { id: 2, abbr: 'HTML', description: 'HyperText Markup Language', link: 'https://developer.mozilla.org/en-US/docs/Web/HTML', status: 'approved' },
        { id: 3, abbr: 'CSS', description: 'Cascading Style Sheets', link: '', status: 'approved' },
      ]);
    }
    setLoading(false);
  };

  const saveAbbreviations = async (newAbbreviations) => {
    try {
      const response = await fetch('/api/abbreviations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abbreviations: newAbbreviations }),
      });
      
      if (response.ok) {
        setAbbreviations(newAbbreviations);
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Error saving abbreviations:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const savePendingSubmissions = async (newPending) => {
    try {
      const response = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pending: newPending }),
      });
      
      if (response.ok) {
        setPendingSubmissions(newPending);
      } else {
        alert('Failed to save pending submissions. Please try again.');
      }
    } catch (error) {
      console.error('Error saving pending submissions:', error);
      alert('Failed to save pending submissions. Please try again.');
    }
  };

  const filteredAbbreviations = abbreviations.filter(item =>
    item.abbr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      setPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ abbr: item.abbr, description: item.description, link: item.link });
    } else {
      setEditingId(null);
      setFormData({ abbr: '', description: '', link: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ abbr: '', description: '', link: '' });
  };

  const openSubmitModal = () => {
    setFormData({ abbr: '', description: '', link: '' });
    setIsSubmitModalOpen(true);
    setSubmitSuccess(false);
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
    setFormData({ abbr: '', description: '', link: '' });
    setSubmitSuccess(false);
  };

  const handleSubmit = () => {
    if (!formData.abbr || !formData.description) return;
    
    let newAbbreviations;
    if (editingId) {
      newAbbreviations = abbreviations.map(item =>
        item.id === editingId ? { ...item, ...formData } : item
      );
    } else {
      newAbbreviations = [...abbreviations, { ...formData, id: Date.now(), status: 'approved' }];
    }
    
    saveAbbreviations(newAbbreviations);
    closeModal();
  };

  const handleUserSubmit = () => {
    if (!formData.abbr || !formData.description) return;
    
    const newSubmission = {
      ...formData,
      id: Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    
    const newPending = [...pendingSubmissions, newSubmission];
    savePendingSubmissions(newPending);
    setSubmitSuccess(true);
    
    setTimeout(() => {
      closeSubmitModal();
    }, 2000);
  };

  const handleApprove = async (submission) => {
    const approvedItem = { ...submission, status: 'approved' };
    const newAbbreviations = [...abbreviations, approvedItem];
    const newPending = pendingSubmissions.filter(item => item.id !== submission.id);
    
    await saveAbbreviations(newAbbreviations);
    await savePendingSubmissions(newPending);
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this submission?')) {
      const newPending = pendingSubmissions.filter(item => item.id !== id);
      await savePendingSubmissions(newPending);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this abbreviation?')) {
      const newAbbreviations = abbreviations.filter(item => item.id !== id);
      await saveAbbreviations(newAbbreviations);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    
    const lines = importText.split('\n').filter(line => line.trim());
    const imported = [];
    const errors = [];
    
    lines.forEach((line, index) => {
      const parts = line.split('-').map(part => part.trim());
      if (parts.length >= 2) {
        const abbr = parts[0];
        const description = parts.slice(1).join('-').trim();
        
        if (abbr && description) {
          imported.push({
            id: Date.now() + index,
            abbr,
            description,
            link: '',
            status: 'approved'
          });
        } else {
          errors.push(`Line ${index + 1}: Invalid format`);
        }
      } else {
        errors.push(`Line ${index + 1}: Missing "-" separator`);
      }
    });
    
    if (imported.length > 0) {
      const newAbbreviations = [...abbreviations, ...imported];
      saveAbbreviations(newAbbreviations);
      setImportResult({
        success: imported.length,
        errors: errors.length,
        errorDetails: errors
      });
      
      if (errors.length === 0) {
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportText('');
          setImportResult(null);
        }, 2000);
      }
    } else {
      setImportResult({
        success: 0,
        errors: errors.length,
        errorDetails: errors
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading abbreviations...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Abbreviation Dictionary</h1>
            {!isAdmin ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-gray-500 hover:text-gray-700 transition p-2"
                title="Admin Login"
              >
                <Lock className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800 transition px-3 py-1 border border-gray-300 rounded"
              >
                Logout
              </button>
            )}
          </div>
          
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search abbreviations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isAdmin ? (
              <>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition whitespace-nowrap"
                >
                  <Upload className="w-5 h-5" />
                  Import
                </button>
                <button
                  onClick={() => openModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
              </>
            ) : (
              <button
                onClick={openSubmitModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
              >
                <Plus className="w-5 h-5" />
                Submit
              </button>
            )}
          </div>

          {/* Pending Submissions (Admin Only) */}
          {isAdmin && pendingSubmissions.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h2 className="font-semibold text-gray-800">
                  Pending Submissions ({pendingSubmissions.length})
                </h2>
              </div>
              <div className="space-y-2">
                {pendingSubmissions.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-bold text-blue-600">{item.abbr}</span>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-600 transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(item.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleApprove(item)}
                          className="text-green-600 hover:text-green-700 transition p-1"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-700 transition p-1"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Abbreviations */}
          <div className="space-y-3">
            {filteredAbbreviations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No abbreviations found</p>
            ) : (
              filteredAbbreviations.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold text-blue-600">{item.abbr}</span>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-600 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openModal(item)}
                          className="text-gray-500 hover:text-blue-600 transition p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-500 hover:text-red-600 transition p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Edit Abbreviation' : 'Add Abbreviation'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abbreviation *
                </label>
                <input
                  type="text"
                  value={formData.abbr}
                  onChange={(e) => setFormData({ ...formData, abbr: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., API"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Full meaning or description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.abbr || !formData.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Submit Abbreviation</h2>
              <button onClick={closeSubmitModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {submitSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Submission Received!
                </p>
                <p className="text-gray-600">
                  Your abbreviation is pending approval and will appear soon.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Abbreviation *
                    </label>
                    <input
                      type="text"
                      value={formData.abbr}
                      onChange={(e) => setFormData({ ...formData, abbr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., API"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="3"
                      placeholder="Full meaning or description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      External Link (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeSubmitModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUserSubmit}
                    disabled={!formData.abbr || !formData.description}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin password"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Import Abbreviations</h2>
              <button onClick={() => {
                setIsImportModalOpen(false);
                setImportText('');
                setImportResult(null);
              }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Format:</strong> Each line should be: <code className="bg-white px-2 py-1 rounded">ABBR - Explanation</code>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Example: <code className="bg-white px-2 py-1 rounded">API - Application Programming Interface</code>
              </p>
            </div>
            
            {importResult && (
              <div className={`mb-4 p-3 rounded-lg ${importResult.errors === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className="text-sm font-semibold text-gray-800">
                  ✓ Successfully imported: {importResult.success} abbreviations
                </p>
                {importResult.errors > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">⚠ Errors: {importResult.errors}</p>
                    <ul className="text-xs text-gray-600 mt-1 ml-4 list-disc">
                      {importResult.errorDetails.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paste your abbreviations (one per line)
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows="10"
                  placeholder="API - Application Programming Interface&#10;HTML - HyperText Markup Language&#10;CSS - Cascading Style Sheets"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportText('');
                  setImportResult(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}