import { useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "../hooks/auth";

const Login = () => {
  const [jwt, setJWT] = useState<string>("");
  const { login } = useAuth();
  const router = useRouter();

  return (
    <div>
      <input
        type="password"
        autoComplete="off"
        placeholder="Portunus JWT"
        value={jwt}
        onChange={({ target: { value } }) => setJWT(value)}
      />
      <button onClick={() => {
        login(jwt)
        router.push("/")
      }}>
        Login
      </button>
    </div>
  )
};

export default Login
