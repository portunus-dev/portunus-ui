import { useState, useEffect } from "react";

import { UserType } from "../utils/types";

// workaround of server/client side rendering difference with next.js
const _ls = () => typeof window !== "undefined" ? window.localStorage : {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
};

const login = (jwt: string) => _ls().setItem('portunus-jwt', jwt);
const logout = () => _ls().removeItem('portunus-jwt');
const load = () => _ls().getItem('portunus-jwt') || '';
export const parseJWT = (jwt: string) => {
  try {
    return JSON.parse(atob(jwt.split('.')[1]));
  } catch (e) {
    return {};
  }
}

/**
 * Hook to get the current user JWT from local storage, and login/logout controls
 */
export const useAuth = () => {
  const [jwt, setJWT] = useState<string>(load);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (jwt) {
      login(jwt);
      setUser(parseJWT(jwt));
    } else {
      logout();
    }
  }, [jwt]);

  return {
    user,
    isLoggedIn: !!jwt,
    login: (jwt: string) => setJWT(jwt),
    logout: () => setJWT(''),
  }
}
