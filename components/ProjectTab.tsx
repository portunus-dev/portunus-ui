import React, { useMemo, useContext, useCallback, useEffect } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import { apiRequest } from "../utils/api";
import { Team, Project, Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useForm, Field, useRequest } from "../hooks/utils";

import InteractiveList from "./InteractiveList";
import Form from "./Form";

const { NEXT_PUBLIC_READ_ONLY } = process.env;

type ProjectTabProps = {
  handleChooseProject: (value: Project) => () => void;
  handleChooseStage: (value: Stage) => () => void;
};

export default ({
  handleChooseProject,
  handleChooseStage,
}: ProjectTabProps) => {
  const { env, dispatch } = useContext(EnvContext);
  const PROJECT_FIELDS: Field[] = useMemo(
    () => [
      {
        key: "name",
        label: "Project Name",
        validation: "name",
        materialProps: { variant: "standard", required: true },
      },
    ],
    []
  );

  const {
    form: projectForm,
    getFormAsObject: getProjectObject,
    dispatch: projectDispatch,
  } = useForm(PROJECT_FIELDS);

  const projectOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    projectDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewProject = useCallback(async () => {
    if (env.team) {
      const { key, project } = await apiRequest("/project", {
        method: "POST",
        body: JSON.stringify({ team: env.team.key, ...getProjectObject() }),
      });
      return { key, project, team: env.team.key };
    }
  }, [env.team, getProjectObject]);

  const {
    data: createProjectData,
    loading: createProjectLoading,
    error: createProjectError,
    executeRequest: createProjectExecuteRequest,
  } = useRequest<any>({
    requestPromise: createNewProject,
  });

  const handleOnCreateProject = () => createProjectExecuteRequest();

  useEffect(() => {
    if (createProjectData && createProjectData.key && !createProjectError) {
      dispatch({ type: "addProject", payload: createProjectData });
    }
  }, [createProjectData, createProjectError]);

  const deleteProject = useCallback(async (project: Project) => {
    const { key, name } = await apiRequest("/project", {
      method: "DELETE",
      body: JSON.stringify({ project: project.key }),
    });
    return { key, name };
  }, []);

  const {
    data: deleteProjectData,
    loading: deleteProjectLoading,
    error: deleteProjectError,
    executeRequest: deleteProjectExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteProject,
  });

  const handleOnDeleteProject = (project: Project) =>
    deleteProjectExecuteRequest(project);

  useEffect(() => {
    if (deleteProjectData) {
      dispatch({ type: "deleteProject", payload: deleteProjectData });
    }
  }, [deleteProjectData]);

  const editProject = useCallback(async ({ name, project }) => {
    await apiRequest("/project", {
      method: "PUT",
      body: JSON.stringify({ project: project.key, name }),
    });
    return { key: project.key, name };
  }, []);

  const {
    data: editProjectData,
    loading: editProjectLoading,
    error: editProjectError,
    executeRequest: editProjectExecuteRequest,
  } = useRequest<any>({
    requestPromise: editProject,
  });

  const handleOnEditProject = (newName: string, project: Project) =>
    editProjectExecuteRequest({ name: newName, project });

  useEffect(() => {
    if (editProjectData) {
      dispatch({ type: "editProject", payload: editProjectData });
    }
  }, [editProjectData]);

  return (
    <Grid container spacing={1} sx={{ p: 3 }}>
      {env.team && (
        <Grid item xs={12} md={4}>
          <InteractiveList
            subheader="Manage Projects"
            selected={env.project}
            items={env.projects.filter((o) => o.team === env.team?.key)}
            titleKey="project"
            onItemClick={handleChooseProject}
            onItemRemove={handleOnDeleteProject}
            onItemEdit={handleOnEditProject}
            confirmCount={2}
          />
          {!NEXT_PUBLIC_READ_ONLY && (
            <Box sx={{ display: "flex" }}>
              <Form
                fields={PROJECT_FIELDS}
                form={projectForm}
                onChange={projectOnChange}
              />
              <Button
                onClick={handleOnCreateProject}
                disabled={createProjectLoading}
              >
                Add
              </Button>
            </Box>
          )}
        </Grid>
      )}
      <Grid item xs={12} md={8}>
        {env.team && env.project ? (
          <React.Fragment>
            <h2>Current project: {env.project.project}</h2>
            <InteractiveList
              subheader="Your Stages"
              selected={env.stage}
              items={env.stages.filter((o) => o.project === env.project?.key)}
              titleKey="stage"
              onItemClick={handleChooseStage}
            />
          </React.Fragment>
        ) : (
          <h2>Choose a project</h2>
        )}
      </Grid>
    </Grid>
  );
};
