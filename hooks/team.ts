import React, { useContext, useCallback, useEffect } from "react";

import { apiRequest } from "../utils/api";
import { Team, UserType, AuditHistory } from "../utils/types";

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
  const { key, name } = await apiRequest("team", {
    method: "DELETE",
    body: JSON.stringify({ team: team.key }),
  });
  return { key, name };
};

const editTeamName = async ({ name, team }: { name: string; team: Team }) => {
  await apiRequest("team", {
    method: "PUT",
    body: JSON.stringify({ team: team.key, name }),
  });
  return { key: team.key, name };
};

const editTeamAudit = async ({
  audit,
  team,
}: {
  audit: boolean;
  team: Team;
}) => {
  await apiRequest("team/audit", {
    method: "PUT",
    body: JSON.stringify({ team: team.key, audit }),
  });
  return { key: team.key, audit };
};

const fetchTeamAuditData = async (team: Team) => {
  const res = await apiRequest(`audit?type=team&key=${team.key}`, {
    method: "GET",
  });
  const auditHistory: AuditHistory[] = res.auditHistory;
  auditHistory.sort(
    (a, b) => new Date(b.start).valueOf() - new Date(a.start).valueOf()
  );
  console.log("res from api!", res);
  return auditHistory;
};

const fetchTeamUserData = async (team: Team) => {
  const res = await apiRequest(`users?team=${team.key}`, {
    method: "GET",
  });
  const vars = res;
  return vars;
};

const TEAM_USER_FIELDS: Field[] = [
  {
    key: "email",
    label: "User Email",
    invalid: "email",
    materialProps: { variant: "standard", required: true },
  },
];

export const useTeam = () => {
  const { dispatch: envDispatch, env } = useContext(EnvContext);

  const {
    form: teamForm,
    getFormAsObject: getTeamObject,
    dispatch: teamDispatch,
  } = useForm(TEAM_FIELDS);

  const handleOnNewTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    teamDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewTeam = useCallback(
    async (body) => {
      const { key, name } = await apiRequest("team", {
        method: "POST",
        body: JSON.stringify(getTeamObject()),
      });
      return { key, name };
    },
    [getTeamObject]
  );

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
    data: editTeamNameData,
    loading: editTeamNameLoading,
    error: editTeamNameError,
    executeRequest: editTeamNameExecuteRequest,
  } = useRequest<any>({
    requestPromise: editTeamName,
  });

  const handleOnEditTeamName = (newName: string, team: Team) =>
    editTeamNameExecuteRequest({ name: newName, team });

  useEffect(() => {
    if (editTeamNameData) {
      envDispatch({ type: "editTeam", payload: editTeamNameData });
    }
  }, [editTeamNameData]);

  const {
    data: editTeamAuditData,
    loading: editTeamAuditLoading,
    error: editTeamAuditError,
    executeRequest: editTeamAuditExecuteRequest,
  } = useRequest<any>({
    requestPromise: editTeamAudit,
  });

  const handleOnEditTeamAudit = (newAudit: string, team: Team) =>
    editTeamAuditExecuteRequest({ audit: newAudit, team });

  useEffect(() => {
    if (editTeamAuditData) {
      envDispatch({ type: "editTeam", payload: editTeamAuditData });
    }
  }, [editTeamAuditData]);

  const {
    data: teamAuditData,
    loading: teamAuditLoading,
    error: teamAuditError,
    executeRequest: teamAuditExecuteRequest,
  } = useRequest<AuditHistory[]>({
    requestPromise: fetchTeamAuditData,
  });

  // user management
  // TODO: isolate these hooks
  const {
    data: teamUserData,
    loading: teamUserLoading,
    error: teamUserError,
    executeRequest: teamUserExecuteRequest,
  } = useRequest<any>({
    requestPromise: fetchTeamUserData,
  });

  const { form: teamUserForm, dispatch: teamUserDispatch } =
    useForm(TEAM_USER_FIELDS);

  const handleOnNewTeamUserChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    teamUserDispatch({ type: e.target.id, payload: e.target.value });
  };

  const addUser = useCallback(async () => {
    if (env.team) {
      await apiRequest("user/team", {
        method: "PUT",
        body: JSON.stringify({
          team: env.team.key,
          userEmail: teamUserForm.email.value,
        }),
      });
      return { key: env.team.key, userEmail: teamUserForm.email.value };
    }
  }, [teamUserForm, env.team]);

  const {
    data: addUserToTeamData,
    loading: addUserToTeamLoading,
    error: addUserToTeamError,
    executeRequest: addUserToTeamExecuteRequest,
  } = useRequest<any>({
    requestPromise: addUser,
  });

  const handleOnAddUserToTeam = () => addUserToTeamExecuteRequest();

  const removeUser = useCallback(
    async (user: UserType) => {
      if (env.team) {
        await apiRequest("user/team", {
          method: "DELETE",
          body: JSON.stringify({ team: env.team.key, userEmail: user.email }),
        });
        return { key: env.team.key, userEmail: user.email };
      }
    },
    [env.team]
  );

  const {
    data: removeUserFromTeamData,
    loading: removeUserFromTeamLoading,
    error: removeUserFromTeamError,
    executeRequest: removeUserFromTeamExecuteRequest,
  } = useRequest<any>({
    requestPromise: removeUser,
  });

  const handleOnRemoveUserFromTeam = (user: UserType) =>
    removeUserFromTeamExecuteRequest(user);

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
    editTeamName,
    editTeamNameData,
    editTeamNameLoading,
    editTeamNameError,
    handleOnEditTeamName,
    editTeamAudit,
    editTeamAuditData,
    editTeamAuditLoading,
    editTeamAuditError,
    handleOnEditTeamAudit,
    teamAuditData,
    teamAuditLoading,
    teamAuditError,
    teamAuditExecuteRequest,
    fetchTeamUserData,
    teamUserData,
    teamUserLoading,
    teamUserError,
    teamUserExecuteRequest,
    handleOnNewTeamUserChange,
    handleOnAddUserToTeam,
    addUserToTeamData,
    addUserToTeamLoading,
    addUserToTeamError,
    handleOnRemoveUserFromTeam,
    removeUserFromTeamData,
    removeUserFromTeamLoading,
    removeUserFromTeamError,
    TEAM_USER_FIELDS,
    teamUserForm,
  };
};
