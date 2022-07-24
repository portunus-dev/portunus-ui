import React, { useEffect } from "react";

import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../src/createEmotionCache";

import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/Help";

import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import Head from "next/head";
import theme from "../src/theme";
import Link from "../src/Link";

import PortunusLogo from "../components/PortunusLogo";
import { useAuth } from "../hooks/auth";

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props;
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

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>();
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Portunus</title>
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
                <Link href="/">
                  <PortunusLogo color="white" />
                </Link>
              </Box>
              <Box sx={{ display: "flex", ml: 1 }}>
                <Box>
                  <Button
                    id="account-button"
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                    endIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                    sx={{ textTransform: "none", color: "white" }}
                  >
                    {(user || {}).email}
                  </Button>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "account-button",
                      sx: { pb: 0 },
                    }}
                  >
                    <MenuItem disabled divider>
                      Settings (coming soon)
                    </MenuItem>
                    <MenuItem onClick={() => logout()}>
                      <Button>Logout</Button>
                    </MenuItem>
                  </Menu>
                </Box>
                <Link href="/how-to">
                  <IconButton>
                    <HelpIcon sx={{ color: "white" }} />
                  </IconButton>
                </Link>
              </Box>
            </Toolbar>
          </AppBar>
        )}
        <Box
          sx={{
            width: "100%",
            p: 2,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Component {...pageProps} />
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
