import React, { useState,createRef } from "react";
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';


export default class QuoteBook extends React.Component {

  constructor(props) {
    super(props)

    this.textRef = createRef();

    this.state = {
        struct: <td>empty</td>,
        ws: null,
        data: {},
        oil_type: "C",
        oil_strike: 0,
        oil_bs: "S",
        oil_qty: 0,
        oil_mm: "Marco",
        oil_price: 0,
    }
   
}

  componentDidMount(){

    const socket = new WebSocket("ws://192.168.0.155:12345");
    this.setState({ws: socket});

  }

  send = () =>  {    
    this.state.ws.send("Moin");   
    console.log("yes")
  }

  render(){
    
  if (this.state.ws == null) return;
  
    const oilCommit = () =>{
      if(this.state.oil_price > 0){
        let bs =  this.state.oil_bs == "B" ? "S":"B" ;
      this.state.ws.send('QB{"MM":"' + this.state.oil_mm + '","strikeID":' + this.state.oil_strike + ',"optionType":"' + this.state.oil_type + '","side":"' + bs+ '","price":' + parseFloat( this.state.oil_price.toString())  + ', "quantity":' + parseInt( this.state.oil_qty.toString()) + ',"operator":"+"  }'); 
      }else{
        console.log("Price = 0")
      }
    }

    const oilCommitParameter = (mm, strike ,type ,bs, price, qty,operator) =>{
      if(price > 0){
      this.state.ws.send('QB{"MM":"' + mm + '","strikeID":' + strike + ',"optionType":"' + type + '","side":"' + bs + '","price":' + parseFloat( price.toString())  + ', "quantity":' + parseInt( qty.toString()) + ',"operator":"' + operator+'"  }'); 
      }else{
        console.log("Price = 0")
      }
    }


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      oilCommit();
    }
  }

  this.state.ws.onopen = (event) => {

    this.state.ws.send('QBI{"MM":"Marco"}');
    
  };



  this.state.ws.onmessage = function (event) {
    
    try {    
     
      const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};
      let tmpData = {...this.state.data};      
   
      let jsonResponse = JSON.parse(event.data);

      let jsonObject = null;

      for(let p = 0; p < jsonResponse.length; p++) {
        if(jsonResponse[p].MM.name == "Marco")
        jsonObject = jsonResponse[p];
      }
     
      let structFull = [];     
      
      let C_B = {};
      let C_S = {};
      let P_B = {};
      let P_S = {};
      let MM = jsonObject.MM.name;

      let max = {};
     

      for(let i = 0; i < jsonObject.Calls.BuySide.length; i++) {
        let obj = jsonObject.Calls.BuySide[i];  
        let tmpArray = []

        max[i] = obj.item.length;

        for(let p = 0; p < obj.item.length; p++) {
          tmpArray.push([obj.item[p].price,obj.item[p].qty]);
        }
        C_B[i] = tmpArray;
       
      }

      for(let i = 0; i < jsonObject.Calls.SellSide.length; i++) {
        let obj = jsonObject.Calls.SellSide[i];
        let tmpArray = []

        if(max[i] < obj.item.length) max[i] = obj.item.length;

        for(let p = 0; p < obj.item.length; p++) {
          tmpArray.push([obj.item[p].price,obj.item[p].qty]);
        }
        C_S[i] = tmpArray;

      
      }

      for(let i = 0; i < jsonObject.Puts.BuySide.length; i++) {
        let obj = jsonObject.Puts.BuySide[i];
        let tmpArray = []

        if(max[i] < obj.item.length) max[i] = obj.item.length;

        for(let p = 0; p < obj.item.length; p++) {
          tmpArray.push([obj.item[p].price,obj.item[p].qty]);
        }
        P_B[i] = tmpArray;
       
      }

      for(let i = 0; i < jsonObject.Puts.SellSide.length; i++) {
        let obj = jsonObject.Puts.SellSide[i];
        let tmpArray = []

        if(max[i] < obj.item.length) max[i] = obj.item.length;

        for(let p = 0; p < obj.item.length; p++) {
          tmpArray.push([obj.item[p].price,obj.item[p].qty]);
        }
        P_S[i] = tmpArray;
      }
      let maxInt = 0;

      for(const [key, val] of Object.entries(max)) {
        maxInt = maxInt + val;
      }
      

      let tmpStruct = [ <tr><td>{MM}</td><td/><td>CALLS</td><td/><td/><td/><td/><td>PUTS</td></tr>];

      for(let i = 0; i < maxInt; i++) {
   

        for(let p = 0; p < max[i]; p++) {
          let k = false;       
          if( p + 1 == max[i]) k  = true;
        tmpStruct.push(
          <tr>
            <td></td>
            <td style={{width:"10%", userSelect:"none"}}    onMouseDown={(e) => {			
            
            if(e.button === 0 ){  
              if((C_S[i].length > p ? C_S[i][p][0] : 0 )== 0){
                setTimeout(() => { 
                this.textRef.current.focus();
                }, 1);
                this.setState({ 
                  oil_type: "C",
                  oil_strike: i,
                  oil_bs: "B",
                  oil_qty: 0,
                  oil_mm: MM,
                  oil_price: C_S[i].length > p ? C_S[i][p][0] : 0
                });

              }else{
                let price = C_S[i][p][0];
                let qty = C_S[i][p][1];
  
                oilCommitParameter(MM, i , "C" , "S" , price, qty,"-");
              }                     
            

            }
            
            }}>{ C_S[i].length > p ? C_S[i][p][1] == 0 ? "" : C_S[i][p][1]  :""}</td>
            <td style ={{backgroundColor:"#fca0a2",width:"10%",  userSelect:"none"}}   onMouseDown={(e) => {
						
              if( e.button === 1 ) {
              e.preventDefault()
              let price = C_S[i][p][0];
              let qty = C_S[i][p][1];

              if(price - 0.01 > 0)
              oilCommitParameter(MM, i , "C" , "S" , (price - 0.01).toFixed(2), qty,"+");	
              
              
            }}}>{ C_S[i].length > p ? C_S[i][p][0] == 0 ? "" : C_S[i][p][0]  : ""}</td> 
            <td style ={{backgroundColor:"#a1e9a0", width:"10%", userSelect:"none"}}   onMouseDown={(e) => {
						
              if( e.button === 1 ) {
              e.preventDefault()
              let price = C_B[i][p][0];
              let qty = C_B[i][p][1];

              if(price - 0.01 > 0)
              oilCommitParameter(MM, i , "C" , "B" , (price - 0.01).toFixed(2) , qty,"+");	
              
              }
              }}>{C_B[i].length > p ? C_B[i][p][0] == 0 ? "" : C_B[i][p][0] : ""}</td>
            <td style={{width:"10%", userSelect:"none"}}    onMouseDown={(e) => {
              if(e.button === 0 ){  
              if((C_B[i].length > p ? C_B[i][p][0] : 0 )== 0){
                setTimeout(() => { 
                this.textRef.current.focus();
                }, 1);
                this.setState({ 
                  oil_type: "C",
                  oil_strike: i,
                  oil_bs: "S",
                  oil_qty: 0,
                  oil_mm: MM,
                  oil_price: C_B[i].length > p ? C_B[i][p][0] : 0
                });

              }else{
                let price = C_B[i][p][0];
                let qty = C_B[i][p][1];
  
                oilCommitParameter(MM, i , "C" , "B" , price, qty,"-");
              }

            }}}>{C_B[i].length > p ? C_B[i][p][1] == 0 ? "" : C_B[i][p][1] : ""}</td>
            <td style={{width:"10%", userSelect:"none"}} >{strikeMap[i]}</td>
            <td style={{width:"10%", userSelect:"none"}}    onMouseDown={(e) => {


              if(e.button === 0 ){            
              if((P_S[i].length > p ? P_S[i][p][0] : 0) == 0){ 
                setTimeout(() => { 
                this.textRef.current.focus();
                }, 1);
              this.setState({ 
              oil_type: "P",
              oil_strike: i,
              oil_bs: "B",
              oil_qty: 0,
              oil_mm: MM,
              oil_price: P_S[i].length > p ? P_S[i][p][0] : 0
            });}else{
              let price = P_S[i][p][0];
              let qty = P_S[i][p][1];

              oilCommitParameter(MM, i , "P" , "S" , price, qty,"-");
            }
            }
            }}>{P_S[i].length > p ? P_S[i][p][1] == 0 ? "" : P_S[i][p][1] :""}</td>
            <td style ={{backgroundColor:"#fca0a2",width:"10%",  userSelect:"none"}}    onMouseDown={(e) => {
						
              if( e.button === 1 ) {
              e.preventDefault()
              let price = P_S[i][p][0];
              let qty = P_S[i][p][1];
              if(price - 0.01 > 0)
              oilCommitParameter(MM, i , "P" , "S" , (price - 0.01).toFixed(2), qty,"+");	
              
              }
              }}>{P_S[i].length > p ? P_S[i][p][0] == 0 ? "" : P_S[i][p][0] : ""}</td>
            <td style ={{backgroundColor:"#a1e9a0", width:"10%", userSelect:"none"}}    onMouseDown={(e) => {
			
              if( e.button === 1 ) {
              e.preventDefault()
              let price = P_B[i][p][0];
              let qty = P_B[i][p][1];

              if(price - 0.01 > 0)
              oilCommitParameter(MM, i , "P" , "B" , (price - 0.01).toFixed(2), qty,"+");	
              
              }}}>{P_B[i].length > p ? P_B[i][p][0] == 0 ? "" : P_B[i][p][0] : ""}</td>
            <td style={{width:"10%", userSelect:"none"}}    onMouseDown={(e) => {

              if(e.button === 0 ){            
                if((P_B[i].length > p ? P_B[i][p][0] : 0) == 0){ 

                  setTimeout(() => { 
                  this.textRef.current.focus();
                  }, 1);

                this.setState({ 
                oil_type: "P",
                oil_strike: i,
                oil_bs: "S",
                oil_qty: 0,
                oil_mm: MM,
                oil_price: P_B[i].length > p ? P_B[i][p][0] : 0
              });}else{
                let price = P_B[i][p][0];
                let qty = P_B[i][p][1];
  
                oilCommitParameter(MM, i , "P" , "B" , price, qty,"-");
              }
              }
            
            
            }}>{P_B[i].length > p ? P_B[i][p][1] == 0 ? "" : P_B[i][p][1] : ""}</td>
          </tr>
        );
        if (k )  tmpStruct.push(<tr style={{height:"15px",width:"100%"}}class="spacer"/>);
      }
    }


      let base = <table style = {{width:"75vw", textAlign:"center", marginBottom:"50px", borderCollapse:"collapse"}}>
      <thead>
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
      </thead>
      <tbody>
      
      {tmpStruct}

      </tbody>
  
      </table> ;


      structFull.push(base);    

      tmpData[MM] = [C_B,C_S,P_B,P_S];    
      

      this.setState({struct: structFull, data : tmpData });
      
    } catch (err) {
      console.log(err);
    }
  }.bind(this);
 
    return (<div style={{display:"flex", flexDirection:"column",  alignItems:"center"}}>

      <div style={{height:"100px", width:"50vw",backgroundColor: this.state.oil_bs === "S" ? "#fca0a2":"#a1e9a0", marginBottom:"50px", display:"flex", justifyContent:"center", alignItems:"center"}}>
        
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-standard-label">Type</InputLabel>
          <Select   
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"     
          value={this.state.oil_type}
          label="Type"
          onChange={(e) =>{ this.setState({oil_type: e.target.value})}}
        >
          <MenuItem value={"C"}>Call</MenuItem>
          <MenuItem value={"P"}>Put</MenuItem> 
         
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
          <MenuItem value={"B"}>Buy</MenuItem>
          <MenuItem value={"S"}>Sell</MenuItem>
         
         
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
          

          <MenuItem value={0}>12:00</MenuItem>
          <MenuItem value={1}>12:15</MenuItem>
          <MenuItem value={2}>12:30</MenuItem>
          <MenuItem value={3}>12:45</MenuItem>
          <MenuItem value={4}>13:00</MenuItem>
          <MenuItem value={5}>13:15</MenuItem>
          <MenuItem value={6}>13:30</MenuItem>
          <MenuItem value={7}>13:45</MenuItem>
          <MenuItem value={8}>14:00</MenuItem>
          
         
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
              this.setState({oil_qty: e.target.value});
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
          type="number"
          style= {{width:"125px", marginRight:"10px"}}
          value={this.state.oil_price}     
          variant="standard"
          onKeyDown={handleKeyDown}
          onChange={(e) =>{ 

            if(e.target.value < 0)
            {
              this.setState({oil_price: 0});
            }else{                        
              this.setState({oil_price: e.target.value});
            }          
          
          
          }}
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


/*

    <tr>

        </tr>
<div> {this.state.bids}</div>
      <Button variant="contained"  onClick={this.send} >Contained</Button>
      */