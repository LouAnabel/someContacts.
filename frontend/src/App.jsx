import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeContext';

// Layout components
import UserLayout from './components/layout/UserLayout';
import AuthLayout from './components/layout/AuthLayout';  

// Page components
import Login from './pages/login';
import Register from './pages/Register';
import Home from './pages/Home';
import AllContacts from './pages/AllContacts';
import AddContact from './pages/AddContact';
import ShowContact from './pages/ShowContact';
import UpdateContacts from './pages/UpdateContact';
import Logout from './pages/logout';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* All routes now use UserLayout - no authentication needed */}
          <Route path="/*" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="contacts" element={<AllContacts />} />
            <Route path="addcontact" element={<AddContact />} />
            <Route path="contact/:id" element={<ShowContact />} />
            <Route path="updatecontact/:id" element={<UpdateContacts />} />
          </Route>
          <Route path="/hello/*" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="/goodbye/*" element={<AuthLayout />}>
            <Route path="goodbye/logout" element={<Logout />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;