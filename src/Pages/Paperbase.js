import React , { useState,useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Navigator from './Navigator';

import Header from './Header';
import OrderBook from './Orderbook.js';
import QuoteBook from './Quotebook.js';
import Portfolio from './Portfolio.js';
import LogIn from './LogIn.js';
import { SnackbarProvider } from 'notistack';
import { useCookies } from "react-cookie";
import config from './host.config'




function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  );
}

let theme = createTheme({
  palette: {
    primary: {
      light: '#63ccff',
      main: '#009be5',
      dark: '#006db3',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#081627',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:active': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          marginLeft: theme.spacing(1),
        },
        indicator: {
          height: 3,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          backgroundColor: theme.palette.common.white,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          margin: '0 16px',
          minWidth: 0,
          padding: 0,
          [theme.breakpoints.up('md')]: {
            padding: 0,
            minWidth: 0,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1),
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 4,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(255,255,255,0.15)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#4fc3f7',
          },
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: 14,
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: 'auto',
          marginRight: theme.spacing(2),
          '& svg': {
            fontSize: 20,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 32,
          height: 32,
        },
      },
    },
  },
};

const drawerWidth = 256;

export default function Paperbase() {

  useEffect(() => {
    const socket = new WebSocket("ws://"+config.ip+":"+ config.port); 
    setSocketState(socket);
  },[]);   

  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contentType, setContentType] = useState("OrderBook");
  const [socketState, setSocketState] = useState(false);
  const [sockeReadytState, setSocketReadyState] = useState(0);
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const logout = () => {
    removeCookie("user");
  }

  if(socketState === false) return <h1>Socket INIT</h1>

  socketState.onopen = (event) => {
    try{
      setSocketReadyState(1)
  } catch (err) {
    console.log(err);
  }
  };
  
  if(sockeReadytState != 1) return <h1>Socket Connecting</h1>

 const handleSwitchContent = (contentType) => {
    setContentType(contentType);
 }
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={4}   anchorOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          {isSmUp ? null : (
            <Navigator
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              onSwitchContent = {handleSwitchContent}
            />
          )}

          <Navigator
            PaperProps={{ style: { width: drawerWidth } }}
            sx={{ display: { sm: 'block', xs: 'none' } }}
            onSwitchContent = {handleSwitchContent}
            username = {cookies.user}
          />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header onDrawerToggle={handleDrawerToggle} onLogout={logout} />
          <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          
            {cookies.user === undefined && <LogIn ws = {socketState} cookie={cookies} setCookie ={setCookie}/>}
            {cookies.user != undefined && contentType === "OrderBook" && <OrderBook ws = {socketState} username ={cookies.user} />}
            {cookies.user != undefined && contentType === "QuoteBook" && <QuoteBook ws = {socketState} username ={cookies.user} />}
            {cookies.user != undefined && contentType === "Portfolio" && <Portfolio ws = {socketState} username ={cookies.user} />}            
            
          </Box>
          <Box component="footer" sx={{ p: 2, bgcolor: '#eaeff1' }}>
            <Copyright />
          </Box>
        </Box>
      </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
}