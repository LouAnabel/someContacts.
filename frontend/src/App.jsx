import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeContext';

// Layout components
import UserLayout from './components/layout/UserLayout';
import AuthLayout from './components/layout/AuthLayout';  

// Page components
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AllContacts from './pages/AllContacts';
import NewContact from './pages/NewContact';
import ShowContact from './pages/ShowContact';
import UpdateContacts from './pages/UpdateContact';
import ShowCategories from './pages/AllCategories'; 
import LandingPage from './pages/LandingPage';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* All routes now use UserLayout - no authentication needed */}
          <Route path="/*" element={<AuthLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="/myspace/*" element={<UserLayout />}>  
            <Route index element={<Home />} />
            {/* Nested routes for contacts */}
            <Route path="contacts" element={<AllContacts />} />
            <Route path="newcontact" element={<NewContact />} />
            <Route path="contacts/:id" element={<ShowContact />} /> 
            <Route path="updatecontact/:id" element={<UpdateContacts />} />
            <Route path="categories" element={<ShowCategories />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;