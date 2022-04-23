import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert, { AlertColor } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import PortunusLogo from "../components/PortunusLogo";
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
    materialProps: { fullWidth: true },
  },
  {
    key: "otp",
    invalid: (o) => o?.length < 6,
    label: "Code from email",
    invalidText: "The code should be at least 6 characters long",
    defaults: { hide: true },
    materialProps: { fullWidth: true },
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
          text: "Your one-time login was sent!",
          severity: "success",
        });
        setOTPSent(true);
      })
      .catch((err) => {
        // TODO: show toast or something
        console.error(err);
        setMessage({
          text: "There was an error sending your one-time login",
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
      sx={{ width: "100%", display: "flex", justifyContent: "center", pt: 6 }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 1,
          pb: 3,
          alignItems: "center",
          width: {
            xs: "90%",
            md: "50%",
            lg: "40%",
          },
        }}
      >
        <PortunusLogo variant="h4" keySize="large" />

        <Box
          sx={{ width: { xs: "80%", sm: "65%", md: "60%", lg: "48%" }, mt: 2 }}
        >
          <Form fields={FIELDS} form={form} onChange={handleOnFormChange} />
          {!otpSent && (
            <Button
              onClick={handleOnGetOTP}
              disabled={!form.email.value || form.email?.invalid || otpSending}
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
            >
              Request Magic Link
            </Button>
          )}
          {otpSent && (
            <Button
              disabled={!form.otp.value || form.otp.invalid}
              onClick={handleOnLogin}
              variant="contained"
              fullWidth
              sx={{ mt: 1, mb: 1 }}
            >
              Login
            </Button>
          )}
          {otpSent && (
            <Box>
              Didn&apos;t receive a link?&nbsp;
              <Button
                onClick={handleOnReset}
                sx={{ textTransform: "none", textDecoration: "underline" }}
              >
                Reset
              </Button>
            </Box>
          )}
          {message.text && (
            <Alert severity={message.severity || "info"}>{message.text}</Alert>
          )}
        </Box>
        {otpSending && <CircularProgress />}
      </Paper>
    </Box>
  );
};

export default Login;
