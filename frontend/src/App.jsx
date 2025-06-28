import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeContext';

// Layout components
import UserLayout from './components/layout/UserLayout';

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
            <Route path="hello/login" element={<Login />} />
            <Route path="helo/register" element={<Register />} />
            <Route path="contacts" element={<AllContacts />} />
            <Route path="addcontact" element={<AddContact />} />
            <Route path="contact/:id" element={<ShowContact />} />
            <Route path="updatecontact/:id" element={<UpdateContacts />} />
            <Route path="hello/logout" element={<Logout />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;