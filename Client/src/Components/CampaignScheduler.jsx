import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const CampaignScheduler = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [schedulePatterns, setSchedulePatterns] = useState({});
  const [customPattern, setCustomPattern] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [patternCategory, setPatternCategory] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchSchedulePatterns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('http://localhost:5000/get_campaigns');
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchSchedulePatterns = async () => {
    try {
      const response = await fetch('http://localhost:5000/schedule-patterns');
      const data = await response.json();
      if (data.success) {
        setSchedulePatterns(data.patterns);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    }
  };

  const validatePattern = async (pattern) => {
    if (!pattern.trim()) {
      setValidationResult(null);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/validate-cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern })
      });
      const data = await response.json();
      setValidationResult(data);
    } catch (error) {
      setValidationResult({ success: false, error: error.message });
    }
  };

  const handleScheduleCampaign = async (campaignId, pattern) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/campaigns/${campaignId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedulePattern: pattern })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Campaign scheduled successfully!');
        fetchCampaigns();
        setSelectedCampaign(null);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error scheduling campaign: ${error.message}`);
    }
    setLoading(false);
  };

  const handleUnscheduleCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/campaigns/${campaignId}/schedule`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Campaign unscheduled successfully!');
        fetchCampaigns();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error unscheduling campaign: ${error.message}`);
    }
    setLoading(false);
  };

  const handleExecuteNow = async (campaignId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/campaigns/${campaignId}/execute-now`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Campaign execution triggered!');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert(`Error executing campaign: ${error.message}`);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600';
      case 'sending': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'sending': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Campaign Scheduler</h1>
        </div>

        {/* Campaign List */}
        <div className="mb-8">
          {/* Campaigns Table */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">All Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold">Campaign</th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold">Status</th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold">Schedule</th>
                    <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2">
                        <div>
                          <div className="font-medium text-sm">{campaign.campaign_name || `Campaign ${campaign.id}`}</div>
                          <div className="text-xs text-gray-500">{campaign.subject_line}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <div className={`flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          <span className="text-sm capitalize">{campaign.status}</span>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        {campaign.is_scheduled ? (
                          <div className="text-xs">
                            <div className="font-mono bg-gray-100 px-2 py-1 rounded">{campaign.schedule_pattern}</div>
                            {campaign.execution_count > 0 && (
                              <div className="text-gray-500 mt-1">Executed: {campaign.execution_count} times</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not scheduled</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-2">
                        <div className="flex gap-1">
                          {campaign.is_scheduled ? (
                            <>
                              <button
                                onClick={() => handleUnscheduleCampaign(campaign.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                disabled={loading}
                              >
                                <Pause className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleExecuteNow(campaign.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                disabled={loading}
                              >
                                <Play className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedCampaign(campaign)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            >
                              <Settings className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule Configuration */}
          
        </div>
        <div>
            {selectedCampaign ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Schedule: {selectedCampaign.campaign_name || `Campaign ${selectedCampaign.id}`}
                </h3>

                {/* Pattern Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Type
                  </label>
                  <select
                    value={patternCategory}
                    onChange={(e) => {
                      setPatternCategory(e.target.value);
                      setSelectedPattern('');
                      setCustomPattern('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="testing">Testing</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom Pattern</option>
                  </select>
                </div>

                {/* Predefined Patterns */}
                {patternCategory !== 'custom' && schedulePatterns[patternCategory] && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Pattern
                    </label>
                    <select
                      value={selectedPattern}
                      onChange={(e) => setSelectedPattern(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a pattern...</option>
                      {Object.entries(schedulePatterns[patternCategory]).map(([name, pattern]) => (
                        <option key={name} value={pattern}>
                          {name} ({pattern})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Pattern Input */}
                {patternCategory === 'custom' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Cron Pattern
                    </label>
                    <input
                      type="text"
                      value={customPattern}
                      onChange={(e) => {
                        setCustomPattern(e.target.value);
                        validatePattern(e.target.value);
                      }}
                      placeholder="* * * * * (minute hour day month dayOfWeek)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Format: minute hour day month dayOfWeek
                      <br />
                      Example: "0 9 * * *" = Every day at 9:00 AM
                    </div>
                  </div>
                )}

                {/* Pattern Validation */}
                {validationResult && (
                  <div className={`mb-4 p-3 rounded-md ${
                    validationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`flex items-center gap-2 ${
                      validationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validationResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {validationResult.success ? 'Valid pattern' : 'Invalid pattern'}
                      </span>
                    </div>
                    {validationResult.error && (
                      <div className="text-red-600 text-xs mt-1">{validationResult.error}</div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const pattern = patternCategory === 'custom' ? customPattern : selectedPattern;
                      if (pattern) {
                        handleScheduleCampaign(selectedCampaign.id, pattern);
                      }
                    }}
                    disabled={loading || !(patternCategory === 'custom' ? customPattern : selectedPattern)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Campaign'}
                  </button>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Campaign Selected</h3>
                <p className="text-gray-500 text-sm">
                  Select a campaign from the list to configure its schedule.
                </p>
              </div>
            )}
          </div>

        {/* Schedule Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Schedule Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Common Patterns:</h4>
              <ul className="space-y-1 text-blue-600">
                <li><code>0 9 * * *</code> - Every day at 9:00 AM</li>
                <li><code>0 */2 * * *</code> - Every 2 hours</li>
                <li><code>0 9 * * 1</code> - Every Monday at 9:00 AM</li>
                <li><code>0 18 1 * *</code> - 1st of every month at 6:00 PM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Format:</h4>
              <div className="text-blue-600">
                <div><strong>minute hour day month dayOfWeek</strong></div>
                <div className="mt-2 text-xs">
                  • minute: 0-59<br/>
                  • hour: 0-23<br/>
                  • day: 1-31<br/>
                  • month: 1-12<br/>
                  • dayOfWeek: 0-7 (0 or 7 = Sunday)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Campaigns Summary */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Scheduled Campaigns Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {campaigns.filter(c => c.is_scheduled).length}
              </div>
              <div className="text-sm text-blue-600">Active Schedules</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {campaigns.reduce((sum, c) => sum + (c.execution_count || 0), 0)}
              </div>
              <div className="text-sm text-green-600">Total Executions</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {campaigns.filter(c => c.status === 'sending').length}
              </div>
              <div className="text-sm text-orange-600">Currently Sending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignScheduler;