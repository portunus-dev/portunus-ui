import { Team, Project, Stage } from "./types";

const TEAMS = ["EQ Works", "Portunus"];
const PROJECTS = ["Snoke", "CyberPunk"];
const STAGES = ["dev", "prod"];
const VARS = [
  { key: "TOKEN", value: "abcdefg", secret: true },
  { key: "BANANAS", value: 10, secret: false },
];

export const generateTestEnv = () => {
  return TEAMS.reduce(
    (agg: { teams: Team[]; projects: Project[]; stages: Stage[] }, name, i) => {
      const teamKey = "" + i;
      agg.teams.push({ name, key: teamKey });
      PROJECTS.forEach((project, j) => {
        const uniqueProject = project + "-" + i;
        const projectKey = `${teamKey}::${uniqueProject}`;
        agg.projects.push({
          project: uniqueProject,
          team: teamKey,
          key: projectKey,
        });

        STAGES.forEach((stage) => {
          const uniqueStage = stage + "-" + j;
          const stageKey = `${projectKey}::${uniqueStage}`;
          agg.stages.push({
            stage: uniqueStage,
            project: projectKey,
            key: stageKey,
            vars: VARS,
          });
        });
      });

      return agg;
    },
    { teams: [], projects: [], stages: [] }
  );
};
