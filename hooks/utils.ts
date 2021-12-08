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
  name: (v: string) => v.length >= 3,
  // password: e.g. strength calculation, check to see if it matches old pw
};

type Field<T> = {
  key: string;
  defaultValue: T;
  validation: keyof Validators | ((o: T) => boolean);
};

type FormReducerState = {
  [key: string]: {
    value: any;
    invalid?: boolean;
  };
};

type FormReducerType = "update" | "fields" | keyof FormReducerState;

const fieldsToFormObject = (
  state: FormReducerState,
  fields: Field<any>[]
): FormReducerState =>
  fields.reduce(
    (agg, field) => ({
      ...agg,
      [field.key]: state[field.key] || { value: field.defaultValue },
    }),
    {}
  );

export const useForm = (fields: Field<any>[]) => {
  const [form, dispatch] = useReducer(
    (
      state: FormReducerState,
      { type, payload }: { type: FormReducerType; payload: any }
    ) => {
      if (type === "update") {
        // update all keys from payload{}
        // ====[TODO] depending on usage, what about "invalid" key?
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

      // default case is type === field.key
      const field = fields.find((o) => o.key === type);

      if (!field) {
        // ====[TODO] throw error?
        return state;
      }

      // ====[NOTE] provide a function or a key in VALIDATORS
      let validationFn;
      if (typeof field.validation === "function") {
        validationFn = field.validation;
      } else if (VALIDATORS[field.validation]) {
        validationFn = VALIDATORS[field.validation];
      }

      return {
        ...state,
        [type]: {
          value: payload,
          invalid: validationFn ? validationFn(payload) : false,
        },
      };
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
