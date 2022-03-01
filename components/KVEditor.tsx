import React, { useEffect, useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";

// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";

import JSONInput from "react-json-editor-ajrm";
import locale from "../locale/en.js";

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
  const [editing, setEditing] = useState(false);
  const [jsonEdit, setJsonEdit] = useState(false);
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

  const handleOnEditVariables = () => setEditing(true);
  const handleOnCancelEdit = () => {
    // revert changes
    setWorkingKV(transformObjectToList(base));
    setEditing(false);
    setJsonEdit(false);
  };

  const [jsonError, setJsonError] = useState(false);
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
    }
    setJsonError(error === false ? false : error.reason);
  };
  const handleOnJsonToggle = () => setJsonEdit((o) => !o);

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

  const handleOnSaveVariables = () => {
    varExecuteRequest({ ...env, updates: changes });
  };

  useEffect(() => {
    if (!varLoading && !varError && varData) {
      setBase(transformListToObject(workingKV));
      setChanges(EMPTY_CHANGES);
      setInfoMessage("");
      setEditing(false);
      setJsonEdit(false);
    }
  }, [varData, varError, varLoading]);

  const noChanges =
    changes &&
    !Object.values(changes.add).length &&
    !Object.values(changes.edit).length &&
    !changes.remove.length;

  return (
    <Box sx={{ p: 2 }}>
      {editing ? (
        <div>
          {jsonEdit ? (
            <Box>
              <JSONInput
                placeholder={jsonInitialKV}
                onChange={handleOnJsonKVChange}
                height="200px"
                confirmGood={false}
                theme="light_mitsuketa_tribute"
                locale={locale}
              />
            </Box>
          ) : (
            <Box>
              {workingKV.map(({ key: k, value: v, index }) => (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    mb: 1,
                  }}
                  key={index}
                >
                  <TextField value={k} onChange={handleOnKeyChange(index)} />
                  <TextField value={v} onChange={handleOnValueChange(index)} />
                  <Button onClick={handleOnKeyDelete(index)}>Delete</Button>
                </Box>
              ))}
              <Button onClick={handleOnKeyAdd}>Add</Button>
            </Box>
          )}
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={jsonEdit} />}
              onChange={handleOnJsonToggle}
              label="Json"
              disabled={varLoading}
            />
          </FormGroup>
          {JSON.stringify(changes)}
          {infoMessage}
          <Button
            onClick={handleOnSaveVariables}
            disabled={varLoading || jsonError || noChanges}
          >
            Save
          </Button>
          <Button onClick={handleOnCancelEdit} disabled={varLoading}>
            Cancel
          </Button>
          {varLoading && <CircularProgress />}
        </div>
      ) : (
        <div>
          {workingKV.map(({ key: k, value: v }) => (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
              }}
              key={k}
            >
              {k}: {JSON.stringify(v)}
            </Box>
          ))}
          <Button onClick={handleOnEditVariables}>Edit variables</Button>
        </div>
      )}
    </Box>
  );
};

export default KVEditor;
