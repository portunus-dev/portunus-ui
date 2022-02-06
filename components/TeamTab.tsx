import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { Team, Project } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useTeam } from "../hooks/team";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type TeamTabProps = {
  handleChooseTeam: (value: Team) => () => void;
  handleChooseProject: (value: Project) => () => void;
};

export default ({ handleChooseTeam, handleChooseProject }: TeamTabProps) => {
  const { env, dispatch } = useContext(EnvContext);

  const {
    TEAM_FIELDS,
    teamForm,
    teamOnChange,
    createTeamLoading,
    handleOnCreateTeam,
    handleOnDeleteTeam,
    handleOnEditTeam,
    teamUserData,
    teamUserLoading,
    teamUserError,
    teamUserExecuteRequest,
  } = useTeam({ envDispatch: dispatch })

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
