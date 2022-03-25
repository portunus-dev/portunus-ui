import React, { useEffect } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

import KeyIcon from "@mui/icons-material/Key";

import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import Head from "next/head";
import theme from "../src/theme";
import Link from "../src/Link";

import User from "../components/User";

import { useAuth } from "../hooks/auth";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 300,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  overflowX: "hidden",
};

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();

  const { isLoggedIn, user, logout, refresh } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refresh();
  }, [router.query]);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <React.Fragment>
      <Head>
        <title>Portunus</title>
        <link href="/favicon.ico" rel="icon" />
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {router.pathname !== "/login" && (
          <AppBar position="static">
            <Toolbar sx={{ flexWrap: "wrap" }}>
              <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                <Box>
                  <KeyIcon fontSize="large" />
                </Box>
                <Link href="/">
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ color: "white", textDecoration: "none" }}
                  >
                    Portunus
                  </Typography>
                </Link>
              </Box>

              <Link href="/how-to">
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ textDecoration: "none" }}
                >
                  How To
                </Button>
              </Link>
              <Box sx={{ display: "flex", ml: 1 }}>
                <Box>
                  <Typography variant="subtitle2" component="div">
                    Logged in as:
                  </Typography>
                  <Button onClick={handleOpen} size="small" color="inherit">
                    {(user || {}).email}
                  </Button>
                </Box>
                <Button size="small" color="inherit" onClick={() => logout()}>
                  Logout
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
        )}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="user-preferences-moddal"
          aria-describedby="user-preferences-modal-description"
        >
          <Box sx={style}>
            <User />
          </Box>
        </Modal>
        <Box sx={{ width: "100%", p: 2 }}>
          <Component {...pageProps} />
        </Box>
      </ThemeProvider>
    </React.Fragment>
  );
}
