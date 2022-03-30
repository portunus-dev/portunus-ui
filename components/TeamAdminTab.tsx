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

const TeamAdminTab = () => {
  const { env, setToast } = useContext(EnvContext);

  const {
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
  }, [
    env.team,
    teamUserExecuteRequest,
    addUserToTeamData,
    removeUserFromTeamData,
  ]);

  // catch all error toast
  useEffect(() => {
    if (
      (!teamUserLoading && teamUserError) ||
      (!addUserToTeamLoading && addUserToTeamError) ||
      (!removeUserFromTeamLoading && removeUserFromTeamError)
    ) {
      setToast({
        content: (
          <Alert severity="error">
            {teamUserError?.message ||
              addUserToTeamError?.message ||
              removeUserFromTeamError?.message}
          </Alert>
        ),
      });
    }
  }, [
    setToast,
    teamUserLoading,
    teamUserError,
    addUserToTeamLoading,
    addUserToTeamError,
    removeUserFromTeamLoading,
    removeUserFromTeamError,
  ]);

  return (
    <Box>
      {env.team && (
        <Box>
          {(teamUserLoading ||
            addUserToTeamLoading ||
            removeUserFromTeamLoading) && <CircularProgress />}
          {!teamUserError && teamUserData && (
            <Box>
              <InteractiveList
                subheader="Users"
                items={(teamUserData.items as UserType[]) || []}
                titleKey="email"
                onItemRemove={handleOnRemoveUserFromTeam}
                confirmCount={1}
              />
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
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TeamAdminTab;
