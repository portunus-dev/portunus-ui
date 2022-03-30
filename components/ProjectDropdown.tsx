import React, { useContext, useEffect } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { Project } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useProject } from "../hooks/project";

import InteractiveList from "./InteractiveList";

type ProjectTabProps = {
  handleChooseProject: (value: Project) => void;
};

const ProjectTab = ({ handleChooseProject }: ProjectTabProps) => {
  const { env, setToast, openCreateModal } = useContext(EnvContext);

  const {
    PROJECT_FIELDS,
    projectForm,
    handleOnNewProjectChange,
    createProjectLoading,
    createProjectError,
    handleOnCreateProject,
    deleteProjectLoading,
    deleteProjectError,
    handleOnDeleteProject,
    editProjectLoading,
    editProjectError,
    handleOnEditProject,
  } = useProject();

  // catch all error toast
  useEffect(() => {
    if (
      (!createProjectLoading && createProjectError) ||
      (!editProjectLoading && editProjectError) ||
      (!deleteProjectLoading && deleteProjectError)
    ) {
      setToast({
        content: (
          <Alert severity="error">
            {createProjectError?.message ||
              editProjectError?.message ||
              deleteProjectError?.message}
          </Alert>
        ),
      });
    }
  }, [
    setToast,
    createProjectLoading,
    createProjectError,
    editProjectLoading,
    editProjectError,
    deleteProjectError,
    deleteProjectLoading,
  ]);

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnProjectClick = (project: Project) => (e: React.MouseEvent) => {
    handleClose();
    handleChooseProject(project);
  };

  const handleOnOpenCreateModal = () => openCreateModal("project");
  return (
    <Box>
      {env.project ? (
        <React.Fragment>
          <Button
            id="account-button"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            startIcon={<AssignmentIcon />}
            endIcon={<ExpandMoreIcon />}
            sx={{ textTransform: "none" }}
          >
            {env.project.project}
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
              subheader="Manage Projects"
              selected={env.project}
              items={env.projects.filter((o) => o.team === env.team?.key)}
              titleKey="project"
              onItemClick={handleOnProjectClick}
              onItemRemove={handleOnDeleteProject}
              onItemEdit={handleOnEditProject}
              confirmCount={2}
            />
            <MenuItem onClick={handleOnOpenCreateModal}>
              <Button>Add Project</Button>
            </MenuItem>
          </Menu>
        </React.Fragment>
      ) : (
        <Button onClick={handleOnOpenCreateModal}>Add Project</Button>
      )}
    </Box>
  );
};

export default ProjectTab;
