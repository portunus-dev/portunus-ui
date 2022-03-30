import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";

import { Team, Project, UserType } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useTeam } from "../hooks/team";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type TeamDropdownProps = {
  handleChooseTeam: (value: Team) => void;
};

const TeamDropdown = ({ handleChooseTeam }: TeamDropdownProps) => {
  const { env, setToast, openCreateModal } = useContext(EnvContext);

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
        ),
      });
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
  ]);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnTeamClick = (team: Team) => (e: React.MouseEvent) => {
    handleClose();
    handleChooseTeam(team);
  };

  const handleOnOpenCreateModal = () => openCreateModal("team");
  return (
    <Box>
      {env.teams.length ? (
        <React.Fragment>
          <Button
            id="account-button"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            startIcon={<PeopleIcon />}
            endIcon={<ExpandMoreIcon />}
            sx={{ textTransform: "none" }}
          >
            {env.team?.name}
          </Button>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "account-button",
              sx: { pb: 0, width: "400px" },
            }}
          >
            <InteractiveList
              subheader="Manage Teams"
              selected={env.team}
              items={env.teams || []}
              titleKey="name"
              onItemClick={handleOnTeamClick}
              onItemRemove={handleOnDeleteTeam}
              onItemEdit={handleOnEditTeam}
              confirmCount={2}
            />
            <MenuItem onClick={handleOnOpenCreateModal}>
              <Button>Add Team</Button>
            </MenuItem>
          </Menu>
        </React.Fragment>
      ) : (
        <Button onClick={handleOnOpenCreateModal}>Add Team</Button>
      )}
    </Box>
  );
};

export default TeamDropdown;
