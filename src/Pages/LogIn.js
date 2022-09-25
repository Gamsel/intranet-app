import React from "react";
import Button from '@mui/material/Button';

import { withSnackbar } from 'notistack';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';

class LogIn extends React.Component {

  constructor(props) {
    super(props)

    this.state = {       
        username: "",
        password: "",
        repeatpassword: "",
        oneTimeCode: "",
        type: "Login"       
    }
   
}


  handleCookie = () => {
   
    this.props.setCookie("user", this.state.username, { path: "/",maxAge: 21600 }); // setting the cookie

  };

  render(){
    
  if (this.props.ws == null) return; 
 

  this.props.ws.onmessage = function (event) {

    console.log(event.data)
    
    try {    
   
      if(event.data === "200"){
        this.handleCookie();
      }else  if(event.data === "401") {
        this.props.enqueueSnackbar('Falsches Password oder Username!', { variant: 'error' });
      }else  if(event.data === "601") {
        this.props.enqueueSnackbar('Username bereits vergeben!', { variant: 'error' });
      }else  if(event.data === "602") {
        this.props.enqueueSnackbar('Falscher one Time Code!', { variant: 'error' });
      }

      
    } catch (err) {
      console.log(err);
    }
  }.bind(this);

  const handleRegisterRequest = () => {
    if(this.state.username.length > 0){
      if(this.state.password.length > 0){
        if(this.state.password === this.state.repeatpassword ){

        this.props.ws.send('REGISTER{"user":"'+ this.state.username +'", "password":"'+ this.state.password +'", "oneTime":"'+ this.state.oneTimeCode +'" }');

        }else{
            this.props.enqueueSnackbar('Die Passwörter müssen identisch sein!', { variant: 'error' });
        }
      }else{
        this.props.enqueueSnackbar('Bitte Password eingeben', { variant: 'error' });
      }

    }else{
      this.props.enqueueSnackbar('Bitte Username eingeben', { variant: 'error' });
    }
    

  };

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
 
    return (
    
    <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center", flexDirection:"column", justifyContent:"center"}} >

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

        <div style={{width:"100%", display:"flex",alignItems:"center",  justifyContent:"center"}} >
          <Button style={{marginRight:"50px"}} variant="contained" onClick={handleLogInRequest}>Log In</Button>
          <Button variant="contained" onClick={() => {this.setState({type: "Register"})}}>Create Account</Button>
        </div>

        {this.state.type !== "Login" && 
          <div style={{display:"flex", flexDirection:"column", position:"absolute", left:"57.5%", top:"50%", width:"75%", height:"50%",backgroundColor:"#ffffff", transform: "translate(-50%, -50%)",boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px" }}>
          <div style={{display:"flex", width:"100%",justifyContent: "end" }}> 
          <CloseIcon fontSize={"large"} onClick={() => {this.setState({type: "Login"})}}/>
          </div>

          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center", flexDirection:"column", justifyContent:"center"}} >

            <TextField
            style={{width:"75%",height:"50px",marginBottom:"50px"}}
            id="Username"
            label="Username"       
            value={this.state.username}       
            onChange={(e) =>{ this.setState({username: e.target.value})}}
            variant="standard"
            />

            <TextField
            style={{width:"75%",height:"50px",marginBottom:"50px"}}
            id="standard-password"
            label="Password"
            type="password"          
            variant="standard"        
            value={this.state.password}       
            onChange={(e) =>{ this.setState({password: e.target.value})}}
            />

            <TextField
            style={{width:"75%",height:"50px",marginBottom:"50px"}}
            id="standard-password-repeat"
            label="Password wiederholen"
            type="password"          
            variant="standard"      
            value={this.state.repeatpassword}       
            onChange={(e) =>{ this.setState({repeatpassword: e.target.value})}}
            />

            <TextField
            style={{width:"75%",height:"50px",marginBottom:"50px"}}
            id="standard-password-noetime"
            label="One Time Code (MM oder Admin fragen)"
            type="password"          
            variant="standard"      
            value={this.state.oneTimeCode}       
            onChange={(e) =>{ this.setState({oneTimeCode: e.target.value})}}
            />

            <Button variant="contained" onClick={handleRegisterRequest}>Create Account</Button>

          </div>
          


          </div>        
        }
         
    </div>
     

    );
  }
}

export default withSnackbar(LogIn);


