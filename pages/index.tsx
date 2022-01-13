import React, { useState, useEffect, useMemo, useCallback } from "react";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import AppBar from "@mui/material/AppBar";
import CircularProgress from "@mui/material/CircularProgress";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import { apiRequest } from "../utils/api";
import { ArrayEntity, Team, Project, Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useEnv } from "../hooks/env";
import { useForm, Field, useRequest } from "../hooks/utils";

import InteractiveList from "../components/InteractiveList";
import Form from "../components/Form";
import TeamTab from "../components/TeamTab";
import ProjectTab from "../components/ProjectTab";
import StageTab from "../components/StageTab";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Grid container spacing={1} sx={{ p: 3 }}>
          {children}
        </Grid>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const INDENT = {
  team: 1,
  project: 3,
  stage: 5,
};

type EnvType = "team" | "project" | "stage";

type EnvOption = {
  type: EnvType;
  label: string;
  path: string;
} & (Team | Project | Stage);

export default function EnvRoot() {
  const [tab, setTab] = React.useState(0);

  const handleChange = (_: any, tab: number) => {
    setTab(tab);
  };

  const fetchAllData = useCallback(async () => {
    const res = await apiRequest("all", { method: "GET" });
    const allData: ArrayEntity = res;
    return allData;
  }, []);

  const { data, loading, error, executeRequest } = useRequest<ArrayEntity>({
    requestPromise: fetchAllData,
  });

  useEffect(() => {
    executeRequest();
  }, []);

  const { env, dispatch } = useEnv(data);

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
  }, [env]);

  /*
    TODO
    - breakout this file
    - admin hide/show
    - unify api responses & Team/Project/Stage e.g. stage .project is project key, but response .project above is name
    - loading state (e.g. disable)
    - error messages
    - form conditionals
    - get state from URL
    - console errors
    - stop polluting env state with options (i.e. we had path, label & desc)
  */

  const [portunusJwt, setPortunusJwt] = useState(
    (typeof window !== "undefined" && localStorage.getItem("portunus-jwt")) ||
      ""
  );
  const handleOnJwtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPortunusJwt(e.target.value);
  };
  const handleOnSetJwt = () => {
    if (typeof window !== "undefined")
      localStorage.setItem("portunus-jwt", portunusJwt);
  };

  const { NEXT_PUBLIC_READ_ONLY } = process.env;

  return (
    <EnvContext.Provider value={{ env, dispatch }}>
      <Box sx={{ width: "100%" }}>
        <AppBar position="static">
          <Toolbar>
            {/* THIS CAUSED A DEPENDENCY CRASH? <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <KeyIcon />
          </IconButton> */}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Portunus
            </Typography>
            <Box>
              <TextField
                variant="standard"
                value={portunusJwt}
                onChange={handleOnJwtChange}
                placeholder="Portunus JWT"
              />
              <Button variant="contained" onClick={handleOnSetJwt}>
                Set JWT
              </Button>
            </Box>
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
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tab}
                onChange={handleChange}
                aria-label="basic tabs example"
                variant="fullWidth"
                scrollButtons="auto"
                centered
              >
                <Tab label="Team" {...a11yProps(1)} />
                <Tab label="Project" disabled={!env.team} {...a11yProps(2)} />
                <Tab label="Stage" disabled={!env.project} {...a11yProps(3)} />
                {/* <Tab label="Vars" disabled={!env.stage} {...a11yProps(4)} /> */}
              </Tabs>
            </Box>
            <TabPanel value={tab} index={0}>
              <TeamTab
                handleChooseTeam={handleChooseTeam}
                handleChooseProject={handleChooseProject}
              />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <ProjectTab
                handleChooseProject={handleChooseProject}
                handleChooseStage={handleChooseStage}
              />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <StageTab handleChooseStage={handleChooseStage} />
            </TabPanel>
          </Box>
        )}
      </Box>
    </EnvContext.Provider>
  );
}
