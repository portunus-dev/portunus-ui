import React, { useEffect, useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";

import JSONInput from "react-json-editor-ajrm";
import locale from "../locale/en.js";

import TabPanel from "../components/TabPanel";

import { useRequest } from "../hooks/utils";
import { EnvState } from "../utils/types";
import { apiRequest } from "../utils/api";

type KVStore = { [k: string]: string };
type onChangeListener = (event: React.ChangeEvent<HTMLInputElement>) => void;
type KVListItem = { key: string; value: string; index: number };
type KVList = KVListItem[];

type KVEditorProps = {
  initialKV: KVStore;
  env: EnvState;
};

type Changes = {
  add: KVStore;
  edit: KVStore;
  remove: string[];
};

const transformObjectToList: (o: KVStore) => KVList = (obj) =>
  Object.entries(obj).reduce((agg: KVList, [key, value], index) => {
    agg.push({ key, value, index });
    return agg;
  }, []);

const transformListToObject: (o: KVList) => KVStore = (list) =>
  list.reduce((agg: KVStore, { key, value }) => {
    agg[key] = value;
    return agg;
  }, {} as KVStore);

const calculateDelta: (initial: KVStore, current: KVList) => Changes = (
  initial,
  current
) => {
  const { add, edit }: Changes = current.reduce(
    (agg, ele) => {
      if (initial[ele.key] === undefined) {
        agg.add[ele.key] = ele.value;
      } else if (initial[ele.key] !== ele.value) {
        agg.edit[ele.key] = ele.value;
      }
      return agg;
    },
    { add: {}, edit: {}, remove: [] } as Changes
  );

  const remove = Object.keys(initial).filter(
    (key) => current.find((o) => o.key === key) === undefined
  );
  return { add, edit, remove };
};

const EMPTY_CHANGES = { add: {}, edit: {}, remove: [] } as Changes;

const KVEditor = ({ initialKV, env }: KVEditorProps) => {
  // TODO: current updating in KVEditor is broken by changing tabs because component unmounts, but initialKV doesn't change since varData isn't reloaded
  const [base, setBase] = useState(initialKV);

  const [jsonInitialKV, setJsonInitialKV] = useState(initialKV);
  const [workingKV, setWorkingKV] = useState(transformObjectToList(initialKV));
  const [infoMessage, setInfoMessage] = useState("");
  const [changes, setChanges] = useState(EMPTY_CHANGES); // the delta commands for API call

  const handleOnKeyChange: (index: number) => onChangeListener =
    (index) => (e) =>
      setWorkingKV((o) => {
        const update = [...o];
        update[index] = {
          ...update[index],
          key: e.target.value,
        };
        return update;
      });

  useEffect(() => {
    let duplicates: string[] = [];
    for (let i = 0; i < workingKV.length - 1; i++) {
      const found = workingKV
        .slice(i + 1)
        .filter(({ key }) => key === workingKV[i].key);
      if (found.length) duplicates.push(workingKV[i].key);
    }

    if (duplicates.length > 0) {
      setInfoMessage("Duplicate key(s) found: " + duplicates);
    } else {
      setInfoMessage("");
    }

    setChanges(calculateDelta(base, workingKV));
    setJsonInitialKV(transformListToObject(workingKV));
  }, [workingKV, base]);

  const handleOnValueChange: (index: number) => onChangeListener =
    (index) => (e) =>
      setWorkingKV((o) => {
        const update = [...o];
        update[index] = {
          ...update[index],
          value: e.target.value,
        };
        return update;
      });

  const handleOnKeyDelete: (index: number) => () => void = (index) => () =>
    setWorkingKV((o) => {
      const update = [...o.slice(0, index), ...o.slice(index + 1)];
      return update;
    });

  const handleOnKeyAdd: () => void = () =>
    setWorkingKV((o) => {
      const update = [
        ...o,
        {
          key: "",
          value: "",
          index: (o[o.length - 1] || { index: -1 }).index + 1,
        },
      ];
      return update;
    });

  const [jsonError, setJsonError] = useState(false);
  const [isJsonChanged, setIsJsonChanged] = useState(false);
  const handleOnJsonKVChange = ({
    jsObject,
    error,
  }: {
    jsObject: KVStore;
    error: any;
  }) => {
    if (!jsonError) {
      // TODO: validate nesting, arrays etc
      setWorkingKV(transformObjectToList(jsObject));
      setIsJsonChanged(true); // Set the state here
    }
    setJsonError(error === false ? false : error.reason);
  };

  const putVarData = useCallback(async ({ team, project, stage, updates }) => {
    const res = await apiRequest("env", {
      method: "PUT",
      body: JSON.stringify({
        stage: `${team.key}::${project.project}::${stage.stage}`,
        updates,
      }),
    });
    const vars = res;
    return vars;
  }, []);

  // TODO: have a direct override for useRequest data/loading/error or a better way to confirm this diff
  const {
    data: varData,
    loading: varLoading,
    error: varError,
    executeRequest: varExecuteRequest,
  } = useRequest<any>({
    requestPromise: putVarData,
  });

  const handleOnSaveVariables = async () => {
    await varExecuteRequest({ ...env, updates: changes });
    setBase(transformListToObject(workingKV));
    setChanges(EMPTY_CHANGES);
    setIsJsonChanged(false); // Reset the state here
    setInfoMessage("");
  };

  const noChanges =
    changes &&
    !Object.values(changes.add).length &&
    !Object.values(changes.edit).length &&
    !changes.remove.length;

  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
    setTab(newTab);
  };

  return (
    <Box>
      <Box>
        <Tabs value={tab} onChange={handleTabChange}>
          <Tab label="JSON" />
          <Tab label="Variables" />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <JSONInput
          placeholder={jsonInitialKV}
          onChange={handleOnJsonKVChange}
          height="200px"
          confirmGood={false}
          theme="light_mitsuketa_tribute"
          locale={locale}
        />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {workingKV.map(({ key: k, value: v, index }) => (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              mb: 1,
              p: 0.5,
            }}
            key={index}
          >
            <TextField
              sx={{ flexGrow: 1, mr: 1 }}
              value={k}
              onChange={handleOnKeyChange(index)}
            />
            <TextField
              sx={{ flexGrow: 1, ml: 1 }}
              value={v}
              onChange={handleOnValueChange(index)}
            />
            <IconButton onClick={handleOnKeyDelete(index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button onClick={handleOnKeyAdd}>Add</Button>
      </TabPanel>
      {infoMessage}
      <Button
        onClick={handleOnSaveVariables}
        disabled={varLoading || jsonError || (noChanges && !isJsonChanged)}
      >
        Save
      </Button>
      {varLoading && <CircularProgress />}
    </Box>
  );
};

export default KVEditor;
