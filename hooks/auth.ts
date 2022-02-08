import { useState, useEffect } from "react";

// workaround of server/client side rendering difference with next.js
const _ls = () => typeof window !== "undefined" ? window.localStorage : {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
};
const login = (jwt: string) => _ls().setItem('portunus-jwt', jwt);
const logout = () => _ls().removeItem('portunus-jwt');
const get = () => _ls().getItem('portunus-jwt');

/**
 * Hook to get the current user JWT from local storage, and login/logout controls
 */
export const useAuth = () => {
  const [jwt, setJWT] = useState<string | null>(get);

  useEffect(() => {
    if (jwt) {
      login(jwt);
    } else {
      logout();
    }
  }, [jwt]);

  return {
    jwt,
    login: (jwt: string | null) => setJWT(jwt),
    logout: () => setJWT(null),
  }
}
