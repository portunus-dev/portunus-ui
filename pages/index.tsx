import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import AppBar from "@mui/material/AppBar";
import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import KeyIcon from "@mui/icons-material/Key";

import { apiRequest } from "../utils/api";
import { ArrayEntity, Team, Project, Stage, EnvOption } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useEnv } from "../hooks/env";
import { useRequest } from "../hooks/utils";
import { useAuth } from "../hooks/auth";

import TeamTab from "../components/TeamTab";
import ProjectTab from "../components/ProjectTab";
import StageTab from "../components/StageTab";

const INDENT = {
  team: 1,
  project: 3,
  stage: 5,
};

interface Expanded {
  team: boolean;
  project: boolean;
  stage: boolean;
}

const EXPANDED_DEFAULT: Expanded = {
  team: true,
  project: false,
  stage: false,
};

const fetchAllData = async () => {
  const res = await apiRequest("all", { method: "GET" });
  const allData: ArrayEntity = res;
  return allData;
}


export default function EnvRoot() {
  const [tab, setTab] = React.useState(0);

  const handleChange = (_: any, tab: number) => {
    setTab(tab);
  };

  const { data, loading, error, executeRequest } = useRequest<ArrayEntity>({
    requestPromise: fetchAllData,
  });

  useEffect(() => {
    executeRequest();
  }, []);

  const { env, options, dispatch } = useEnv(data);

  const handleChoose = (key: string, value: string) =>
    dispatch({ type: "chooseOption", payload: { key, value } });

  const handleChooseTeam = (value: Team) => () =>
    handleChoose("team", value.key);

  const handleChooseProject = (value: Project) => () =>
    handleChoose("project", value.key);

  const handleChooseStage = (value: Stage) => () =>
    handleChoose("stage", value.key);

  const handleOnQuickSwitch = (e: React.SyntheticEvent, newValue: any) => {
    // need to pull the correct values!
    if (newValue) handleChoose(newValue.type, newValue.key);
  };

  useEffect(() => {
    setTab(env.stage ? 2 : env.project ? 1 : 0);
    setExpanded({
      team: !env.stage && !env.project,
      project: env.team && !env.stage,
      stage: !!env.project,
    });
  }, [env]);

  /*
    TODO
    - admin hide/show
    - unify api responses & Team/Project/Stage e.g. stage .project is project key, but response .project above is name
    - loading state (e.g. disable)
    - error messages
    - form conditionals
    - get state from URL
    - console errors
    - stop polluting env state with options (i.e. we had path, label & desc)
  */

  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn]);

  const [expanded, setExpanded] = useState(EXPANDED_DEFAULT);
  const handleOnExpand = (type: keyof Expanded) => () => {
    setExpanded((o) => ({ ...o, [type]: !o[type] }));
  };

  const COLLAPSED_WIDTH = 2;
  const teamWidth = expanded["team"]
    ? (12 -
        (expanded["project"] ? 0 : COLLAPSED_WIDTH) -
        (expanded["stage"] ? 0 : COLLAPSED_WIDTH)) /
      (1 + (expanded["project"] ? 1 : 0) + (expanded["stage"] ? 1 : 0))
    : COLLAPSED_WIDTH;

  const projectWidth = expanded["project"]
    ? (12 -
        (expanded["team"] ? 0 : COLLAPSED_WIDTH) -
        (expanded["stage"] ? 0 : COLLAPSED_WIDTH)) /
      (1 + (expanded["team"] ? 1 : 0) + (expanded["stage"] ? 1 : 0))
    : COLLAPSED_WIDTH;

  const stageWidth = expanded["stage"]
    ? (12 -
        (expanded["project"] ? 0 : COLLAPSED_WIDTH) -
        (expanded["team"] ? 0 : COLLAPSED_WIDTH)) /
      (1 + (expanded["project"] ? 1 : 0) + (expanded["team"] ? 1 : 0))
    : COLLAPSED_WIDTH;

  return (
    <EnvContext.Provider value={{ env, dispatch }}>
      <Box sx={{ width: "100%" }}>
        <AppBar position="static">
          <Toolbar sx={{ flexWrap: "wrap" }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <KeyIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Portunus
            </Typography>
            <Typography variant="body1" component="div">
              {(user || {}).email}
            </Typography>
            <Button color="inherit" onClick={() => logout()}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
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
            <Box sx={{ display: "flex" }}>
              <Typography variant="h6">
                {env.team ? "Current:" : "Choose a team/project/stage"}
              </Typography>
              <Breadcrumbs aria-label="breadcrumb">
                {env.team?.name && (
                  <Button onClick={() => setTab(0)}>{env.team.name}</Button>
                )}
                {env.project?.project && (
                  <Button onClick={() => setTab(1)}>
                    {env.project.project}
                  </Button>
                )}
                {env.stage?.stage && (
                  <Button onClick={() => setTab(2)}>{env.stage.stage}</Button>
                )}
              </Breadcrumbs>
            </Box>
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
                    o.key.toLowerCase().indexOf(lc) >= 0 ||
                    o.path.toLowerCase().indexOf(lc) >= 0 ||
                    (o.name && o.name.toLowerCase().indexOf(lc) >= 0) ||
                    (o.team && o.team.toLowerCase().indexOf(lc) >= 0) ||
                    (o.project && o.project.toLowerCase().indexOf(lc) >= 0) ||
                    (o.stage && o.stage.toLowerCase().indexOf(lc) >= 0)
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
            <Box>
              <Grid container spacing={1} sx={{ p: 1, flexWrap: { xs: "wrap", md: "nowrap"}  }}>
                <Grid
                  item
                  xs={12}
                  md={teamWidth}
                  sx={{ transition: "all ease 0.5s", p: 1 }}
                >
                  <Button
                    variant="outlined"
                    endIcon={
                      expanded["team"] ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    }
                    onClick={handleOnExpand("team")}
                    fullWidth
                  >
                    Team
                  </Button>
                  {env.team && env.team.name}
                  {expanded["team"] && (
                    <TeamTab
                      handleChooseTeam={handleChooseTeam}
                      handleChooseProject={handleChooseProject}
                    />
                  )}
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid
                  item
                  xs={12}
                  md={projectWidth}
                  sx={{ transition: "all ease 0.5s", p: 1 }}
                >
                  <Button
                    variant="outlined"
                    disabled={!env.team}
                    endIcon={
                      expanded["project"] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    }
                    onClick={handleOnExpand("project")}
                    fullWidth
                  >
                    Project
                  </Button>
                  {env.project && env.project.project}
                  {expanded["project"] && (
                    <ProjectTab
                      handleChooseProject={handleChooseProject}
                      handleChooseStage={handleChooseStage}
                    />
                  )}
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid
                  item
                  xs={12}
                  md={stageWidth}
                  sx={{ transition: "all ease 0.5s", p: 1 }}
                >
                  <Button
                    variant="outlined"
                    disabled={!env.project}
                    endIcon={
                      expanded["stage"] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )
                    }
                    onClick={handleOnExpand("stage")}
                    fullWidth
                  >
                    Stage
                  </Button>
                  {env.stage && env.stage.stage}
                  {expanded["stage"] && (
                    <StageTab handleChooseStage={handleChooseStage} />
                  )}
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </EnvContext.Provider>
  );
}
