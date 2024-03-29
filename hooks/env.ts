import { useEffect, useReducer, useMemo } from "react";
import {
  EnvState,
  ArrayEntity,
  Team,
  Project,
  Stage,
  EnvOption,
  EnvType,
} from "../utils/types";

export const EMPTY_ENV: EnvState = {
  team: undefined,
  project: undefined,
  stage: undefined,
  teams: [],
  projects: [],
  stages: [],
};

export type EnvDispatchType =
  | "loadOptions"
  | "chooseOption"
  | "addTeam"
  | "deleteTeam"
  | "editTeam"
  | "addProject"
  | "deleteProject"
  | "editProject"
  | "addStage"
  | "deleteStage"
  | "editStage";

type ArrayTypeKey = "teams" | "projects" | "stages";
type PortunusEntity = Team | Project | Stage;
type ArrayOptions = PortunusEntity[];

const CLEAR_ORDER = ["team", "project", "stage"];

export const useEnv = (init: ArrayEntity | undefined) => {
  const [env, dispatch] = useReducer(
    (
      state: EnvState,
      { type, payload }: { type: EnvDispatchType; payload: any }
    ) => {
      if (type === "loadOptions") {
        const team = payload.teams[0] as Team;
        const project =
          team && payload.projects.find((o: Project) => o.team === team.key);
        const stage =
          project &&
          payload.stages.find((o: Stage) => o.project === project.key);
        return {
          team,
          project,
          stage,
          teams: payload.teams as Team[],
          projects: payload.projects as Project[],
          stages: payload.stages as Stage[],
        };
      }

      // TODO could to { [key]: value } for easier lookup
      if (type === "chooseOption") {
        const options: ArrayOptions | null =
          state[`${payload.key}s` as ArrayTypeKey];

        if (!options) {
          return state;
        }

        const newValue = options.find(
          (o: PortunusEntity) => o.key === payload.value
        );

        if (!newValue) {
          return state;
        }

        // clear "downstream" options
        // e.g. choosing a team should update project & stage
        const clearIdx = CLEAR_ORDER.indexOf(payload.key);
        const clear = CLEAR_ORDER.slice(clearIdx + 1).reduce(
          (agg, key) => ({
            ...agg,
            [key]: (
              state[`${key}s` as ArrayTypeKey] as (Project | Stage)[]
            ).find(
              (o: Project | Stage) =>
                o[key === "project" ? "team" : "project"] === payload.value
            ),
          }),
          {}
        );

        // update "upstream" options, in the case of "quick switching" directly to a stage
        // e.g. choosing a stage should update team & project
        const keys = newValue.key.split("::"); // TODO be less reliant on "::" and key structure
        const update = CLEAR_ORDER.slice(0, clearIdx).reduce((agg, key, i) => {
          const options: ArrayOptions | null = state[`${key}s` as ArrayTypeKey];
          const newValue = options.find(
            (o: PortunusEntity) => o.key === keys.slice(0, i + 1).join("::")
          );
          return {
            ...agg,
            [key]: newValue,
          };
        }, {});
        return {
          ...state,
          [payload.key]: newValue,
          ...clear,
          ...update,
        };
      }

      if (type === "addTeam") {
        return {
          ...state,
          team: payload,
          project: undefined,
          stage: undefined,
          teams: [...state.teams, payload],
        };
      }

      if (type === "deleteTeam") {
        // remove team > project > stage
        // reset chosen state, if it was deleted
        const projects = state.projects.filter((o) => o.team !== payload.key);
        const removedProjects = state.projects
          .filter((o) => o.team === payload.key)
          .map((o) => o.key);
        const stages = state.stages.filter(
          (stage) => !removedProjects.includes(stage.project)
        );
        const removedStages = state.stages
          .filter((stage) => removedProjects.includes(stage.project))
          .map((o) => o.key);
        return {
          ...state,
          team: state.team?.key === payload.key ? undefined : state.team,
          project: removedProjects.includes(state.project?.key || "")
            ? undefined
            : state.project,
          stage: removedStages.includes(state.stage?.key || "")
            ? undefined
            : state.stage,
          teams: state.teams.filter((team) => team.key !== payload.key),
          projects,
          stages,
        };
      }

      if (type === "editTeam") {
        if (!state.teams) return state;
        const teams = state.teams;
        const editedTeamIdx = teams.findIndex((o) => o.key === payload.key);
        if (editedTeamIdx < 0) return state;
        const update = { ...teams[editedTeamIdx], ...payload };

        return {
          ...state,
          team: state.team?.key === payload.key ? update : state.team,
          teams: [
            ...teams.slice(0, editedTeamIdx),
            update,
            ...teams.slice(editedTeamIdx + 1),
          ],
        };
      }

      if (type === "addProject") {
        return {
          ...state,
          project: payload,
          stage: undefined,
          projects: [...state.projects, payload],
        };
      }

      if (type === "deleteProject") {
        // remove project > stage
        // reset chosen state, if it was deleted
        const stages = state.stages.filter(
          (stage) => payload.key !== stage.project
        );
        const removedStages = state.stages
          .filter((stage) => payload.key === stage.project)
          .map((o) => o.key);
        return {
          ...state,
          project:
            state.project?.key === payload.key ? undefined : state.project,
          stage: removedStages.includes(state.stage?.key || "")
            ? undefined
            : state.stage,
          projects: state.projects.filter(
            (project) => project.key !== payload.key
          ),
          stages,
        };
      }

      if (type === "editProject") {
        if (!state.projects) return state;
        const projects = state.projects;
        const editedProjectIdx = projects.findIndex(
          (o) => o.key === payload.key
        );
        if (editedProjectIdx < 0) return state;
        const update = { ...projects[editedProjectIdx], project: payload.name };
        return {
          ...state,
          project: state.project?.key === payload.key ? update : state.project,
          projects: [
            ...projects.slice(0, editedProjectIdx),
            update,
            ...projects.slice(editedProjectIdx + 1),
          ],
        };
      }

      if (type === "addStage") {
        return {
          ...state,
          stage: payload,
          stages: [...state.stages, payload],
        };
      }

      if (type === "deleteStage") {
        // reset chosen state, if it was deleted
        const stages = state.stages.filter(
          (stage) => payload.key !== stage.key
        );
        return {
          ...state,
          stage: state.stage?.key === payload.key ? undefined : state.stage,
          stages,
        };
      }

      if (type === "editStage") {
        if (!state.stages) return state;
        const stages = state.stages;
        const editedStageIdx = stages.findIndex((o) => o.key === payload.key);
        if (editedStageIdx < 0) return state;
        const update = { ...stages[editedStageIdx], stage: payload.name };
        return {
          ...state,
          stage: state.stage?.key === payload.key ? update : state.stage,
          stages: [
            ...stages.slice(0, editedStageIdx),
            update,
            ...stages.slice(editedStageIdx + 1),
          ],
        };
      }
      return state;
    },
    { ...EMPTY_ENV }
  );

  useEffect(() => {
    if (init) {
      dispatch({ type: "loadOptions", payload: init });
    }
  }, [init]);

  // flattened array[] of team/project/stage that a user can interact with
  // grouped by team > project > stage
  const options: EnvOption[] = useMemo(
    () =>
      [
        ...env.teams
          .map((o) => [
            { type: "team" as EnvType, label: o.name, path: "", ...o },
            ...env.projects
              .filter((p) => p.team === o.key)
              .map((p) => [
                {
                  type: "project" as EnvType,
                  label: p.project,
                  path: o.name + " > ",
                  ...p,
                },
                ...env.stages
                  .filter((q) => q.project === p.key)
                  .map((q) => ({
                    ...q,
                    type: "stage" as EnvType,
                    label: q.stage,
                    path: o.name + " > " + p.project + " > ",
                  })),
              ]),
          ])
          .flat(),
      ].flat(),
    [env]
  );

  return { env, options, dispatch };
};
