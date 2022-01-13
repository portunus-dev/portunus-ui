import React from "react";
import { EnvState } from "../utils/types";
import { EMPTY_ENV, EnvDispatchType } from "./env";

type EnvContext = {
  env: EnvState;
  dispatch: React.Dispatch<{
    type: EnvDispatchType;
    payload: any;
  }>;
};

const defaultContext: EnvContext = {
  env: EMPTY_ENV,
  dispatch: () => {},
};

export const EnvContext = React.createContext(defaultContext);
