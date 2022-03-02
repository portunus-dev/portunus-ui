import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import { Team, Project, UserType } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useTeam } from "../hooks/team";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type TeamTabProps = {
  handleChooseTeam: (value: Team) => () => void;
  handleChooseProject: (value: Project) => () => void;
};

const TeamTab = ({ handleChooseTeam, handleChooseProject }: TeamTabProps) => {
  const { env, setToast } = useContext(EnvContext);

  const {
    TEAM_FIELDS,
    teamForm,
    handleOnNewTeamChange,
    createTeamLoading,
    createTeamError,
    handleOnCreateTeam,
    deleteTeamLoading,
    deleteTeamError,
    handleOnDeleteTeam,
    editTeamLoading,
    editTeamError,
    handleOnEditTeam,
    teamUserData,
    teamUserLoading,
    teamUserError,
    teamUserExecuteRequest,
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
    handleOnNewTeamUserChange,
  } = useTeam();

  useEffect(() => {
    if (
      env.team ||
      (env.team && (addUserToTeamData || removeUserFromTeamData))
    ) {
      teamUserExecuteRequest(env.team);
    }
  }, [env.team, teamUserExecuteRequest, addUserToTeamData, removeUserFromTeamData]);

  // catch all error toast
  useEffect(() => {
    if (
      (!createTeamLoading && createTeamError) ||
      (!editTeamLoading && editTeamError) ||
      (!deleteTeamLoading && deleteTeamError) ||
      (!teamUserLoading && teamUserError) ||
      (!addUserToTeamLoading && addUserToTeamError) ||
      (!removeUserFromTeamLoading && removeUserFromTeamError)
    ) {
      setToast({ 
        content: (
          <Alert severity="error">
            {createTeamError?.message ||
              editTeamError?.message ||
              deleteTeamError?.message ||
              teamUserError?.message ||
              addUserToTeamError?.message ||
              removeUserFromTeamError?.message}
          </Alert>
        )}
      )
    }
  }, [
      setToast,
      createTeamLoading,
      createTeamError,
      editTeamLoading,
      editTeamError,
      teamUserLoading,
      deleteTeamError,
      deleteTeamLoading,
      teamUserError,
      addUserToTeamLoading,
      addUserToTeamError,
      removeUserFromTeamLoading,
      removeUserFromTeamError,
  ])

  return (
    <Grid container sx={{ p: 1 }}>
      <Grid item xs={12}>
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
              onChange={handleOnNewTeamChange}
            />
            <Button onClick={handleOnCreateTeam} disabled={createTeamLoading}>
              Add
            </Button>
          </Box>
        )}
      </Grid>

      <Grid item xs={12}>
        {env.team && (
          <div>
            {!teamUserError && teamUserData && (
              <Box>
                <InteractiveList
                  subheader="Users"
                  items={(teamUserData.items as UserType[]) || []}
                  titleKey="email"
                  onItemRemove={handleOnRemoveUserFromTeam}
                  confirmCount={1}
                />
                {(teamUserLoading ||
                  addUserToTeamLoading ||
                  removeUserFromTeamLoading) && <CircularProgress />}
                {!NEXT_PUBLIC_READ_ONLY && (
                  <Box sx={{ display: "flex" }}>
                    <Form
                      fields={TEAM_USER_FIELDS}
                      form={teamUserForm}
                      onChange={handleOnNewTeamUserChange}
                    />
                    <Button
                      onClick={handleOnAddUserToTeam}
                      disabled={addUserToTeamLoading}
                    >
                      Add
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </div>
        )}
      </Grid>
    </Grid>
  );
};

export default TeamTab;
