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

export default function EnvRoot({ teams, projects, stages }: ArrayEntity) {
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

  // start TEAM specific
  const TEAM_FIELDS: Field[] = useMemo(
    () => [
      {
        key: "name",
        label: "Team Name",
        validation: "name",
        materialProps: { variant: "standard", required: true },
      },
    ],
    []
  );

  const {
    form: teamForm,
    getFormAsObject: getTeamObject,
    dispatch: teamDispatch,
  } = useForm(TEAM_FIELDS);

  const teamOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    teamDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewTeam = useCallback(async () => {
    const { key, name } = await apiRequest("/team", {
      method: "POST",
      body: JSON.stringify(getTeamObject()),
    });
    return { key, name };
  }, [getTeamObject]);

  const {
    data: createTeamData,
    loading: createTeamLoading,
    error: createTeamError,
    executeRequest: createTeamExecuteRequest,
  } = useRequest<any>({
    requestPromise: createNewTeam,
  });

  const handleOnCreateTeam = () => createTeamExecuteRequest();

  useEffect(() => {
    if (createTeamData && createTeamData.key && !createTeamError) {
      dispatch({ type: "addTeam", payload: createTeamData });
    }
  }, [createTeamData, createTeamError]);

  const deleteTeam = useCallback(async (team: Team) => {
    const { key, name } = await apiRequest("/team", {
      method: "DELETE",
      body: JSON.stringify({ team: team.key }),
    });
    return { key, name };
  }, []);

  const {
    data: deleteTeamData,
    loading: deleteTeamLoading,
    error: deleteTeamError,
    executeRequest: deleteTeamExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteTeam,
  });

  const handleOnDeleteTeam = (team: Team) => deleteTeamExecuteRequest(team);

  useEffect(() => {
    if (deleteTeamData) {
      dispatch({ type: "deleteTeam", payload: deleteTeamData });
    }
  }, [deleteTeamData]);

  const editTeam = useCallback(async ({ name, team }) => {
    await apiRequest("/team", {
      method: "PUT",
      body: JSON.stringify({ team: team.key, name }),
    });
    return { key: team.key, name };
  }, []);

  const {
    data: editTeamData,
    loading: editTeamLoading,
    error: editTeamError,
    executeRequest: editTeamExecuteRequest,
  } = useRequest<any>({
    requestPromise: editTeam,
  });

  const handleOnEditTeam = (newName: string, team: Team) =>
    editTeamExecuteRequest({ name: newName, team });

  useEffect(() => {
    if (editTeamData) {
      dispatch({ type: "editTeam", payload: editTeamData });
    }
  }, [editTeamData]);

  const fetchTeamUserData = useCallback(async (team: Team) => {
    const res = await apiRequest(`users?team=${team.key}`, { method: "GET" });
    const vars = res;
    return vars;
  }, []);

  const {
    data: teamUserData,
    loading: teamUserLoading,
    error: teamUserError,
    executeRequest: teamUserExecuteRequest,
  } = useRequest<any>({
    requestPromise: fetchTeamUserData,
  });

  useEffect(() => {
    if (env.team) {
      teamUserExecuteRequest(env.team);
    }
  }, [env.team]);
  // end TEAM specific

  // start PROJECT specific
  const PROJECT_FIELDS: Field[] = useMemo(
    () => [
      {
        key: "name",
        label: "Project Name",
        validation: "name",
        materialProps: { variant: "standard", required: true },
      },
    ],
    []
  );

  const {
    form: projectForm,
    getFormAsObject: getProjectObject,
    dispatch: projectDispatch,
  } = useForm(PROJECT_FIELDS);

  const projectOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    projectDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewProject = useCallback(async () => {
    if (env.team) {
      const { key, project } = await apiRequest("/project", {
        method: "POST",
        body: JSON.stringify({ team: env.team.key, ...getProjectObject() }),
      });
      return { key, project, team: env.team.key };
    }
  }, [env.team, getProjectObject]);

  const {
    data: createProjectData,
    loading: createProjectLoading,
    error: createProjectError,
    executeRequest: createProjectExecuteRequest,
  } = useRequest<any>({
    requestPromise: createNewProject,
  });

  const handleOnCreateProject = () => createProjectExecuteRequest();

  useEffect(() => {
    if (createProjectData && createProjectData.key && !createProjectError) {
      dispatch({ type: "addProject", payload: createProjectData });
    }
  }, [createProjectData, createProjectError]);

  const deleteProject = useCallback(async (project: Project) => {
    const { key, name } = await apiRequest("/project", {
      method: "DELETE",
      body: JSON.stringify({ project: project.key }),
    });
    return { key, name };
  }, []);

  const {
    data: deleteProjectData,
    loading: deleteProjectLoading,
    error: deleteProjectError,
    executeRequest: deleteProjectExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteProject,
  });

  const handleOnDeleteProject = (project: Project) =>
    deleteProjectExecuteRequest(project);

  useEffect(() => {
    if (deleteProjectData) {
      dispatch({ type: "deleteProject", payload: deleteProjectData });
    }
  }, [deleteProjectData]);

  const editProject = useCallback(async ({ name, project }) => {
    await apiRequest("/project", {
      method: "PUT",
      body: JSON.stringify({ project: project.key, name }),
    });
    return { key: project.key, name };
  }, []);

  const {
    data: editProjectData,
    loading: editProjectLoading,
    error: editProjectError,
    executeRequest: editProjectExecuteRequest,
  } = useRequest<any>({
    requestPromise: editProject,
  });

  const handleOnEditProject = (newName: string, project: Project) =>
    editProjectExecuteRequest({ name: newName, project });

  useEffect(() => {
    if (editProjectData) {
      dispatch({ type: "editProject", payload: editProjectData });
    }
  }, [editProjectData]);
  // end PROJECT specific

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
              <Grid item xs={12} md={4}>
                <InteractiveList
                  subheader="Manage Teams"
                  selected={env.team}
                  items={env.teams || []}
                  titleKey="name"
                  onItemClick={handleChooseTeam}
                  onItemRemove={handleOnDeleteTeam}
                  onItemEdit={handleOnEditTeam}
                  confirmCount={2}
                />
                {!NEXT_PUBLIC_READ_ONLY && (
                  <Box sx={{ display: "flex" }}>
                    <Form
                      fields={TEAM_FIELDS}
                      form={teamForm}
                      onChange={teamOnChange}
                    />
                    <Button
                      onClick={handleOnCreateTeam}
                      disabled={createTeamLoading}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={8}>
                {env.team ? (
                  <React.Fragment>
                    <h2>Current Team: {env.team.name}</h2>
                    <div>
                      {teamUserLoading && <CircularProgress />}
                      {!teamUserLoading &&
                        teamUserError &&
                        teamUserError.message}
                      {!teamUserLoading && !teamUserError && teamUserData && (
                        <div>
                          <InteractiveList
                            subheader="Users"
                            items={teamUserData.items || []}
                            titleKey="email"
                          />
                        </div>
                      )}
                    </div>
                    <InteractiveList
                      subheader="Your Projects"
                      selected={env.project}
                      items={env.projects.filter(
                        (o) => o.team === env.team?.key
                      )}
                      titleKey="project"
                      onItemClick={handleChooseProject}
                      onItemRemove={handleOnDeleteProject}
                      onItemEdit={handleOnEditProject}
                      confirmCount={2}
                    />
                  </React.Fragment>
                ) : (
                  <h2>Choose a team</h2>
                )}
              </Grid>
            </TabPanel>
            <TabPanel value={tab} index={1}>
              {env.team && (
                <Grid item xs={12} md={4}>
                  <InteractiveList
                    subheader="Manage Projects"
                    selected={env.project}
                    items={env.projects.filter((o) => o.team === env.team?.key)}
                    titleKey="project"
                    onItemClick={handleChooseProject}
                    onItemRemove={handleOnDeleteProject}
                    onItemEdit={handleOnEditProject}
                    confirmCount={2}
                  />
                  {!NEXT_PUBLIC_READ_ONLY && (
                    <Box sx={{ display: "flex" }}>
                      <Form
                        fields={PROJECT_FIELDS}
                        form={projectForm}
                        onChange={projectOnChange}
                      />
                      <Button
                        onClick={handleOnCreateProject}
                        disabled={createProjectLoading}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </Grid>
              )}
              <Grid item xs={12} md={8}>
                {env.team && env.project ? (
                  <React.Fragment>
                    <h2>Current project: {env.project.project}</h2>
                    <InteractiveList
                      subheader="Your Stages"
                      selected={env.stage}
                      items={env.stages.filter(
                        (o) => o.project === env.project?.key
                      )}
                      titleKey="stage"
                      onItemClick={handleChooseStage}
                    />
                  </React.Fragment>
                ) : (
                  <h2>Choose a project</h2>
                )}
              </Grid>
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
