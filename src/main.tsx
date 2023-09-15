import React from "react";
import ReactDOM from "react-dom/client";
import App, { loader as rootLoader } from "./App";
import { ProticoAuthProvider } from "./contexts/ProticoAuthContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import ErrorPage from "./error-page";
import Login from "./login";
import Lobby, { loader as lobbyLoader } from "./lobby";
import Index from "./appindex";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    loader: rootLoader,
    children: [
      { index: true, element: <Index /> },
      {
        path: "lobby/:lobbyId",
        element: <Lobby />,
        loader: lobbyLoader,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ProticoAuthProvider>
      <RouterProvider router={router} />
    </ProticoAuthProvider>
  </React.StrictMode>
);
