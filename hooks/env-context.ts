import React from "react";

import { EnvState, Toast } from "../utils/types";
import { EMPTY_ENV, EnvDispatchType } from "./env";

type EnvContext = {
  env: EnvState;
  dispatch: React.Dispatch<{
    type: EnvDispatchType;
    payload: any;
  }>;
  setToast: ({ content, action, duration }: Toast) => void;
  openCreateModal: (type: string) => void;
  closeCreateModal: () => void;
};

const defaultContext: EnvContext = {
  env: EMPTY_ENV,
  dispatch: () => {},
  setToast: () => {},
  openCreateModal: () => {},
  closeCreateModal: () => {},
};

export const EnvContext = React.createContext(defaultContext);
