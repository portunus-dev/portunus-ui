import React, { useState } from "react";

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
