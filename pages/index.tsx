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

  // start STAGE specific
  const fetchVarData = useCallback(async ({ team, project, stage }) => {
    const res = await apiRequest(
      `env?team=${team.key}&project=${project.project}&stage=${stage.stage}`,
      { method: "GET" }
    );
    const vars = res;
    return vars;
  }, []);

  const {
    data: varData,
    loading: varLoading,
    error: varError,
    executeRequest: varExecuteRequest,
  } = useRequest<any>({
    requestPromise: fetchVarData,
  });
  useEffect(() => {
    // though it depends on these 3, only refetch when stage changes
    if (env.team && env.project && env.stage) {
      varExecuteRequest(env);
    }
  }, [env.stage]);

  const STAGE_FIELDS: Field[] = useMemo(
    () => [
      {
        key: "name",
        label: "Stage Name",
        validation: "name",
        materialProps: { variant: "standard", required: true },
      },
    ],
    []
  );

  const {
    form: stageForm,
    getFormAsObject: getStageObject,
    dispatch: stageDispatch,
  } = useForm(STAGE_FIELDS);

  const stageOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stageDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewStage = useCallback(async () => {
    if (env.team && env.project) {
      const { key, stage } = await apiRequest("/stage", {
        method: "POST",
        body: JSON.stringify({
          team: env.team.key,
          project: env.project.project,
          ...getStageObject(),
        }),
      });
      return { key, stage, team: env.team.key, project: env.project.key };
    }
  }, [env.team, env.project, getStageObject]);

  const {
    data: createStageData,
    loading: createStageLoading,
    error: createStageError,
    executeRequest: createStageExecuteRequest,
  } = useRequest<any>({
    requestPromise: createNewStage,
  });

  const handleOnCreateStage = () => createStageExecuteRequest();

  useEffect(() => {
    if (createStageData && createStageData.key && !createStageError) {
      dispatch({ type: "addStage", payload: createStageData });
    }
  }, [createStageData, createStageError]);

  const deleteStage = useCallback(async (stage: Stage) => {
    const { key, name } = await apiRequest("/stage", {
      method: "DELETE",
      body: JSON.stringify({ stage: stage.key }),
    });
    return { key, name };
  }, []);

  const {
    data: deleteStageData,
    loading: deleteStageLoading,
    error: deleteStageError,
    executeRequest: deleteStageExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteStage,
  });

  const handleOnDeleteStage = (stage: Stage) =>
    deleteStageExecuteRequest(stage);

  useEffect(() => {
    if (deleteStageData) {
      dispatch({ type: "deleteStage", payload: deleteStageData });
    }
  }, [deleteStageData]);

  // const editStage = useCallback(async ({ name, stage }) => {
  //   await apiRequest("/stage", {
  //     method: "PUT",
  //     body: JSON.stringify({ stage: stage.key, name }),
  //   });
  //   return { key: stage.key, name };
  // }, []);

  // const {
  //   data: editStageData,
  //   loading: editStageLoading,
  //   error: editStageError,
  //   executeRequest: editStageExecuteRequest,
  // } = useRequest<any>({
  //   requestPromise: editStage,
  // });

  // const handleOnEditStage = (newName: string, stage: Stage) =>
  //   editStageExecuteRequest({ name: newName, stage });

  // useEffect(() => {
  //   if (editStageData) {
  //     dispatch({ type: "editStage", payload: editStageData });
  //   }
  // }, [editStageData]);
  // end STAGE specific

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
              {env.team && env.project && (
                <Grid item xs={12} md={4}>
                  <InteractiveList
                    subheader="Manage Stages"
                    selected={env.stage}
                    items={env.stages.filter(
                      (o) => o.project === env.project?.key
                    )}
                    titleKey="stage"
                    onItemClick={handleChooseStage}
                    // onItemEdit={handleOnEditStage}
                    onItemRemove={handleOnDeleteStage}
                    confirmCount={0}
                  />
                  {!NEXT_PUBLIC_READ_ONLY && (
                    <Box sx={{ display: "flex" }}>
                      <Form
                        fields={STAGE_FIELDS}
                        form={stageForm}
                        onChange={stageOnChange}
                      />
                      <Button
                        onClick={handleOnCreateStage}
                        disabled={createStageLoading}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </Grid>
              )}

              <Grid item xs={12} md={8}>
                {env.team && env.project && env.stage ? (
                  <React.Fragment>
                    <h2>Current Stage: {env.stage.stage}</h2>
                    {varLoading && <CircularProgress />}
                    {!varLoading && varError && varError.message}
                    {!varLoading && !varError && varData && (
                      <div>
                        {Object.entries(varData.vars).map(([key, value]) => (
                          <div>
                            <strong>{key}:</strong> &nbsp; {value}
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ) : (
                  <h2>Choose a stage</h2>
                )}
              </Grid>
            </TabPanel>
            <TabPanel value={tab} index={3}>
              The Vars!
            </TabPanel>
          </Box>
        )}
      </Box>
    </EnvContext.Provider>
  );
}
