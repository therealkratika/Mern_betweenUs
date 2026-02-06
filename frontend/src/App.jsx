import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import CreateSpace from "./pages/createSpace";
import InvitePartner from "./pages/InvitePartner";
import Waiting from "./pages/Waiting";
import Timeline from "./pages/Timeline";
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
import { loginUser, registerUser } from "./api/auth";

function PublicRoute({ children }) {
  const { user } = useUser();

  if (!user) return children;

  if (!user.spaceId) {
    return <Navigate to="/create-space" replace />;
  }

  if (!user.partnerJoined) {
    return <Navigate to="/waiting" replace />;
  }

  return <Navigate to="/timeline" replace />;
}

/**
 * 🔐 AUTH REQUIRED
 */
function PrivateRoute({ children }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" replace />;
}

/**
 * 🏗 REQUIRE SPACE
 * Used for Invite page
 */
function RequireSpace({ children }) {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;
  if (!user.spaceId) return <Navigate to="/create-space" replace />;

  return children;
}

/**
 * ⏳ WAITING PAGE
 * Waiting page itself decides:
 * - Invite
 * - Waiting
 * - Timeline
 */
function RequireWaiting({ children }) {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;
  if (!user.spaceId) return <Navigate to="/create-space" replace />;
  if (user.partnerJoined) return <Navigate to="/timeline" replace />;

  return children;
}

function RequireTimeline({ children }) {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;

  // 🔥 This is the key condition
  if (!user.spaceId) return <Navigate to="/create-space" replace />;

  return children;
}


/* =========================
   APP
========================= */

export default function App() {
  const { login } = useUser();

  /* ---------- AUTH ---------- */

  const handleLogin = async (email, password) => {
    const data = await loginUser(email, password);
    login(data);
    return data;
  };

  const handleSignup = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    login(data);
    return data;
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔗 INVITE LINKS (NO GUARDS) */}
        <Route path="/invite/:token" element={<InvitationAcceptance />} />
        <Route path="/invite/:token/signup" element={<InviteSignup />} />

        {/* 🌍 PUBLIC */}
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
            <PublicRoute>
              <Login onLogin={handleLogin} />
            </PublicRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup onSignup={handleSignup} />
            </PublicRoute>
          }
        />

        {/* 🏗 CREATE SPACE */}
        <Route
          path="/create-space"
          element={
            <PrivateRoute>
              <CreateSpace />
            </PrivateRoute>
          }
        />

        {/* 📩 INVITE PARTNER */}
        <Route
          path="/invite"
          element={
            <RequireSpace>
              <InvitePartner />
            </RequireSpace>
          }
        />

        {/* ⏳ WAITING */}
        <Route
          path="/waiting"
          element={
            <RequireWaiting>
              <Waiting />
            </RequireWaiting>
          }
        />

        {/* 🧠 MAIN APP */}
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

        <Route path="/letters" element={<RequireTimeline><Letters /></RequireTimeline>} />
<Route path="/letters/new" element={<RequireTimeline><NewLetter /></RequireTimeline>} />
<Route path="/letters/:id" element={<RequireTimeline><LetterDetails /></RequireTimeline>} />
<Route path = "/profile" element={<RequireTimeline><Profile/></RequireTimeline>}/>
        {/* ❌ FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
