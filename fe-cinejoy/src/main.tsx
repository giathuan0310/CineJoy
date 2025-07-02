import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AlertContextProvider } from 'context/alert.context';
import Layout from 'components/layout';
import AppProvider from 'components/appProvider';
import HomePage from 'pages/client/Home';
import Movies from 'pages/client/Movies';
import MoviesDetail from 'pages/client/MoviesDetail';
import Select from 'pages/client/SelectSeat';
import Dashboard from 'pages/admin/AdminDaskboard';
import { ToastContainer } from 'react-toastify';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/movies",
        element: <Movies />
      }
      , {
        path: "/movies/:id",
        element: <MoviesDetail />
      },
      {
        path: "/selectSeat",
        element: <Select />
      },
    ]
  },
  {
    path: "/admin",
    element: <Dashboard />
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertContextProvider>
      <AppProvider>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
        <RouterProvider router={router} />
      </AppProvider>
    </AlertContextProvider>
  </StrictMode>,
);
