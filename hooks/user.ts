import { useState, useEffect } from "react";

import { useRequest } from "../hooks/utils";
import { apiRequest } from "../utils/api";
import { FullUser, AuditHistory } from "../utils/types";

const getUser = async () => {
  const resp = await apiRequest("user", {
    method: "GET",
  });

  const user: FullUser = resp.user;
  return user;
};

const editUserKey = async ({ public_key }: { public_key: string }) => {
  console.log("update key: ", public_key);
  await apiRequest("user/key", {
    method: "PUT",
    body: JSON.stringify({ public_key }),
  });
  return { public_key };
};

const deleteUserKey = async () => {
  await apiRequest("user/key", {
    method: "DELETE",
  });
  return true;
};

const editUserAudit = async ({ audit }: { audit: boolean }) => {
  await apiRequest("user/audit", {
    method: "PUT",
    body: JSON.stringify({ audit }),
  });
  return { audit };
};

const fetchUserAuditData = async () => {
  const res = await apiRequest("audit?type=user", {
    method: "GET",
  });
  const auditHistory: AuditHistory[] = res.auditHistory;
  auditHistory.sort(
    (a, b) => new Date(b.start).valueOf() - new Date(a.start).valueOf()
  );

  return auditHistory;
};

export const useUser = () => {
  // initial fetch
  const {
    data: userData,
    loading: userDataLoading,
    error: userDataError,
    executeRequest: userExecuteRequest,
  } = useRequest<FullUser>({
    requestPromise: getUser,
  });

  useEffect(() => {
    userExecuteRequest();
  }, []);

  const {
    data: editUserKeyData,
    loading: editUserKeyLoading,
    error: editUserKeyError,
    executeRequest: editUserKeyExecuteRequest,
  } = useRequest<any>({
    requestPromise: editUserKey,
  });

  const handleOnEditUserKey = (public_key: string) =>
    editUserKeyExecuteRequest({ public_key });

  const {
    data: deleteUserKeyData,
    loading: deleteUserKeyLoading,
    error: deleteUserKeyError,
    executeRequest: deleteUserKeyExecuteRequest,
  } = useRequest<any>({
    requestPromise: deleteUserKey,
  });

  const handleOnDeleteUserKey = () => deleteUserKeyExecuteRequest();

  const {
    data: editUserAuditData,
    loading: editUserAuditLoading,
    error: editUserAuditError,
    executeRequest: editUserAuditExecuteRequest,
  } = useRequest<any>({
    requestPromise: editUserAudit,
  });

  const handleOnEditUserAudit = (newAudit: string) =>
    editUserAuditExecuteRequest({ audit: newAudit });

  // refresh data! TODO: just set user data to the diff, instead of fetching
  useEffect(() => {
    if (editUserAuditData || editUserKeyData || deleteUserKeyData) {
      userExecuteRequest();
    }
  }, [editUserAuditData, editUserKeyData, deleteUserKeyData]);

  const {
    data: userAuditData,
    loading: userAuditLoading,
    error: userAuditError,
    executeRequest: userAuditExecuteRequest,
  } = useRequest<AuditHistory[]>({
    requestPromise: fetchUserAuditData,
  });

  useEffect(() => {
    userAuditExecuteRequest();
  }, []);

  console.log(userData);
  return {
    userData,
    userDataLoading,
    userDataError,
    editUserKeyData,
    editUserKeyLoading,
    editUserKeyError,
    editUserKeyExecuteRequest,
    handleOnEditUserKey,
    deleteUserKeyData,
    deleteUserKeyLoading,
    deleteUserKeyError,
    deleteUserKeyExecuteRequest,
    handleOnDeleteUserKey,
    editUserAuditData,
    editUserAuditLoading,
    editUserAuditError,
    editUserAuditExecuteRequest,
    handleOnEditUserAudit,
    userAuditData,
    userAuditLoading,
    userAuditError,
    userAuditExecuteRequest,
  };
};
