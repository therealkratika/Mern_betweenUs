import { useUser } from "../context/UserContext";
import useRedirect from "../hooks/UseRedirect";
export default function Redirect() {
  const { user } = useUser();
  useRedirect(user);
  return null;
}
