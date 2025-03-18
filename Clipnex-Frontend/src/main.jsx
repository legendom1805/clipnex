import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './Store/store.js'
import Home from "./Pages/Home.jsx";
import Playlists from "./Pages/Playlists.jsx";
import YourVideos from "./Pages/YourVideos.jsx";
import History from "./Pages/History.jsx";
import Liked from "./Pages/Liked.jsx";
import YourAccount from "./Pages/YourAccount.jsx";
import Support from "./Pages/Support.jsx";
import Settings from "./Pages/Settings.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import VideoPlayer from "./Pages/VideoPlayer.jsx";
import Upload from "./Pages/Upload.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import "./index.css";
import App from "./App.jsx";
import LoginPage from "./Pages/LoginPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/video/:videoId",
        element: <VideoPlayer />,
      },
      {
        path: "/upload",
        element: <ProtectedRoute><Upload /></ProtectedRoute>,
      },
      {
        path: "/playlists",
        element: <Playlists />,
      },
      {
        path: "/yourvideos",
        element: <YourVideos />,
      },
      {
        path: "/history",
        element: <History />,
      },
      {
        path: "/liked",
        element: <Liked />,
      },
      {
        path: "/youraccount",
        element: <YourAccount />,
      },
      {
        path: "/support",
        element: <Support />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/signup",
        element: <SignUpPage />,
      },
      {
        path: "/dashboard",
        element: <YourAccount />,
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
