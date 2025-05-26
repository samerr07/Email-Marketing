import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProfile, setAuthentication } from '../redux/userSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Header = () => {

    const {userProfile, isAuthenticated} = useSelector((state)=>state.user)
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const onLogout = () => {
        dispatch(setAuthentication(false));
        dispatch(getProfile(null));
        toast.success('Logout successfully!', {
          duration: 4000,
          position: 'top-right',
        });
        navigate("/");
      };

  return (
   <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">EmailFlow</h1>
        <div className="flex items-center space-x-2">
          {/* Theme Toggle Button */}
          
          {/* User Authentication Section */}
          {userProfile ? (
            // Logged in state
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Welcome, {userProfile.name}
              </span>
            
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  Logout
                </button>
          
            </div>
          ) : (
            // Logged out state
            <a href="/login">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
                Sign In
              </button>
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
