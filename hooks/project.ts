import React, { useMemo, useCallback, useEffect } from "react";

import { apiRequest } from "../utils/api";
import { Project, EnvState } from "../utils/types";

import { EnvDispatchType } from "../hooks/env";
import { useForm, Field, useRequest } from "../hooks/utils";

type UseProjectProps = {
  envDispatch: React.Dispatch<{ type: EnvDispatchType; payload: any }>;
  env: EnvState;
};

export const useProject = ({ env, envDispatch }: UseProjectProps) => {
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
      envDispatch({ type: "addProject", payload: createProjectData });
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
      envDispatch({ type: "deleteProject", payload: deleteProjectData });
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
      envDispatch({ type: "editProject", payload: editProjectData });
    }
  }, [editProjectData]);

  return {
    PROJECT_FIELDS,
    projectForm,
    getProjectObject,
    projectDispatch,
    projectOnChange,
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
