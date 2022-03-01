import React, { useContext, useCallback, useEffect } from "react";

import { apiRequest } from "../utils/api";
import { Project } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useForm, Field, useRequest } from "../hooks/utils";

const PROJECT_FIELDS: Field[] = [
  {
    key: "name",
    label: "Project Name",
    invalid: "name",
    materialProps: { variant: "standard", required: true },
  },
];

const deleteProject = async (project: Project) => {
  const { key, name } = await apiRequest("/project", {
    method: "DELETE",
    body: JSON.stringify({ project: project.key }),
  });
  return { key, name };
};

const editProject = async ({
  name,
  project,
}: {
  name: string;
  project: Project;
}) => {
  await apiRequest("/project", {
    method: "PUT",
    body: JSON.stringify({ project: project.key, name }),
  });
  return { key: project.key, name };
};

export const useProject = () => {
  const { env, dispatch: envDispatch } = useContext(EnvContext);

  const {
    form: projectForm,
    getFormAsObject: getProjectObject,
    dispatch: projectDispatch,
  } = useForm(PROJECT_FIELDS);

  const handleOnNewProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      envDispatch({ type: "addProject", payload: createProjectData });
    }
  }, [createProjectData, createProjectError]);

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
      envDispatch({ type: "deleteProject", payload: deleteProjectData });
    }
  }, [deleteProjectData]);

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
      envDispatch({ type: "editProject", payload: editProjectData });
    }
  }, [editProjectData]);

  return {
    PROJECT_FIELDS,
    projectForm,
    getProjectObject,
    projectDispatch,
    handleOnNewProjectChange,
    createNewProject,
    createProjectData,
    createProjectLoading,
    createProjectError,
    createProjectExecuteRequest,
    handleOnCreateProject,
    deleteProject,
    deleteProjectData,
    deleteProjectLoading,
    deleteProjectError,
    deleteProjectExecuteRequest,
    handleOnDeleteProject,
    editProject,
    editProjectData,
    editProjectLoading,
    editProjectError,
    editProjectExecuteRequest,
    handleOnEditProject,
  };
};
