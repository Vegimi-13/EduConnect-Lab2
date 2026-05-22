import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { HomeFeedPage } from "../features/feed/pages/HomeFeedPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
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
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
},
    ],
  },
]);
