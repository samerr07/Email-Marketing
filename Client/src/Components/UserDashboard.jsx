import EmailMarketingTool from './EmailMarketingTool';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Mail, Users, BarChart3, Settings, Send, Plus, Eye, Edit, Trash2, Search, Filter, Calendar, TrendingUp,Activity,Target, User, LogOut, Bell, Menu, X } from 'lucide-react';
import CampaignAnalytics from './CampaignAnalytics';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, setAuthentication } from '../redux/userSlice';
import CampaignScheduler from './CampaignScheduler';

const UserDashboard = () => {
    const { isAuthenticated, userProfile } = useSelector((state) => state.user);
    console.log(isAuthenticated)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const stats = {
    totalSubscribers: 12450,
    totalCampaigns: 25,
    openRate: 71.2,
    clickRate: 18.7
  };

  const handleLogout = () => {
    dispatch(setAuthentication(false));
    dispatch(getProfile(null));
    toast.success('Logout successfully!', {
      duration: 4000,
      position: 'top-right',
    });
    navigate("/");
  };

  // User Management Functions
  const handleCreateUser = async (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      status: 'Active',
      lastLogin: 'Never',
      created: new Date().toISOString().split('T')[0]
    };
    try {
      const response = await axios.post('http://localhost:5000/api/auth/create_user', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const data = response.data;
      console.log(data);



      toast.success('User Logged In successfully!', {
        duration: 4000,
        position: 'top-right',
      });
      fetchUsers();

      // navigate("/dashboard")

    } catch (err) {
      // Axios error handling
      console.log(err)
      // const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';

    }
    // setUsers([...users, newUser]);
    setShowUserModal(false);
  };

  console.log(campaigns)

  const fetchCampaigns = async () => {
    try {
     
      const response = await axios.get('http://localhost:5000/get_campaigns');
      
      if (response.data.success) {
        setCampaigns(response.data.data);
      } else {
        setError('Failed to fetch campaigns');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching campaigns');
    } 
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        withCredentials: true,
      });
      const data = response.data;
      console.log(data);
      setUsers(data?.data);

    } catch (err) {
      console.error(err);
    }
  }

  useEffect(()=>{
    fetchUsers()
    fetchCampaigns();
  
  },[])

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
console.log(users)

  useEffect(()=>{
    if(!isAuthenticated){
      navigate('/login')
    }
  })

  // const handleEditUser = (userData) => {
  //   setUsers(users.map(user =>
  //     user.id === editingUser.id ? { ...user, ...userData } : user
  //   ));
  //   setShowUserModal(false);
  //   setEditingUser(null);
  // };
const handleEditUser = async (userData) => {
    try {
        // Make API call to update user
        const response = await fetch(`http://localhost:5000/api/auth/update_user/${editingUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle error response
            console.error('Error updating user:', result.message);
            // You might want to show an error message to the user here
            alert(result.message || 'Failed to update user');
            return;
        }

        // Update local state with the updated user data from the server
        setUsers(users.map(user =>
            user.id === editingUser.id ? result.user : user
        ));

        setShowUserModal(false);
        setEditingUser(null);
        
        // Optional: Show success message
        toast.success('User updated successfully!', { duration: 3000 });
        console.log('User updated successfully:', result.user);
        
    } catch (error) {
        console.error('Network error updating user:', error);
        alert('Network error. Please try again.');
    }
};
  

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } : user
    ));
  };

  const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
      withCredentials: true,
    });
    console.log(response.data.message);
    toast.success('User deleted successfully!', { duration: 3000 });
    fetchUsers();
  } catch (err) {
    console.error('Delete error:', err.response.data.message);
  }
};

   const UserModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-700 opacity-50"></div>
        </div> */}

        <div className="inline-block  align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-200">
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
              name: formData.get('name'),
              email: formData.get('email'),
              password: formData.get('password'),
              role: formData.get('role')
            };
            editingUser ? handleEditUser(userData) : handleCreateUser(userData);
          }}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {editingUser ? 'Update user information' : 'Add a new team member'}
              </p>
            </div>

            <div className="bg-white px-6 py-6">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingUser?.name || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingUser?.email || ''}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required={!editingUser}
                    defaultValue=""
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter password"}
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'User'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );



   const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div className="ml-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">EmailPro</span>
            <p className="text-xs text-slate-400 font-medium">Marketing Suite</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <X className="h-6 w-6 text-slate-400" />
        </button>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
            { id: 'campaigns', label: 'Campaigns', icon: Mail, color: 'from-green-500 to-emerald-500' },
            // { id: 'users', label: 'Team', icon: Users, color: 'from-purple-500 to-pink-500' },
            { id: 'compose', label: 'Compose', icon: Send, color: 'from-orange-500 to-red-500' },
            { id: 'analytics', label: 'Scheduler', icon: Calendar, color: 'from-indigo-500 to-purple-500' },
            // { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105'
                }`}
              >
                <Icon className={`mr-4 h-5 w-5 ${isActive ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-300 truncate">{userProfile.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );



   const Header = () => (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between h-18 px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent capitalize">{activeTab}</h1>
            <p className="text-sm text-gray-500 font-medium">Manage your email marketing campaigns</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">3</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{userProfile?.name}</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );



 const DashboardContent = () => (
    <div className="p-6 space-y-8">
     

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Total Subscribers', 
            value: stats.totalSubscribers.toLocaleString(), 
            icon: Users, 
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'from-blue-50 to-cyan-50',
            change: '+12.5%',
            changeColor: 'text-green-600'
          },
          { 
            title: 'Active Campaigns', 
            value: stats.totalCampaigns, 
            icon: Mail, 
            color: 'from-emerald-500 to-green-500',
            bgColor: 'from-emerald-50 to-green-50',
            change: '+3.2%',
            changeColor: 'text-green-600'
          },
          { 
            title: 'Open Rate', 
            value: `${stats.openRate}%`, 
            icon: Eye, 
            color: 'from-amber-500 to-orange-500',
            bgColor: 'from-amber-50 to-orange-50',
            change: '+2.1%',
            changeColor: 'text-green-600'
          },
          { 
            title: 'Click Rate', 
            value: `${stats.clickRate}%`, 
            icon: TrendingUp, 
            color: 'from-purple-500 to-pink-500',
            bgColor: 'from-purple-50 to-pink-50',
            change: '-0.5%',
            changeColor: 'text-red-600'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.bgColor} p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 group`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`text-sm font-semibold ${stat.changeColor} bg-white/80 px-2 py-1 rounded-full`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>


      {/* Recent Campaigns */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-gray-900">Recent Campaigns</h3>
              <p className="text-sm text-gray-500 mt-1">Monitor your email campaign performance</p>
            <button
              onClick={() => setActiveTab('compose')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                {['Campaign', 'Status', 'Sent', 'Opened', 'Clicked', 'Date', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{campaign.campaign_name}</div>
                        
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' :
                      campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">25</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">478</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">478</td>

                  <td className="px-6 py-5 text-sm text-gray-500">{formatDate(campaign.created_at)}</td>
                  <td className="px-6 py-5 text-sm font-medium text-gray-900">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
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

  // Users Tab Content
  const UsersContent = () => (
    <div className="p-6">
     <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-500 mt-1">Manage your team members and their permissions</p>
        </div>
        <button
          onClick={() => setShowUserModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
          { title: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: Activity, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' },
          { title: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: Settings, color: 'from-red-500 to-pink-500', bgColor: 'from-red-50 to-pink-50' },
          { title: 'Managers', value: users.filter(u => u.role === 'Manager').length, icon: Target, color: 'from-purple-500 to-indigo-500', bgColor: 'from-purple-50 to-indigo-50' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.bgColor} p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 group`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your team and their access levels</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  className="pl-10 pr-4 py-2 w-64 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
              <button className="flex items-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full ">
          <thead className="bg-gray-50/50">
              <tr>
                {['User', 'Role',  'Created', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
               <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      User
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {user.status}
                    </button>
                  </td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
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







  

  

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'campaigns':
        return <CampaignAnalytics campaigns={campaigns} deleteCampaign={deleteCampaign} />;

    //   case 'users':
    //     return <UsersContent />;
      case 'compose':
        return <EmailMarketingTool />;
      case 'analytics':
        return <CampaignScheduler />;
    //   case 'settings':
    //     return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && <UserModal />}

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default UserDashboard;