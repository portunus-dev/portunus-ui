import { useReducer } from "react";
import { EnvState, ArrayEntity, Team, Project, Stage } from "../utils/types";

const EMPTY_ENV: EnvState = {
  team: null,
  project: null,
  stage: null,
  teams: [],
  projects: [],
  stages: [],
};

const CLEAR_ORDER = ["team", "project", "stage"];

type EnvDispatchType = "chooseOption";
type ArrayTypeKey = "teams" | "projects" | "stages";
type PortunusEntity = Team | Project | Stage;
type ArrayOptions = PortunusEntity[];

export const useEnv = ({ teams, projects, stages }: ArrayEntity) => {
  const [env, dispatch] = useReducer(
    (
      state: EnvState,
      { type, payload }: { type: EnvDispatchType; payload: any }
    ) => {
      console.log("====> REDUCER!", type, payload);
      //   if (type === "loadOptions") {
      //     return {
      //       ...state,
      //       teams: payload.teams,
      //       projects: payload.projects,
      //       stages: payload.stages,
      //     };
      //   }

      // TODO could to { [key]: value } for easier lookup
      if (type === "chooseOption") {
        // clear "downstream" options
        const clearIdx = CLEAR_ORDER.indexOf(payload.key);
        const clear = CLEAR_ORDER.slice(clearIdx + 1).reduce(
          (agg, key) => ({ ...agg, [key]: null }),
          {}
        );

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
        // TODO rewrite to not be reliant on "::" and key structure, as well as be more clear
        // update "upstream" options
        // e.g. project should clear "stage", update "team"
        const keys = newValue.key.split("::");
        console.log("====> KEYS", keys);
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
        console.log("====> UPDATE", update);
        return {
          ...state,
          [payload.key]: newValue,
          ...clear,
          ...update,
        };
      }

      //   if (type === "full") {
      //     // for quick switch or URL?
      //     return {
      //       ...state,
      //       team: payload.team,
      //       project: payload.project,
      //       stage: payload.stage,
      //     };
      //   }
      return state;
    },
    { ...EMPTY_ENV, teams, projects, stages }
  );

  return { env, dispatch };
};

/*
    pull team/project/stage from URL

    choose team from list
    choose project from list
    choose stage from list

    "quick switch" with all the available values
    TODO
    how much to load all at once? We could load incrementally, e.g. load Teams, choose Team > load Project & Users, choose Project > load stages
    OR we could 
    
*/
