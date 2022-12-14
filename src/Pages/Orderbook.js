import React, { createRef } from "react";
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

import { withSnackbar } from 'notistack';


class OrderBook extends React.Component {

  constructor(props) {
    super(props)

    this.textRef = createRef();

    this.state = {
        struct: <h1>Kein Market geöffnet!</h1>,
        mmoptions: <MenuItem key="base" value={"none"}>Empty</MenuItem>,
        data: {},
        oil_type: "C",
        oil_strike: 0,
        oil_bs: "S",
        oil_qty: 0,
        oil_mm: "none",
        oil_price: 0,
    }
   
}

  componentDidMount(){

    this.props.ws.send("OBI");
 
  }

  render(){
    
  if (this.props.ws == null) return;
  
    const oilCommit = () =>{

      

      if(this.state.oil_price > 0){
        if(this.state.oil_qty > 0){
          if(this.props.username != this.state.oil_mm){
          let bs =  this.state.oil_bs == "B" ? "S":"B" ;
          this.props.ws.send('OB{"MM":"' + this.state.oil_mm + '","strikeID":' + this.state.oil_strike + ',"optionType":"' + this.state.oil_type + '","side":"' + bs + '","price":' + this.state.oil_price + ', "quantity":' + parseInt( this.state.oil_qty.toString()) + ',"operator":"-", "username":"'+ this.props.username +'"  }'); 
          }else{
            this.props.enqueueSnackbar('Self hit prevention!', { variant: 'error' });
          }
        }else{
            this.props.enqueueSnackbar('Quantity kann nicht 0 sein', { variant: 'error' });
        }
     
        }else{
        this.props.enqueueSnackbar('Price kann nicht 0 sein', { variant: 'error' });
      }
    }


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      oilCommit();
    } else if (event.key === ',' || event.key === '.') {
         event.preventDefault();
    }
  }

  this.props.ws.onmessage = function (event) {
    
    try {    
     
      if(event.data == "500"){
        this.props.enqueueSnackbar('Kauf erfolgreich!', { variant: 'success' });

      }else if(event.data == "501"){
        this.props.enqueueSnackbar('Nicht genug Stücke verfügbar!', { variant: 'error' });

      }else if(event.data == "502"){
        this.props.enqueueSnackbar('Keine Position zu hitten!', { variant: 'error' });

      }else if(event.data.substring(0, 19) === "OrderUpdateResponse"){

      const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};
     
      let tmpData = {...this.state.data};
      
      let jsonResponse = JSON.parse(event.data.substring(19) );
      let structFull = [];
      let mmOptionsFull = [];
        
      let firstActive = null;

      for(let p = 0; p < jsonResponse.length; p++) {
      let jsonObject = jsonResponse[p];

      if(jsonObject.active !== "True") continue;

      if (firstActive == null) firstActive = p;
      let C_B = [];
      let C_S = [];
      let P_B = [];
      let P_S = [];
      let MM = jsonObject.MM.name;

      mmOptionsFull.push(<MenuItem key="MM" value={MM.toString()}>{MM}</MenuItem>)
 


     

      for(let i = 0; i < jsonObject.Calls.BuySide.length; i++) {
        let obj = jsonObject.Calls.BuySide[i];  

        C_B.push([obj.item[0].price,obj.item[0].qty, obj.item[0].active]);
      }

      for(let i = 0; i < jsonObject.Calls.SellSide.length; i++) {
        let obj = jsonObject.Calls.SellSide[i];
        C_S.push([obj.item[0].price,obj.item[0].qty, obj.item[0].active]);
      }

      for(let i = 0; i < jsonObject.Puts.BuySide.length; i++) {
        let obj = jsonObject.Puts.BuySide[i];
        P_B.push([obj.item[0].price,obj.item[0].qty, obj.item[0].active]);
      }

      for(let i = 0; i < jsonObject.Puts.SellSide.length; i++) {
        let obj = jsonObject.Puts.SellSide[i];
        P_S.push([obj.item[0].price,obj.item[0].qty, obj.item[0].active]);
      }



      let tmpStruct = [ <tr><td>{MM}</td><td/><td>CALLS</td><td/><td/><td/><td/><td>PUTS</td></tr>];

      for(let i = 0; i < jsonObject.Calls.BuySide.length; i++) {
        tmpStruct.push(
          <tr >
            <td></td>
            <td style={{width:"10%", userSelect:"none"}} onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "C",
              oil_strike: i,
              oil_bs: "B",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: C_S[i][0]
            });
            }}>{C_S[i][1] == 0 || C_S[i][2] == 'N'  ? "" : C_S[i][1]}</td>
            <td style ={{backgroundColor:"#fca0a2",width:"10%",  userSelect:"none"}} onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "C",
              oil_strike: i,
              oil_bs: "B",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: C_S[i][0]
            });
            }}>{C_S[i][0] == 0 || C_S[i][2] == 'N'  ? "" : C_S[i][0]}</td> 
            <td style ={{backgroundColor:"#a1e9a0", width:"10%", userSelect:"none"}} onClick={() => {
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "C",
              oil_strike: i,
              oil_bs: "S",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: C_B[i][0]
            });
            }}>{C_B[i][0] == 0 || C_B[i][2] == 'N'  ? "" : C_B[i][0]}</td>
            <td style={{width:"10%", userSelect:"none"}}  onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "C",
              oil_strike: i,
              oil_bs: "S",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: C_B[i][0]
            });
            }}>{C_B[i][1] == 0 || C_B[i][2] == 'N'  ? "" : C_B[i][1]}</td>
            <td style={{width:"10%", userSelect:"none"}} >{strikeMap[i]}</td>
            <td style={{width:"10%", userSelect:"none"}}  onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "P",
              oil_strike: i,
              oil_bs: "B",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: P_S[i][0]
            });
            }}>{P_S[i][1] == 0 || P_S[i][2] == 'N'  ? "" : P_S[i][1]}</td>
            <td style ={{backgroundColor:"#fca0a2",width:"10%",  userSelect:"none"}}  onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "P",
              oil_strike: i,
              oil_bs: "B",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: P_S[i][0]
            });
            }}>{P_S[i][0] == 0 || P_S[i][2] == 'N'  ? "" : P_S[i][0]}</td>
            <td style ={{backgroundColor:"#a1e9a0", width:"10%", userSelect:"none"}}  onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "P",
              oil_strike: i,
              oil_bs: "S",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: P_B[i][0]
            });
            }}>{P_B[i][0] == 0 || P_B[i][2] == 'N'  ? "" : P_B[i][0]}</td>
            <td style={{width:"10%", userSelect:"none"}}  onClick={() => {              
              this.textRef.current.focus();
              this.setState({ 
              oil_type: "P",
              oil_strike: i,
              oil_bs: "S",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: P_B[i][0]
            });
            }}>{P_B[i][1] == 0 || P_B[i][2] == 'N'  ? "" : P_B[i][1]}</td>
          </tr>
        );
      }


      let base = <table style = {{width:"75vw", textAlign:"center", marginBottom:"50px", borderCollapse:"collapse"}}>
      <thead>
        <tr>
          <th>MM</th>
          <th>QTY</th>
          <th>BID</th>
          <th>ASK</th>
          <th>QTY</th>
          <th>STRIKE</th>
          <th>QTY</th>
          <th>BID</th>
          <th>ASK</th>
          <th>QTY</th>
          </tr>
      </thead>
      <tbody>
      
      {tmpStruct}

      </tbody>
  
      </table> ;


      structFull.push(base);    

      tmpData[MM] = [C_B,C_S,P_B,P_S];     
      }
      if(this.state.oil_mm == "none") this.setState({struct: structFull, data : tmpData, mmoptions: mmOptionsFull,  oil_mm: jsonResponse[firstActive].MM.name });
      else this.setState({struct: structFull, data : tmpData, mmoptions: mmOptionsFull});
    }
    } catch (err) {
      console.log(err);
    }
  
  }.bind(this);

    
 
    return (<div style={{display:"flex", flexDirection:"column",  alignItems:"center"}}>

      <div style={{height:"100px", width:"50vw",backgroundColor: this.state.oil_bs === "S" ? "#fca0a2":"#a1e9a0", marginBottom:"50px", display:"flex", justifyContent:"center", alignItems:"center"}}>
        
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label-mm">Market</InputLabel>
          <Select   
          labelId="demo-simple-select-standard-label-mm"
          id="demo-simple-select-standard-mm"     
          value={this.state.oil_mm}
          label="Type"
          onChange={(e) =>{ this.setState({oil_mm: e.target.value})}}
        >
          {this.state.mmoptions}        
                  
        </Select> 
        </FormControl>

        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Type</InputLabel>
          <Select   
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"     
          value={this.state.oil_type}
          label="Type"
          onChange={(e) =>{ this.setState({oil_type: e.target.value})}}
        >
          <MenuItem key="C" value={"C"}>Call</MenuItem>
          <MenuItem key="P" value={"P"}>Put</MenuItem> 
         
        </Select> 
        </FormControl>

        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label-BS">B/S</InputLabel>
          <Select   
          labelId="demo-simple-select-standard-label-BS"
          id="demo-simple-select-standard-BS"     
          value={this.state.oil_bs}
          label="Type"
          onChange={(e) =>{ this.setState({oil_bs: e.target.value})}}
        >
          <MenuItem key="B" value={"B"}>Buy</MenuItem>
          <MenuItem key="S" value={"S"}>Sell</MenuItem>
         
         
        </Select> 
        </FormControl>

        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label-s">Strike</InputLabel>
          <Select   
          labelId="demo-simple-select-standard-label-s"
          id="demo-simple-select-standard-s"     
          value={this.state.oil_strike}
          label="Type"
          onChange={(e) =>{ this.setState({oil_strike: e.target.value})}}
        >
          

          <MenuItem key="0" value={0}>12:00</MenuItem>
          <MenuItem key="1" value={1}>12:15</MenuItem>
          <MenuItem key="2" value={2}>12:30</MenuItem>
          <MenuItem key="3" value={3}>12:45</MenuItem>
          <MenuItem key="4" value={4}>13:00</MenuItem>
          <MenuItem key="5" value={5}>13:15</MenuItem>
          <MenuItem key="6" value={6}>13:30</MenuItem>
          <MenuItem key="7" value={7}>13:45</MenuItem>
          <MenuItem key="8" value={8}>14:00</MenuItem>
          
         
        </Select> 
        </FormControl>

        <TextField
          inputRef={this.textRef}
          id="filled-number"
          label="Quantity"
          type="number"
          value={this.state.oil_qty}
          style= {{width:"125px", marginRight:"10px"}}
          onKeyDown={handleKeyDown}          
          onChange={(e) =>{ 

     

            if(e.target.value < 0)
            {
              this.setState({oil_qty: 0});
            }else{                                      
              this.setState({oil_qty: parseInt(e.target.value.toString())});
            }          
          
          
          }}
          InputLabelProps={{
            shrink: true,            
          }}
          variant="standard"
        />

        <TextField
          id="standard-read-only-input"
          label="Price"
          style= {{width:"125px", marginRight:"10px"}}
          value={this.state.oil_price}
          InputProps={{
            readOnly: true,
          }}
          variant="standard"
        />

        <Button variant="contained" onClick={oilCommit}>
          {this.state.oil_bs === "B" ? "Buy" : "Sell"}          
        </Button>

          
      </div>
      
      {this.state.struct}
        
    </div>
      
    );
  }
}

export default withSnackbar(OrderBook);

/*

    <tr>

        </tr>
<div> {this.state.bids}</div>
      <Button variant="contained"  onClick={this.send} >Contained</Button>
      */