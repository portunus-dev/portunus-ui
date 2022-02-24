import { useState, useReducer, useEffect, useCallback } from "react";

export const useList = <T>(init: T[] | null) => {
  const [list, setList] = useState(init || []);

  const add = (item: T, front: boolean = false) => {
    setList((o) => {
      if (front) {
        return [item, ...o];
      } else {
        return [...o, item];
      }
    });
  };

  const remove = (
    item: T,
    selector?: (searchItem: T, targetItem?: T) => boolean
  ) => {
    // reference equality or the function
    setList((o) => {
      const idx = o.findIndex((i) =>
        selector ? selector(i, item) : i === item
      );
      if (idx < 0) return o;
      return [...o.slice(0, idx), ...o.slice(idx + 1)];
    });
  };

  const edit = (
    originalItem: T,
    newItem: T,
    selector?: (searchItem: T, targetItem?: T) => boolean
  ) => {
    // reference equality or the function
    setList((o) => {
      const idx = o.findIndex((i) =>
        selector ? selector(i, originalItem) : i === originalItem
      );
      if (idx < 0) return o;
      return [...o.slice(0, idx), newItem, ...o.slice(idx + 1)];
    });
  };

  return {
    list,
    setList,
    add,
    remove,
    edit,
  };
};

export const useListViaAPI = <T>(
  init: T[] | null,
  addApiFn: (i: T) => Promise<Response>,
  removeApiFn: (i: T) => Promise<Response>,
  editApiFn: (i: T) => Promise<Response>
) => {
  const { list, add, remove, edit } = useList(init);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // TODO: use a selector fn for each or enforce an API standard, such as res.item or res.update
  const addViaAPI = (item: T) => {
    setLoading(true);
    addApiFn(item)
      .then((res: Response) => res.json())
      .then((res) => {
        setError("");
        // TODO: I can use a selector fn here?
        add(res.item);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const removeViaAPI = (item: T) => {
    setLoading(true);
    removeApiFn(item)
      .then((res: Response) => res.json())
      .then((res) => {
        setError("");
        // TODO: I can use a selector fn here?
        remove(res.item);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const editViaAPI = (item: T) => {
    setLoading(true);
    editApiFn(item)
      .then((res: Response) => res.json())
      .then((res) => {
        setError("");
        // TODO: I can use a selector fn here?
        edit(item, res.item);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return {
    list,
    loading,
    error,
    addViaAPI,
    removeViaAPI,
    editViaAPI,
  };
};

type Validators = { email: Function; name: Function };

const VALIDATORS: Validators = {
  email: (v: string) => !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
  name: (v: string) => v.length <= 3,
  // password: e.g. strength calculation, check to see if it matches old pw
};

type DefaultInit = {
  value?: any;
  invalid?: boolean;
  disabled?: boolean;
  hide?: boolean;
};

// TODO: can TS enforce the value of a Field<T> while having a flexible Field[]
export type Field = {
  key: string;
  defaults?: DefaultInit;
  // ====[TODO] this usage feels silly. I thought it would streamline some things
  invalid?:
    | keyof Validators
    | ((value: any, form: FormReducerState) => boolean);
  disabled?: (value: any, form: FormReducerState) => boolean;
  hide?: (value: any, form: FormReducerState) => boolean;
  label?: string;
  type?: string;
  // for radio/select
  options?: {
    value: string;
    label: string;
  }[];
  invalidText?: string;
  helperText?: string;
  materialProps?: any;
};

// ====[TODO] could include "all fields filled" + "all fields valid" state
export type FormReducerState = {
  [key: string]: {
    value: any;
    invalid?: boolean;
    hide?: boolean;
    disabled?: boolean;
  };
};

type FormReducerType = "update" | "fields" | keyof FormReducerState;

const fieldsToFormObject = (
  state: FormReducerState,
  fields: Field[]
): FormReducerState =>
  fields.reduce(
    (agg, field) => ({
      ...agg,
      [field.key]: state[field.key] || { ...(field.defaults || {}) },
    }),
    {}
  );

export const useForm = (fields: Field[]) => {
  const [form, dispatch] = useReducer(
    (
      state: FormReducerState,
      { type, payload }: { type: FormReducerType; payload: any }
    ) => {
      if (type === "update") {
        // update all keys from payload{}
        // ====[TODO] depending on usage, what about the "invalid" key here?
        return {
          ...state,
          ...Object.entries(state).reduce(
            (agg, [key, currentState]) => ({
              ...agg,
              [key]: {
                ...currentState,
                ...payload[key],
              },
            }),
            {}
          ),
        };
      }

      if (type === "fields") {
        // reset the fields, keeping old values if they exist
        return fieldsToFormObject(state, fields);
      }

      // external controls for form states
      if (type === "invalid") {
        return {
          ...state,
          [payload.key]: {
            ...state[payload.key],
            invalid: payload.value,
          },
        };
      }

      if (type === "hide") {
        return {
          ...state,
          [payload.key]: {
            ...state[payload.key],
            hide: payload.value,
          },
        };
      }

      if (type === "disabled") {
        return {
          ...state,
          [payload.key]: {
            ...state[payload.key],
            disabled: payload.value,
          },
        };
      }

      // default case is type === field.key
      const field = fields.find((o) => o.key === type);

      if (!field) {
        // ====[TODO] throw error?
        return state;
      }

      const update: FormReducerState = {
        ...state,
        [type]: { ...state[type], value: payload },
      };

      // check disabled, hide & invalid for every key
      const newState = Object.entries(update).reduce((agg, [k, v]) => {
        const field = fields.find((o) => o.key === k);
        if (!field) return agg;

        const invalid =
          typeof field.invalid === "function"
            ? field.invalid(v.value, state)
            : field.invalid && VALIDATORS[field.invalid]
            ? VALIDATORS[field.invalid](v.value, state)
            : v.invalid !== undefined
            ? v.invalid
            : field.defaults?.invalid;

        const hide =
          typeof field.hide === "function"
            ? field.hide(v.value, state)
            : v.hide !== undefined
            ? v.hide
            : field.defaults?.hide;

        const disabled =
          typeof field.disabled === "function"
            ? field.disabled(v.value, state)
            : v.disabled !== undefined
            ? v.disabled
            : field.defaults?.disabled;

        agg[k] = {
          ...v,
          invalid,
          hide,
          disabled,
        };
        return agg;
      }, {} as FormReducerState);

      return newState;
    },
    fieldsToFormObject({}, fields)
  );

  useEffect(() => {
    dispatch({ type: "fields", payload: fields });
  }, [fields]);

  const getFormAsObject = useCallback(
    () =>
      fields.reduce(
        (agg, { key }) => ({
          ...agg,
          [key]: form[key].value,
        }),
        {}
      ),
    [fields, form]
  );

  return { form, getFormAsObject, dispatch };
};

// Abstracts a common request patterns { data, loading, error } into a single function

type RequestParameters<T> = {
  initData?: T;
  initLoading?: boolean;
  loadOnFetch?: boolean;
  requestPromise: (params?: any) => Promise<T>;
};

type RequestReducerType = "data" | "loading" | "error";
type RequestState<T> = {
  data: T | undefined;
  loading: boolean;
  error?: Error;
};

export const useRequest = <T>({
  initData,
  initLoading = false,
  loadOnFetch = true,
  requestPromise,
}: RequestParameters<T>): RequestState<T> & {
  executeRequest: (params?: any) => Promise<void>;
} => {
  const [state, dispatch] = useReducer(
    (
      state: RequestState<T>,
      { type, payload }: { type: RequestReducerType; payload: any }
    ) => {
      const value = { [type]: payload };

      // reset error when loading === true or data is received
      if ((type === "loading" && payload) || type === "data") {
        value.error = false;
      }
      return {
        ...state,
        ...value,
      };
    },
    {
      data: initData,
      loading: initLoading,
      error: undefined,
    }
  );

  const executeRequest = useCallback(
    async (params: any) => {
      if (loadOnFetch) dispatch({ type: "loading", payload: true });
      requestPromise(params)
        .then((payload) => dispatch({ type: "data", payload }))
        // TODO get error message from response?
        .catch((e: Error) => dispatch({ type: "error", payload: e }))
        .finally(() => dispatch({ type: "loading", payload: false }));
    },
    [requestPromise, loadOnFetch]
  );

  return { ...state, executeRequest };
};
