import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert, { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import Form from "../components/Form";

import { PORTUNUS_API } from "../utils/api";
import { useForm, Field } from "../hooks/utils";
import { useAuth } from "../hooks/auth";

const getOTP = (email: string) => {
  const url = new URL(`${PORTUNUS_API}/otp`);
  url.searchParams.append("user", email);
  url.searchParams.append("origin", `${window.location.origin}/login`);
  return fetch(url.toString()).then((res) => res.json());
};

type Message = {
  text: string;
  severity?: AlertColor;
};

const FIELDS: Field[] = [
  {
    key: "email",
    invalid: "email",
    label: "Email",
    invalidText: "Enter a valid email",
  },
  {
    key: "otp",
    invalid: (o) => o?.length < 6,
    label: "OTP from email",
    invalidText: "The OTP should be at least 6 characters long",
    defaults: { hide: true },
  },
];

const validateOTP = (query: any) => {
  // TODO: do proper type here
  const { user, otp } = query;
  if (!user || !otp) {
    throw new Error("Invalid user (email) or OTP");
  }
  const url = new URL(`${PORTUNUS_API}/login`);
  url.searchParams.append("user", user);
  url.searchParams.append("otp", otp);
  return fetch(url.toString())
    .then((res) => res.json())
    .then(({ jwt }) => {
      if (!jwt) {
        throw new Error("Unable to validate OTP");
      }
      return jwt;
    });
};

const Login = () => {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  useEffect(() => {
    // already logged in
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const { user, otp } = router.query;
    if (user && otp) {
      validateOTP(router.query)
        .then((jwt) => {
          login(jwt);
          router.replace("/");
        })
        .catch((err) => {
          // TODO: show toast or something
          console.error(err);
          router.query = {};
        });
    }
  }, [router.query]);

  const [otpSending, setOTPSending] = useState(false);
  const [otpSent, setOTPSent] = useState(false);

  const { form, dispatch } = useForm(FIELDS);

  const handleOnFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: e.target.id, payload: e.target.value });
  };
  useEffect(() => {
    dispatch({ type: "hide", payload: { key: "otp", value: !otpSent } });
    dispatch({ type: "hide", payload: { key: "email", value: otpSent } });
  }, [otpSent]);

  const handleOnGetOTP = useCallback(() => {
    setOTPSending(true);
    setMessage({ text: "" });
    getOTP(form.email.value)
      .then((data) => {
        // TODO: show toast or something
        console.log(data);
        setMessage({
          text: "Check your email for your OTP login!",
          severity: "success",
        });
        setOTPSent(true);
      })
      .catch((err) => {
        // TODO: show toast or something
        console.error(err);
        setMessage({
          text: "There was an error getting your OTP login",
          severity: "error",
        });
      })
      .finally(() => {
        setOTPSending(false);
      });
  }, [form]);

  const handleOnLogin = useCallback(() => {
    router.push({
      pathname: "/login",
      query: { user: form.email.value, otp: form.otp.value },
    });
  }, [form]);

  const handleOnReset = () => {
    setOTPSent(false);
    setMessage({ text: "" });
  };

  const [message, setMessage] = useState<Message>({ text: "" });

  if (isLoggedIn) {
    // there must be a better way to do more seamlessly
    return (
      <Box>
        <CircularProgress size="small" />
        Already logged in, redirecting...
      </Box>
    );
  }

  if (router.query.user && router.query.otp) {
    return (
      <Box>
        <CircularProgress size="small" />
        Logging in...
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 1,
        alignItems: "center",
      }}
    >
      <Typography variant="h6" component="div" gutterBottom>
        Welcome to Portunus
      </Typography>

      <Form fields={FIELDS} form={form} onChange={handleOnFormChange} />
      {!otpSent && (
        <Button
          onClick={handleOnGetOTP}
          disabled={!form.email.value || form.email?.invalid || otpSending}
        >
          Get OTP
        </Button>
      )}
      {otpSent && (
        <Button
          disabled={!form.otp.value || form.otp.invalid}
          onClick={handleOnLogin}
        >
          Login
        </Button>
      )}
      {otpSending && <CircularProgress />}
      {message.text && (
        <Alert severity={message.severity || "info"}>{message.text}</Alert>
      )}
      {otpSent && <Button onClick={handleOnReset}>Reset</Button>}
    </Box>
  );
};

export default Login;
