import React, { useState,createRef } from "react";
import Button from '@mui/material/Button';
import config from './host.config'
import { withSnackbar } from 'notistack';
import TextField from '@mui/material/TextField';

class LogIn extends React.Component {

  constructor(props) {
    super(props)

    this.state = {       
        username: "",
        password: ""       
    }
   
}


  handleCookie = () => {
   
    this.props.setCookie("user", this.state.username, { path: "/",maxAge: 21600 }); // setting the cookie

  };

  render(){
    
  if (this.props.ws == null) return; 
 

  this.props.ws.onmessage = function (event) {
    
    try {    
   
      if(event.data === "200"){
        this.handleCookie();
      }else  if(event.data === "401") {
        this.props.enqueueSnackbar('Falsches Password oder Username', { variant: 'error' });
      }

      
    } catch (err) {
      console.log(err);
    }
  }.bind(this);

  const handleLogInRequest = () => {
    if(this.state.username.length > 0){
      if(this.state.password.length > 0){

        this.props.ws.send('LOGIN{"user":"'+ this.state.username +'", "password":"'+ this.state.password +'"}');

      }else{
        this.props.enqueueSnackbar('Bitte Password eingeben', { variant: 'error' });
      }

    }else{
      this.props.enqueueSnackbar('Bitte Username eingeben', { variant: 'error' });
    }
    

  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogInRequest();
      
    }
  }
 
    return (<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center", flexDirection:"column", justifyContent:"center"}} >
 
        <TextField
          style={{width:"75%",height:"50px",marginBottom:"50px"}}
          id="standard-helperText"
          label="Username"       
          value={this.state.username}       
          onChange={(e) =>{ this.setState({username: e.target.value})}}
          variant="standard"
        />
        <TextField
        style={{width:"75%",height:"50px",marginBottom:"50px"}}
          id="standard-password-input"
          label="Password"
          type="password"          
          variant="standard"
          onKeyDown={handleKeyDown}
          value={this.state.password}       
          onChange={(e) =>{ this.setState({password: e.target.value})}}
        />

        <Button variant="contained" onClick={handleLogInRequest}>Log In</Button>
      
         
    </div>
     

    );
  }
}

export default withSnackbar(LogIn);


