import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './components/theme/ThemeContext';
import Layout from './components/layout/Layout'; // Updated import path
import Home from './pages/Home';
import AllContacts from './pages/AllContacts';
import AddContact from './pages/AddContact';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'allcontacts',
        element: <AllContacts />,
      },
      {
        path: 'addcontact',
        element: <AddContact />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;