import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

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
    removeUserFromTeamData,
    handleOnRemoveUserFromTeam,
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
              onChange={handleOnNewTeamChange}
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
                    items={(teamUserData.items as UserType[]) || []}
                    titleKey="email"
                    onItemRemove={handleOnRemoveUserFromTeam}
                    confirmCount={1}
                  />
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

export default TeamTab;
