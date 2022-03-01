import React, { useContext, useCallback, useEffect } from "react";

import { apiRequest } from "../utils/api";
import { Team } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useForm, Field, useRequest } from "../hooks/utils";

const TEAM_FIELDS: Field[] = [
  {
    key: "name",
    label: "Team Name",
    invalid: "name",
    materialProps: { variant: "standard", required: true },
  },
];

const deleteTeam = async (team: Team) => {
  const { key, name } = await apiRequest("/team", {
    method: "DELETE",
    body: JSON.stringify({ team: team.key }),
  });
  return { key, name };
};

const editTeam = async ({ name, team }: { name: string; team: Team }) => {
  await apiRequest("/team", {
    method: "PUT",
    body: JSON.stringify({ team: team.key, name }),
  });
  return { key: team.key, name };
};

const fetchTeamUserData = async (team: Team) => {
  const res = await apiRequest(`users?team=${team.key}`, {
    method: "GET",
  });
  const vars = res;
  return vars;
};

export const useTeam = () => {
  const { dispatch: envDispatch } = useContext(EnvContext);

  const {
    form: teamForm,
    getFormAsObject: getTeamObject,
    dispatch: teamDispatch,
  } = useForm(TEAM_FIELDS);

  const handleOnNewTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      envDispatch({ type: "addTeam", payload: createTeamData });
    }
  }, [createTeamData, createTeamError]);

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
      envDispatch({ type: "deleteTeam", payload: deleteTeamData });
    }
  }, [deleteTeamData]);

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
      envDispatch({ type: "editTeam", payload: editTeamData });
    }
  }, [editTeamData]);

  const {
    data: teamUserData,
    loading: teamUserLoading,
    error: teamUserError,
    executeRequest: teamUserExecuteRequest,
  } = useRequest<any>({
    requestPromise: fetchTeamUserData,
  });

  return {
    TEAM_FIELDS,
    teamForm,
    getTeamObject,
    teamDispatch,
    handleOnNewTeamChange,
    createNewTeam,
    createTeamData,
    createTeamLoading,
    createTeamError,
    handleOnCreateTeam,
    deleteTeam,
    deleteTeamData,
    deleteTeamLoading,
    deleteTeamError,
    handleOnDeleteTeam,
    editTeam,
    editTeamData,
    editTeamLoading,
    editTeamError,
    handleOnEditTeam,
    fetchTeamUserData,
    teamUserData,
    teamUserLoading,
    teamUserError,
    teamUserExecuteRequest,
  };
};
