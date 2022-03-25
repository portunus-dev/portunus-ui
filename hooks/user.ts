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
  console.log("res from api!", res);
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

  const [user, setUser] = useState<FullUser | null>();
  useEffect(() => {
    setUser(userData);
  }, [userData]);

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
    if (editUserAuditData) {
      userExecuteRequest();
    }
  }, [editUserAuditData]);

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

  return {
    user,
    userDataLoading,
    userDataError,
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
