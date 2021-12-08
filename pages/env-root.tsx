import React, { useEffect, useMemo } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import AppBar from "@mui/material/AppBar";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import ThisList from "../components/List";
import { useEnv } from "../hooks/env";
import { generateTestEnv } from "../utils/test-data";
import { ArrayEntity, Team, Project, Stage } from "../utils/types";

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

const sleep = (time: number) => {
  return new Promise(async (resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const getServerSideProps = async () => {
  await sleep(2000);
  return { props: generateTestEnv() };
};

type EnvType = "team" | "project" | "stage";

type EnvOption = {
  type: EnvType;
  label: string;
  path: string;
} & (Team | Project | Stage);

const BASE_FIELDS = [
  { label: "Username", key: "username" },
  {
    label: "Email",
    key: "email",
    include: (signUp) => signUp,
    helperText: "format: abc@abc.com",
    validation: "email",
    invalidText: "Please provide a valid email address",
  },
  { label: "Password", key: "password", type: "password" },
];

export default function EnvRoot({ teams, projects, stages }: ArrayEntity) {
  // console.log("INITS=====>", teams, projects, stages);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { env, dispatch } = useEnv({ teams, projects, stages });

  const handleChoose = (key: string, value: string) =>
    dispatch({ type: "chooseOption", payload: { key, value } });

  const handleChooseTeam = (value: Team) => () =>
    handleChoose("team", value.key);

  const handleChooseProject = (value: Project) => () =>
    handleChoose("project", value.key);

  const handleChooseStage = (value: Stage) => () =>
    handleChoose("stage", value.key);

  const INDENT = {
    team: 1,
    project: 3,
    stage: 5,
  };

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

  const handleOnQuickSwitch = (e: React.SyntheticEvent, newValue: any) => {
    // need to pull the correct values!
    console.log(e, newValue);
    if (newValue) handleChoose(newValue.type, newValue.key);
  };

  useEffect(() => {
    setValue(env.stage ? 2 : env.project ? 1 : 0);
  }, [env]);

  /*
    TODO
    - list management component
    - layout
    - KV management
    - get state from URL
    - potential incremental updates? We preload options, so what if they're out of date? We can check every so often or triggered from UI or if there's a failure
    - console errors
    - stop polluting env state with options (i.e. we had path, label & desc)
  */
  return (
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
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 1 }}>
        <Box sx={{ display: "flex" }}>
          <Typography variant="h6">
            {env.team ? "Current:" : "Choose a team/project/stage"}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            {env.team?.name && (
              <Button onClick={() => setValue(0)}>{env.team.name}</Button>
            )}
            {env.project?.project && (
              <Button onClick={() => setValue(1)}>{env.project.project}</Button>
            )}
            {env.stage?.stage && (
              <Button onClick={() => setValue(2)}>{env.stage.stage}</Button>
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
            value={value}
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
        <TabPanel value={value} index={0}>
          <Grid item xs={12} md={4}>
            <ThisList
              subheader="Manage Teams"
              selected={env.team}
              items={env.teams}
              titleKey="name"
              onItemClick={handleChooseTeam}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            {env.team ? (
              <React.Fragment>
                <h2>Current Team: {env.team.name}</h2>
                <ThisList
                  subheader="Your Projects"
                  selected={env.project}
                  items={env.projects.filter((o) => o.team === env.team.key)}
                  titleKey="project"
                  onItemClick={handleChooseProject}
                />
              </React.Fragment>
            ) : (
              <h2>Choose a team</h2>
            )}
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1}>
          {env.team && (
            <Grid item xs={12} md={4}>
              <ThisList
                subheader="Manage Projects"
                selected={env.project}
                items={env.projects.filter((o) => o.team === env.team.key)}
                titleKey="project"
                onItemClick={handleChooseProject}
              />
            </Grid>
          )}
          <Grid item xs={12} md={8}>
            {env.team && env.project ? (
              <React.Fragment>
                <h2>Current Project: {env.project.project}</h2>
                <ThisList
                  subheader="Your Stages"
                  selected={env.stage}
                  items={env.stages.filter(
                    (o) => o.project === env.project.key
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
        <TabPanel value={value} index={2}>
          {env.team && env.project && (
            <Grid item xs={12} md={4}>
              <ThisList
                subheader="Manage Stages"
                selected={env.stage}
                items={env.stages.filter((o) => o.project === env.project.key)}
                titleKey="stage"
                onItemClick={handleChooseStage}
              />
            </Grid>
          )}

          <Grid item xs={12} md={8}>
            {env.team && env.project && env.stage ? (
              <React.Fragment>
                <h2>Current Stage: {env.stage.stage}</h2>
                <div>TODO: Var management</div>
              </React.Fragment>
            ) : (
              <h2>Choose a stage</h2>
            )}
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={3}>
          The Vars!
        </TabPanel>
      </Box>
    </Box>
  );
}