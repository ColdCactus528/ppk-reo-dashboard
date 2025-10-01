import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Layout from "./layout/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Registry from "./pages/Registry.jsx";
import PersonFull from "./pages/PersonFull.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/registry" replace /> }, 
      { path: "dashboard", element: <Dashboard /> },
      { path: "registry", element: <Registry /> },
      { path: "person/:id", element: <PersonFull /> }, 
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
