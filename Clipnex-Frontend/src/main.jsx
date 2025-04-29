import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './Store/store.js'
import Home from "./Pages/Home.jsx";
import Playlists from "./Pages/Playlists.jsx";
import PlaylistView from "./Pages/PlaylistView.jsx";
import YourVideos from "./Pages/YourVideos.jsx";
import History from "./Pages/History.jsx";
import Liked from "./Pages/Liked.jsx";
import YourAccount from "./Pages/YourAccount.jsx";
import Support from "./Pages/Support.jsx";
import Settings from "./Pages/Settings.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import VideoPlayer from "./Pages/VideoPlayer.jsx";
import Upload from "./Pages/Upload.jsx";
import SearchResults from "./Pages/SearchResults.jsx";
import Channel from "./Pages/Channel.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import "./index.css";
import App from "./App.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import Community from "./Pages/Community.jsx";
import CreatePost from "./Pages/CreatePost.jsx";

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
        path: "/c/:username",
        element: <Channel />,
      },
      {
        path: "/upload",
        element: <ProtectedRoute><Upload /></ProtectedRoute>,
      },
      {
        path: "/playlists",
        element: <ProtectedRoute><Playlists /></ProtectedRoute>,
      },
      {
        path: "/playlist/:playlistId",
        element: <ProtectedRoute><PlaylistView /></ProtectedRoute>,
      },
      {
        path: "/yourvideos",
        element: <ProtectedRoute><YourVideos /></ProtectedRoute>,
      },
      {
        path: "/history",
        element: <ProtectedRoute><History /></ProtectedRoute>,
      },
      {
        path: "/liked",
        element: <ProtectedRoute><Liked /></ProtectedRoute>,
      },
      {
        path: "/youraccount",
        element: <ProtectedRoute><YourAccount /></ProtectedRoute>,
      },
      {
        path: "/support",
        element: <Support />,
      },
      {
        path: "/settings",
        element: <ProtectedRoute><Settings /></ProtectedRoute>,
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
        element: <ProtectedRoute><YourAccount /></ProtectedRoute>,
      },
      {
        path: "/search",
        element: <SearchResults />,
      },
      {
        path: "/community",
        element: <ProtectedRoute><Community /></ProtectedRoute>,
      },
      {
        path: "/community/new",
        element: <ProtectedRoute><CreatePost /></ProtectedRoute>,
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
