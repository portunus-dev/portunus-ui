import React from "react";

type EnvContext = {
  team: string;
  project: string;
  stage: string;
};

const defaultContext: EnvContext = {
  team: "",
  project: "",
  stage: "",
};

export const context = React.createContext(defaultContext);
