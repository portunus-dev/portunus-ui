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
  const { env } = useContext(EnvContext);

  const {
    TEAM_FIELDS,
    teamForm,
    handleOnNewTeamChange,
    createTeamLoading,
    handleOnCreateTeam,
    handleOnDeleteTeam,
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
  }, [env.team, addUserToTeamData, removeUserFromTeamData]);

  return (
    <Grid container spacing={1} sx={{ p: 3 }}>
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
            {!teamUserLoading && teamUserError && teamUserError.message && (
              <Alert severity="error">{teamUserError.message}</Alert>
            )}
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
                {!addUserToTeamLoading &&
                  addUserToTeamError &&
                  addUserToTeamError.message && (
                    <Alert severity="error">
                      {addUserToTeamError.message}
                    </Alert>
                  )}
                {!removeUserFromTeamLoading &&
                  removeUserFromTeamError &&
                  removeUserFromTeamError.message && (
                    <Alert severity="error">
                      {removeUserFromTeamError.message}
                    </Alert>
                  )}
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
