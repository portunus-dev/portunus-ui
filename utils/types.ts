export type Team = {
  key: string;
  name: string;
  audit: string;
};

export type Project = {
  key: string;
  project: string;
  team: string;
};

export type Stage = {
  key: string;
  stage: string;
  project: string;
  team: string;
};

export type Var = {
  key: string;
  value: any;
  secret: boolean;
};

export type SingleEntity = {
  // current choice
  team?: Team;
  project?: Project;
  stage?: Stage;
};

export type ArrayEntity = {
  // base options
  teams: Team[];
  projects: Project[];
  stages: Stage[];
};

export type EnvState = SingleEntity & ArrayEntity;

export type EnvType = "team" | "project" | "stage";

export type EnvOption = {
  type: EnvType;
  label: string;
  path: string;
} & (Team | Project | Stage);

export type UserType = {
  email: string;
  jwt_uuid: string; // TODO: more specific type for UUID?
  // iat: number; TODO: this was causing a conflict with ListItem. Should Review
};

export type FullUser = {
  key: string;
  email: string;
  jwt_uuid: string;
  preferences?: {
    audit: boolean;
  };
};

export type Toast = {
  content?: React.ReactElement | string;
  action?: React.ReactElement;
  duration?: number;
};

export type AuditHistory = {
  email: string;
  start: string;
  end: string;
  explanation: string;
  method: string;
  url: string;
};
