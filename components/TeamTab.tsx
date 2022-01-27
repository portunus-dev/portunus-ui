import React, { useMemo, useContext, useCallback, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { apiRequest } from "../utils/api";
import { Team, Project } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useForm, Field, useRequest } from "../hooks/utils";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type TeamTabProps = {
  handleChooseTeam: (value: Team) => () => void;
  handleChooseProject: (value: Project) => () => void;
};

export default ({ handleChooseTeam, handleChooseProject }: TeamTabProps) => {
  const { env, dispatch } = useContext(EnvContext);
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

  return (
    <Grid container spacing={1} sx={{ p: 3 }}>
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
            <Button onClick={handleOnCreateTeam} disabled={createTeamLoading}>
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
              {!teamUserLoading && teamUserError && teamUserError.message}
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
              items={env.projects.filter((o) => o.team === env.team?.key)}
              titleKey="project"
              onItemClick={handleChooseProject}
            />
          </React.Fragment>
        ) : (
          <h2>Choose a team</h2>
        )}
      </Grid>
    </Grid>
  );
};
