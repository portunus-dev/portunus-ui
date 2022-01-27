const url = process.env.REACT_PUBLIC_API_HOST || "http://127.0.0.1:8787";

export const apiRequest = (urlPath: string, fetchParams: any) => {
  // /ui/env?team=EQ Works&project=enrichdata&stage=dev'
  return fetch(`${url}/${urlPath}`, {
    headers: {
      // TODO: internalize through login process
      "portunus-jwt": localStorage.getItem("portunus-jwt"),
      accept: "application/json",
      "Content-Type": "application/json",
    },
    ...fetchParams,
  }).then((res) => res.json());
};
