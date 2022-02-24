import React, { useEffect } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import Head from "next/head";
import theme from "../src/theme";
import Link from "../src/Link";

import { useAuth } from "../hooks/auth";

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn]);
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
            <Toolbar>
              {/* THIS CAUSED A DEPENDENCY CRASH? <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <KeyIcon />
          </IconButton> */}
              <Box sx={{ flexGrow: 1 }}>
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
                  sx={{ color: "white", textDecoration: "none" }}
                >
                  How To
                </Button>
              </Link>
              <Box sx={{ display: "flex", ml: 1 }}>
                <Box>
                  <Typography variant="subtitle2" component="div">
                    Logged in as:
                  </Typography>
                  <Typography variant="body2" component="div">
                    {(user || {}).email}
                  </Typography>
                </Box>
                <Button size="small" color="inherit" onClick={() => logout()}>
                  Logout
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ width: "100%", p: 2 }}>
          <Component {...pageProps} />
        </Box>
      </ThemeProvider>
    </React.Fragment>
  );
}
