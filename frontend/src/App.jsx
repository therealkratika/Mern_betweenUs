import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import CreateSpace from "./pages/createSpace";
import InvitePartner from "./pages/InvitePartner";
import Waiting from "./pages/Waiting";
import Timeline from "./pages/timeline/Timeline";
import AddDay from "./pages/addDay";
import DayDetail from "./pages/DayDetails";
import InvitationAcceptance from "./pages/InvitationAcceptance";
import InviteSignup from "./pages/InviteSignup";
import LetterDetails from "./pages/LetterDetails";
import NewLetter from "./pages/NewLetter";
import Letters from "./pages/Letters";
import Profile from "./pages/profile";
import ForgotPassword from "./pages/ForgotPasswor";
import ResetPassword from "./pages/ResetPassword";
import OnThisDay from "./pages/onThisDay";

function PublicRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;

  if (!user) return children;
  
  if (!user.spaceId) return <Navigate to="/create-space" replace />;

  if (!user.partnerJoined) return <Navigate to="/waiting" replace />;

  return <Navigate to="/timeline" replace />;
}

function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}
function RequireSpace({ children }) {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.spaceId) return <Navigate to="/create-space" replace />;

  return children;
}

function RequireWaiting({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.spaceId) return <Navigate to="/create-space" replace />;
  if (user.partnerJoined) return <Navigate to="/timeline" replace />;

  return children;
}
function RequireTimeline({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.spaceId) return <Navigate to="/create-space" replace />;

  return children;
}
export default function App() {
  return (
    <BrowserRouter>   

      <Routes>

        <Route path="/invite/:token" element={<InvitationAcceptance />} />
        <Route path="/invite/:token/signup" element={<InviteSignup />} />
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
          
              <Login />
          
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/create-space"
          element={
            <PrivateRoute>
              <CreateSpace />
            </PrivateRoute>
          }
        />

        <Route
          path="/invite"
          element={
            <RequireSpace>
              <InvitePartner />
            </RequireSpace>
          }
        />

        <Route
          path="/waiting"
          element={
            <RequireWaiting>
              <Waiting />
            </RequireWaiting>
          }
        />

        <Route
          path="/timeline"
          element={
            <RequireTimeline>
              <Timeline />
            </RequireTimeline>
          }
        />

        <Route
          path="/add"
          element={
            <RequireTimeline>
              <AddDay />
            </RequireTimeline>
          }
        />

        <Route
          path="/day/:id"
          element={
            <RequireTimeline>
              <DayDetail />
            </RequireTimeline>
          }
        />

        <Route
          path="/on-this-day"
          element={
            <RequireTimeline>
              <OnThisDay />
            </RequireTimeline>
          }
        />

        <Route
          path="/letters"
          element={
            <RequireTimeline>
              <Letters />
            </RequireTimeline>
          }
        />

        <Route
          path="/letters/new"
          element={
            <RequireTimeline>
              <NewLetter />
            </RequireTimeline>
          }
        />

        <Route
          path="/letters/:id"
          element={
            <RequireTimeline>
              <LetterDetails />
            </RequireTimeline>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireTimeline>
              <Profile />
            </RequireTimeline>
          }
        />

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
