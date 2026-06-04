import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { ExplorePage } from "../features/explore/pages/ExplorePage";
import { HomeFeedPage } from "../features/feed/pages/HomeFeedPage";
import { MyGroupsPage } from "../features/groups/pages/MyGroupsPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { NotificationsPage } from "../features/notifications/pages/NotificationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "feed",
        element: <HomeFeedPage />,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
      {
        path: "my-groups",
        element: <MyGroupsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "profile/:userId",
        element: <ProfilePage />,
      },
      {
        path: "admin",
        element: <AdminDashboardPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
    ],
  },
]);
