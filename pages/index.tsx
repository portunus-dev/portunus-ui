import React, { useEffect, useState, useCallback } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { apiRequest } from "../utils/api";
import {
  ArrayEntity,
  Team,
  Project,
  Stage,
  EnvOption,
  Toast,
} from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useEnv } from "../hooks/env";
import { useRequest } from "../hooks/utils";

import TeamDropdown from "../components/TeamDropdown";
import ProjectDropdown from "../components/ProjectDropdown";

import TeamTab from "../components/TeamTab";
import ProjectTab from "../components/ProjectTab";
import StageTab from "../components/StageTab";

const INDENT = {
  team: 1,
  project: 3,
  stage: 5,
};

const TOAST_DEFAULT: Toast = {
  content: undefined,
  action: undefined,
  duration: 3000,
};

const fetchAllData = async () => {
  const res = await apiRequest("all", { method: "GET" });
  const allData: ArrayEntity = res;
  return allData;
};

export default function EnvRoot() {
  const { data, loading, error, executeRequest } = useRequest<ArrayEntity>({
    requestPromise: fetchAllData,
  });

  useEffect(() => {
    executeRequest();
  }, []);

  const { env, options, dispatch } = useEnv(data);

  const handleChoose = (key: string, value: string) =>
    dispatch({ type: "chooseOption", payload: { key, value } });

  const handleChooseTeam = (value: Team) => handleChoose("team", value.key);

  const handleChooseProject = (value: Project) =>
    handleChoose("project", value.key);

  const handleChooseStage = (value: Stage) => handleChoose("stage", value.key);

  const handleOnQuickSwitch = (e: React.SyntheticEvent, newValue: any) => {
    // need to pull the correct values!
    if (newValue) handleChoose(newValue.type, newValue.key);
  };

  /*
    TODO
    - admin hide/show
    - unify api responses & Team/Project/Stage e.g. stage .project is project key, but response .project above is name
    - loading state (e.g. disable)
    - error messages
    - get state from URL
    - console errors
    - stop polluting env state with options (i.e. we had path, label & desc)
  */

  const [open, setOpen] = useState(false);
  const handleOnClose = () => setOpen(false);
  const [toast, setToastContent] = useState(TOAST_DEFAULT);
  const setToast = useCallback((toast: Toast) => {
    setToastContent(toast);
    setOpen(true);
  }, []);

  const openCreateModal = (type: string) => {
    console.log(type);
    // TODO: modal with a switch for the AddXYZ component
  };

  return (
    <EnvContext.Provider value={{ env, dispatch, setToast, openCreateModal }}>
      {loading && (
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && (
        <Box>
          <Typography>{error.message}</Typography>
        </Box>
      )}
      {!loading && !error && (
        <Box sx={{ p: 1 }}>
          <Autocomplete
            id="grouped-demo"
            options={options}
            renderOption={(props: object, option: EnvOption) => {
              return (
                <div
                  {...props}
                  key={option.key}
                  style={{
                    paddingLeft: `${INDENT[option.type] * 5}px`,
                  }}
                >
                  <small>{option.path}</small>
                  &nbsp;
                  <strong>{option.label}</strong>
                </div>
              );
            }}
            filterOptions={(options, { inputValue }) => {
              const lc = inputValue.toLocaleLowerCase();
              // TS only allows you to access shared properties when you spread objects and use (A | B) to catch them
              return options.filter(
                (o) =>
                  (o && o.key.toLowerCase().indexOf(lc) >= 0) ||
                  o.path.toLowerCase().indexOf(lc) >= 0 ||
                  ((o as Team).name &&
                    (o as Team).name.toLowerCase().indexOf(lc) >= 0) ||
                  ((o as Project | Stage).team &&
                    (o as Project | Stage).team.toLowerCase().indexOf(lc) >=
                      0) ||
                  ((o as Project | Stage).project &&
                    (o as Project | Stage).project.toLowerCase().indexOf(lc) >=
                      0) ||
                  ((o as Stage).stage &&
                    (o as Stage).stage.toLowerCase().indexOf(lc) >= 0)
              );
            }}
            //   groupBy={(option: any) => option.type}
            //   getOptionLabel={(option: any) => option.label}
            onChange={handleOnQuickSwitch}
            value={null}
            clearOnBlur
            sx={{ width: 300 }}
            renderInput={(params) => (
              <TextField {...params} label="Quick Search" />
            )}
          />
        </Box>
      )}
      {!loading && !error && (
        <Box>
          <Box sx={{ display: "flex" }}>
            <TeamDropdown handleChooseTeam={handleChooseTeam} />
            <ProjectDropdown handleChooseProject={handleChooseProject} />
          </Box>
          {/* TABS HERE */}
          <StageTab handleChooseStage={handleChooseStage} />
        </Box>
      )}
      <Snackbar
        open={open}
        onClose={handleOnClose}
        autoHideDuration={toast.duration || 2000}
        action={toast.action}
        message={typeof toast.content === "string" ? toast.content : null}
      >
        {typeof toast.content !== "string" ? toast.content : undefined}
      </Snackbar>
    </EnvContext.Provider>
  );
}
