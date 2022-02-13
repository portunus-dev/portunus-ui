export const PORTUNUS_API = process.env.NEXT_PUBLIC_API_HOST || "http://127.0.0.1:8787";

export const apiRequest = (urlPath: string, fetchParams: any) => {
  // /ui/env?team=EQ Works&project=enrichdata&stage=dev'
  return fetch(`${PORTUNUS_API}/${urlPath}`, {
    headers: {
      // TODO: internalize through login process
      "portunus-jwt": localStorage.getItem("portunus-jwt"),
      accept: "application/json",
      "Content-Type": "application/json",
    },
    ...fetchParams,
  })
    .then(async (res) => ({
      ok: res.ok,
      statusText: res.statusText,
      json: await res.json(),
    }))
    .then((res) => {
      if (res.ok) return res.json;
      throw new Error(res.json.message || res.statusText);
    });
};
