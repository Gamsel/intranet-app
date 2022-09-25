import * as React from 'react';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';


import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArtTrackIcon from '@mui/icons-material/ArtTrack';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

export default function Navigator(props) {
  const { ...other } = props;

  const MarketMaker = ['MPL','MKR'];

  let childs = [
    { id: 'OrderBook', icon: <MenuBookIcon />,},     
    { id: 'Portfolio', icon: <ArtTrackIcon /> }
  ]

  if(MarketMaker.includes(props.username))
  childs.push({ id: 'QuoteBook', icon: <RequestQuoteIcon /> })

  const categories = [
    {
  
      children: childs 
      
    }  
  ];
   
  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
          XLEO
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            {children.map(({ id: childId, icon, active }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton selected={active} sx={item} onClick={() => {props.onSwitchContent(childId)}}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}

           
          </Box>
        ))}
      </List>
    </Drawer>
  );
}