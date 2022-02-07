import React, { useContext, useMemo, useCallback, useEffect } from "react";

import { apiRequest } from "../utils/api";
import { Stage } from "../utils/types";

import { EnvContext } from "../hooks/env-context";
import { useForm, Field, useRequest } from "../hooks/utils";

const STAGE_FIELDS: Field[] = [
  {
    key: "name",
    label: "Stage Name",
    validation: "name",
    materialProps: { variant: "standard", required: true },
  },
];

const deleteStage = async (stage: Stage) => {
  const { key, name } = await apiRequest("/stage", {
    method: "DELETE",
    body: JSON.stringify({ stage: stage.key }),
  });
  return { key, name };
};

export const useStage = () => {
  const { env, dispatch: envDispatch } = useContext(EnvContext);

  const {
    form: stageForm,
    getFormAsObject: getStageObject,
    dispatch: stageDispatch,
  } = useForm(STAGE_FIELDS);

  const handleOnNewStageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stageDispatch({ type: e.target.id, payload: e.target.value });
  };

  const createNewStage = useCallback(async () => {
    if (env.team && env.project) {
      const { key, stage } = await apiRequest("/stage", {
        method: "POST",
        body: JSON.stringify({
          team: env.team.key,
          project: env.project.project,
          ...getStageObject(),
        }),
      });
      return { key, stage, team: env.team.key, project: env.project.key };
    }
  }, [env.team, env.project, getStageObject]);

  const {
    data: createStageData,
    loading: createStageLoading,
    error: createStageError,
    executeRequest: createStageExecuteRequest,
  } = useRequest<any>({
    requestPromise: createNewStage,
  });

  const handleOnCreateStage = () => createStageExecuteRequest();

  useEffect(() => {
    if (createStageData && createStageData.key && !createStageError) {
      envDispatch({ type: "addStage", payload: createStageData });
    }
  }, [createStageData, createStageError]);

  const {
    data: deleteStageData,
    loading: deleteStageLoading,
    error: deleteStageError,
    executeRequest: deleteStageExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteStage,
  });

  const handleOnDeleteStage = (stage: Stage) =>
    deleteStageExecuteRequest(stage);

  useEffect(() => {
    if (deleteStageData) {
      envDispatch({ type: "deleteStage", payload: deleteStageData });
    }
  }, [deleteStageData]);

  // const editStage = useCallback(async ({ name, stage }) => {
  //   await apiRequest("/stage", {
  //     method: "PUT",
  //     body: JSON.stringify({ stage: stage.key, name }),
  //   });
  //   return { key: stage.key, name };
  // }, []);

  // const {
  //   data: editStageData,
  //   loading: editStageLoading,
  //   error: editStageError,
  //   executeRequest: editStageExecuteRequest,
  // } = useRequest<any>({
  //   requestPromise: editStage,
  // });

  // const handleOnEditStage = (newName: string, stage: Stage) =>
  //   editStageExecuteRequest({ name: newName, stage });

  // useEffect(() => {
  //   if (editStageData) {
  //     dispatch({ type: "editStage", payload: editStageData });
  //   }
  // }, [editStageData]);
  return {
    STAGE_FIELDS,
    handleOnDeleteStage,
    deleteStageLoading,
    deleteStageError,
    stageForm,
    handleOnNewStageChange,
    handleOnCreateStage,
    createStageLoading,
  };
};
