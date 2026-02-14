import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function useRedirect(isLoggedIn) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;

    const redirect = async () => {
      try {
        const res = await api.get("/spaces/status");

        if (res.data.state === "NO_SPACE") {
          navigate("/create-space", { replace: true });
        } else {
          navigate("/timeline", { replace: true });
        }
      } catch (err) {
        console.error(err);
      }
    };

    redirect();
  }, [isLoggedIn, navigate]);
}
