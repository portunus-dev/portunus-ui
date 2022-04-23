import React, { useContext, useEffect, useCallback } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";

import AuditHistoryList from "./AuditHistoryList";
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
    editTeamNameLoading,
    editTeamNameError,
    handleOnEditTeamName,
    editTeamAuditLoading,
    editTeamAuditError,
    handleOnEditTeamAudit,
    teamAuditData,
    teamAuditLoading,
    teamAuditError,
    teamAuditExecuteRequest,
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
      teamAuditExecuteRequest(env.team);
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
      (!createTeamLoading && createTeamError) ||
      (!editTeamNameLoading && editTeamNameError) ||
      (!editTeamAuditLoading && editTeamAuditError) ||
      (!deleteTeamLoading && deleteTeamError) ||
      (!teamUserLoading && teamUserError) ||
      (!addUserToTeamLoading && addUserToTeamError) ||
      (!removeUserFromTeamLoading && removeUserFromTeamError)
    ) {
      setToast({
        content: (
          <Alert severity="error">
            {createTeamError?.message ||
              editTeamNameError?.message ||
              editTeamAuditError?.message ||
              deleteTeamError?.message ||
              teamUserError?.message ||
              addUserToTeamError?.message ||
              removeUserFromTeamError?.message}
          </Alert>
        ),
      });
    }
  }, [
    setToast,
    createTeamLoading,
    createTeamError,
    editTeamNameLoading,
    editTeamNameError,
    editTeamAuditLoading,
    editTeamAuditError,
    teamUserLoading,
    deleteTeamError,
    deleteTeamLoading,
    teamUserError,
    addUserToTeamLoading,
    addUserToTeamError,
    removeUserFromTeamLoading,
    removeUserFromTeamError,
  ]);

  const handleOnTeamAuditToggle = useCallback(
    (e) => {
      console.log(e.target.checked, env.team);
      if (env.team) {
        handleOnEditTeamAudit(e.target.checked ? "true" : "false", env.team);
      }
    },
    [env.team]
  );

  console.log(teamAuditData, teamAuditError);
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
          onItemEdit={handleOnEditTeamName}
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
          <Box>
            {!teamUserError && teamUserData && (
              <Box>
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
              </Box>
            )}
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      env.team.audit === "true" || env.team.audit ? true : false
                    }
                    disabled={editTeamAuditLoading}
                    onChange={handleOnTeamAuditToggle}
                  />
                }
                label="team auditing"
              />
            </FormGroup>
            {!teamAuditLoading && teamAuditData?.length === 0 && (
              <Typography component="div" variant="body2">
                No Audit Data Found
              </Typography>
            )}
            {!teamAuditError && teamAuditData && (
              <Box>
                <AuditHistoryList auditHistory={teamAuditData} />
              </Box>
            )}
            {(teamUserLoading ||
              addUserToTeamLoading ||
              removeUserFromTeamLoading) && <CircularProgress />}
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default TeamTab;
