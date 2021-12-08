export type Team = {
  key: string;
  name: string;
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
  vars: Var[];
};

export type Var = {
  key: string;
  value: any;
  secret: boolean;
};

export type SingleEntity = {
  // current choice
  team: Team | null;
  project: Project | null;
  stage: Stage | null;
};

export type ArrayEntity = {
  // base options
  teams: Team[];
  projects: Project[];
  stages: Stage[];
};

export type EnvState = SingleEntity & ArrayEntity;
