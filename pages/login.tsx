import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { useAuth, parseJWT } from "../hooks/auth";
import { UserType } from "../utils/types";

const Login = () => {
  const [jwt, setJWT] = useState<string>("");
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();
  const { login, jwt: _jwt } = useAuth();

  useEffect(() => { // already logged in
    if (_jwt) {
      router.push("/")
    }
  }, [_jwt])

  useEffect(() => {
    const user = parseJWT(jwt);
    if (!user) {
      console.warn("Invalid JWT"); // TODO: proper alert mechanism
    }
    setUser(user);
  }, [jwt]);

  if (_jwt) {
    return (<div>Already logged in, redirecting...</div>)
  }

  return (
    <div>
      <input
        type="password"
        autoComplete="off"
        placeholder="Portunus JWT"
        value={jwt}
        onChange={({ target: { value } }) => setJWT(value)}
      />
      {(user || {}).email && (
        <button
          onClick={() => {
            login(jwt)
            router.push("/")
          }}
        >
          Welcome, {(user || {}).email}
        </button>
      )}
    </div>
  )
}

export default Login
