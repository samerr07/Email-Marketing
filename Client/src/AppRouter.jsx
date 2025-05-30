import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
// import './App.css'
import MainPage from './page/MainPage'
import Dashboard from './Components/Dashboard'
import Login from './Components/Login'
import { ToastContainer } from 'react-toastify'
import EmailMarketingTool from './Components/EmailMarketingTool'
import Header from './Components/Header'
import UserDashboard from './Components/UserDashboard'

// Create a separate component for the app content
function AppRouter() {
  const location = useLocation();

  // Define routes where Header should not appear
  const routesWithoutNavbar = [
    '/',
    '/login',
    '/dashboard'
  ];

  // Check if current path should have navbar
  const shouldShowNavbar = !routesWithoutNavbar.includes(location.pathname);

  return (
    <>
      <ToastContainer />
      {/* {shouldShowNavbar && <Header />} */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-tool" element={<EmailMarketingTool />} />
        <Route path='/user-dashboard' element={<UserDashboard/>}/>
      </Routes>
    </>
  );
}

export default AppRouter