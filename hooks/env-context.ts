import React from "react";

import { EnvState, Toast } from "../utils/types";
import { EMPTY_ENV, EnvDispatchType } from "./env";


type EnvContext = {
  env: EnvState;
  dispatch: React.Dispatch<{
    type: EnvDispatchType;
    payload: any;
  }>;
  setToast: ({ children, action, duration }: Toast) => void;
};

const defaultContext: EnvContext = {
  env: EMPTY_ENV,
  dispatch: () => {},
  setToast: () => {}
};

export const EnvContext = React.createContext(defaultContext);
