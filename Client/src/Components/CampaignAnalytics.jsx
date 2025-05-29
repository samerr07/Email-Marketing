import React, { useState } from 'react';
import { 
  Eye, Edit, Trash2, Plus, Search, Filter, ArrowLeft, 
  Mail, Users, MousePointer, TrendingUp, Calendar,
  BarChart3, PieChart, Activity, Download
} from 'lucide-react';
import { toast } from 'react-toastify';

const CampaignAnalytics = ({campaigns}) => {
  const [activeView, setActiveView] = useState('list'); // 'list' or 'analytics'
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Sample campaigns data
  // const campaigns = [
  //   {
  //     id: 1,
  //     name: "Summer Sale 2024",
  //     status: "Active",
  //     sent: 15420,
  //     opened: 9252,
  //     clicked: 1851,
  //     date: "2024-05-20",
  //     subject: "🌞 Summer Sale: Up to 50% Off Everything!",
  //     bounced: 234,
  //     unsubscribed: 45,
  //     complaints: 2,
  //     revenue: 45680,
  //     topLinks: [
  //       { url: "https://example.com/summer-sale", clicks: 892 },
  //       { url: "https://example.com/products/swimwear", clicks: 445 },
  //       { url: "https://example.com/products/sandals", clicks: 314 }
  //     ],
  //     deviceStats: {
  //       desktop: 45,
  //       mobile: 38,
  //       tablet: 17
  //     },
  //     timeStats: [
  //       { hour: '6AM', opens: 120 },
  //       { hour: '9AM', opens: 450 },
  //       { hour: '12PM', opens: 680 },
  //       { hour: '3PM', opens: 520 },
  //       { hour: '6PM', opens: 890 },
  //       { hour: '9PM', opens: 340 }
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: "Product Launch - New Collection",
  //     status: "Completed",
  //     sent: 8750,
  //     opened: 4200,
  //     clicked: 840,
  //     date: "2024-05-15",
  //     subject: "Introducing Our New Collection",
  //     bounced: 87,
  //     unsubscribed: 23,
  //     complaints: 1,
  //     revenue: 28450,
  //     topLinks: [
  //       { url: "https://example.com/new-collection", clicks: 523 },
  //       { url: "https://example.com/lookbook", clicks: 201 },
  //       { url: "https://example.com/about", clicks: 116 }
  //     ],
  //     deviceStats: {
  //       desktop: 52,
  //       mobile: 35,
  //       tablet: 13
  //     },
  //     timeStats: [
  //       { hour: '6AM', opens: 80 },
  //       { hour: '9AM', opens: 320 },
  //       { hour: '12PM', opens: 420 },
  //       { hour: '3PM', opens: 380 },
  //       { hour: '6PM', opens: 650 },
  //       { hour: '9PM', opens: 280 }
  //     ]
  //   },
  //   {
  //     id: 3,
  //     name: "Weekly Newsletter #24",
  //     status: "Draft",
  //     sent: 0,
  //     opened: 0,
  //     clicked: 0,
  //     date: "2024-05-24",
  //     subject: "This Week's Top Stories",
  //     bounced: 0,
  //     unsubscribed: 0,
  //     complaints: 0,
  //     revenue: 0,
  //     topLinks: [],
  //     deviceStats: {
  //       desktop: 0,
  //       mobile: 0,
  //       tablet: 0
  //     },
  //     timeStats: []
  //   }
  // ];

  const deleteCampaign = async (id) => {
      try {
          const response = await fetch(`http://localhost:5000/campaigns/${id}`, {
              method: 'DELETE'
          });
          const result = await response.json();
  
          if (result.success) {
              toast.success('Campaign deleted successfully!', { duration: 2000 });
              fetchCampaigns();
          } else {
              throw new Error(result.message);
          }
      } catch (error) {
          console.error('Error deleting campaign:', error);
          throw error;
      }
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveView('analytics');
  };

   const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 rounded-md bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const CampaignsContent = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    {campaign.campaign_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">154</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    60%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   14%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(campaign.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleCampaignClick(campaign)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={()=>deleteCampaign(campaign.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AnalyticsContent = () => {
    if (!selectedCampaign) return null;

    const openRate = selectedCampaign.sent > 0 ? ((selectedCampaign.opened / selectedCampaign.sent) * 100).toFixed(1) : 0;
    const clickRate = selectedCampaign.sent > 0 ? ((selectedCampaign.clicked / selectedCampaign.sent) * 100).toFixed(1) : 0;
    const bounceRate = selectedCampaign.sent > 0 ? ((selectedCampaign.bounced / selectedCampaign.sent) * 100).toFixed(1) : 0;
    const unsubRate = selectedCampaign.sent > 0 ? ((selectedCampaign.unsubscribed / selectedCampaign.sent) * 100).toFixed(1) : 0;

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => setActiveView('list')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h2>
              <p className="text-sm text-gray-600">{selectedCampaign.subject}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              selectedCampaign.status === 'Active' ? 'bg-green-100 text-green-800' :
              selectedCampaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {selectedCampaign.status}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Mail}
            title="Emails Sent"
            value={selectedCampaign.sent.toLocaleString()}
            subtitle={`Sent on ${selectedCampaign.date}`}
            color="blue"
          />
          <MetricCard
            icon={Eye}
            title="Open Rate"
            value={`${openRate}%`}
            subtitle={`${selectedCampaign.opened.toLocaleString()} opens`}
            color="green"
          />
          <MetricCard
            icon={MousePointer}
            title="Click Rate"
            value={`${clickRate}%`}
            subtitle={`${selectedCampaign.clicked.toLocaleString()} clicks`}
            color="purple"
          />
          <MetricCard
            icon={TrendingUp}
            title="Revenue Generated"
            value={`$${selectedCampaign.revenue.toLocaleString()}`}
            subtitle="From this campaign"
            color="orange"
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="text-sm font-medium text-red-600">{bounceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unsubscribe Rate</span>
                <span className="text-sm font-medium text-yellow-600">{unsubRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Complaints</span>
                <span className="text-sm font-medium text-red-600">{selectedCampaign.complaints}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Desktop</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${selectedCampaign.deviceStats.desktop}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{selectedCampaign.deviceStats.desktop}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mobile</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${selectedCampaign.deviceStats.mobile}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{selectedCampaign.deviceStats.mobile}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tablet</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${selectedCampaign.deviceStats.tablet}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{selectedCampaign.deviceStats.tablet}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Links</h3>
            <div className="space-y-3">
              {selectedCampaign.topLinks.slice(0, 3).map((link, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-gray-600 truncate max-w-[120px]" title={link.url}>
                    {link.url.replace('https://example.com', '')}
                  </span>
                  <span className="text-sm font-medium text-blue-600">{link.clicks} clicks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time-based Analytics */}
        {selectedCampaign.timeStats.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Opens by Time of Day</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {selectedCampaign.timeStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 w-full rounded-t"
                    style={{
                      height: `${(stat.opens / Math.max(...selectedCampaign.timeStats.map(s => s.opens))) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{stat.hour}</span>
                  <span className="text-xs text-gray-500">{stat.opens}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {activeView === 'list' ? <CampaignsContent /> : <AnalyticsContent />}
    </div>
  );
};

export default CampaignAnalytics;