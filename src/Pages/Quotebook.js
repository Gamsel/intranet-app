import React, { createRef } from "react";
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { withSnackbar } from 'notistack';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import CloseIcon from '@mui/icons-material/Close';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AlarmIcon from '@mui/icons-material/Alarm';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import * as XLSX from "xlsx";

class QuoteBook extends React.Component {

  constructor(props) {
    super(props)

    this.inputRef = createRef();
    this.textRef = createRef();

    this.state = {
        struct: <p>empty</p>,     
        data: {},
        oil_type: "C",
        oil_strike: 0,
        oil_bs: "S",
        oil_qty: 0,
        oil_mm: this.props.username,
        oil_price: 0,
        freezeMode: "Live" ,
        marketStatus: "Off",
        setTime: "False",
        arrivalTime: dayjs(),
    }
   
}



  componentDidMount(){
    try{
      this.props.ws.send('QBI{"MM":"'+ this.props.username +'"}');
    } catch (err) {
      console.log(err);
    }
  }

  render(){
    
  if (this.props.ws == null) return;
  
    const oilCommit = () =>{
      if(this.state.oil_price > 0){
        if(this.state.oil_qty > 0){
          let bs =  this.state.oil_bs == "B" ? "S":"B" ;
          this.props.ws.send('QB{"MM":"' + this.state.oil_mm + '","strikeID":' + this.state.oil_strike + ',"optionType":"' + this.state.oil_type + '","side":"' + bs+ '","price":' + parseFloat( this.state.oil_price.toString())  
                            + ', "quantity":' + parseInt( this.state.oil_qty.toString()) + ',"operator":"+", "mode": "' + this.state.freezeMode +'"  }');
        }else{
          this.props.enqueueSnackbar('Quantity kann nicht 0 sein', { variant: 'error' });
        }
        }else{
        this.props.enqueueSnackbar('Price kann nicht 0 sein', { variant: 'error' });
      }
    }

    const oilCommitParameter = (mm, strike ,type ,bs, price, qty, operator) =>{
      if(price > 0){
        if(qty > 0){
          this.props.ws.send('QB{"MM":"' + mm + '","strikeID":' + strike + ',"optionType":"' + type + '","side":"' + bs + '","price":' + parseFloat( price.toString())  + 
                         ', "quantity":' + parseInt( qty.toString()) + ',"operator":"' + operator+'", "mode": "' + this.state.freezeMode +'" }'); 
        }else{
          this.props.enqueueSnackbar('Quantity kann nicht 0 sein', { variant: 'error' });
        }
        }else{
        this.props.enqueueSnackbar('Price kann nicht 0 sein', { variant: 'error' });
      }
    }

    const readExcel = (e) => {
      const [file] = e.target.files;
      const reader = new FileReader();
  
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
        const lines = data.split('\n');
  
        let points = {"START":{"x": null ,"y": null}, "SPACES":[]};
        let orders = [];
  
        let active = false;
   
        exit_loops:
        for (let i = 0; i < lines.length; i++){ 
  
          if(points["START"]["x"] === null && !lines[i].includes("START")) continue;       
  
          let fields = lines[i].split(',')
  
          let orderAtLine = [];
  
          let startFound = false;
  
          let type = "C";
        
          for(let j = 0 ; j < fields.length; j++){
  
            if (!active){
  
              if(fields[j] === "START"){
                startFound = true;            
                points["START"] = {"x": j, "y":i};
              } 
  
              if(fields[j] === "SPACE") points["SPACES"].push(j);
  
            }else{   
  
             
              if(points["START"]["x"] > j || (points["START"]["x"] +  9 + points["SPACES"].length) < j || points["SPACES"].includes(j) ) continue;
              if(fields[j] === "END"){        
                break exit_loops;  
              }         
              
      
              orderAtLine.push(fields[j]);            
  
            }           
            
            
            if (orderAtLine.length === 5){
  
              if(parseFloat(orderAtLine[1]) > 0 && parseInt(orderAtLine[0]) > 0)
              orders.push({"mm": this.props.username, "strike": orderAtLine[2], "type": type,"bs": "B","price": parseFloat(orderAtLine[1]), "qty": parseInt(orderAtLine[0]) ,"operator": "+"});
              if(parseFloat(orderAtLine[3]) > 0 && parseInt(orderAtLine[4]) > 0)
              orders.push({"mm": this.props.username, "strike": orderAtLine[2], "type": type,"bs": "S","price":parseFloat(orderAtLine[3]), "qty": parseInt(orderAtLine[4]) ,"operator": "+"});
  
              type === "C" ? type = "P" : type = "C";
  
              orderAtLine = [];
            }
           
          }       
  
          if(startFound) active = true; 
          
        }

        const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};
         
        for (let i = 0; i < orders.length; i++){    
          const strikeID =  Object.keys(strikeMap).find(key => strikeMap[key] === orders[i].strike);
          if (strikeID != undefined){
            oilCommitParameter(orders[i].mm, strikeID, orders[i].type, orders[i].bs, orders[i].price, orders[i].qty, orders[i].operator);
          }else{
            this.props.enqueueSnackbar('Excel: Strike muss zwischen 12 und 14 Uhr liegen darf nur 15 Minuten Schritte beinhalten: ' + orders[i].strike , { variant: 'error' });
          }
          
        }
  
     
      };
      reader.readAsBinaryString(file);
    };


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      oilCommit();
    } else if (event.key === ',' || event.key === '.') {
       event.preventDefault();
    }
  }


  const handleSpeedDialClick = (operation) => {
    if(operation === "Close"){

      this.props.ws.send('QBMarketStatus{"MM":"'+ this.props.username +'","type":"Off"}');
      this.setState({ marketStatus: "Off" });

    }else if(operation === "Live"){

      this.props.ws.send('QBLIVE{"MM":"'+ this.props.username +'"}');
      this.setState({freezeMode:"Live"});

    }else if(operation === "Freeze"){

      this.setState({freezeMode:"Freeze"});

    }else if(operation === "setTime"){

      this.setState({setTime:"True"});

    }
 
   

  }

  this.props.ws.onmessage = function (event) {
    
    try {    
      if(event.data.substring(0, 19) === "OrderUpdateResponse"){
      const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};
      let tmpData = {...this.state.data};      
   
      let jsonResponse = JSON.parse(event.data.substring(19));

      let jsonObject = null;

      for(let p = 0; p < jsonResponse.length; p++) {
        if(jsonResponse[p].MM.name == this.props.username)
        jsonObject = jsonResponse[p];
      }     
    

      if(jsonObject.active !== "True"){

        let jsx =
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>

          <h1>Market is Offline</h1>
          <Button variant="contained" onClick={() => { this.props.ws.send('QBMarketStatus{"MM":"'+ this.props.username +'","type":"Live"}');}}>
            Open Market       
          </Button>
        </div>

        this.setState({struct: jsx});
        return;
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

        max[i] =  obj.item.length;

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
        if (k )  tmpStruct.push(<tr style={{height:"15px",width:"100%"}}/>);
      }
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
      

      this.setState({struct: structFull, data: tmpData , marketStatus: "Live" });
  }
    } catch (err) {
      console.log(err);
    }
  }.bind(this);

    const actions = [
      { icon: <CloseIcon />, name: 'Close Market', operation: "Close"},  
      { icon: this.state.freezeMode == "Freeze" ? <WhatshotIcon /> :  <AcUnitIcon />  , name:  this.state.freezeMode == "Freeze" ?  'Go Live' : 'Freeze Mode', operation: this.state.freezeMode == "Freeze" ?  'Live' : 'Freeze' },
      { icon: <AlarmIcon/> , name:  "Set Arrival Time", operation: "setTime" },

    ];
 
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div style={{display:"flex", flexDirection:"column",  alignItems:"center"}}>

      { this.state.marketStatus === "Live" && <div style={{height:"100px", width:"50vw",backgroundColor: this.state.oil_bs === "S" ? "#fca0a2":"#a1e9a0", marginBottom:"50px", display:"flex", justifyContent:"center", alignItems:"center"}}>
        
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
          type="number"
          style= {{width:"125px", marginRight:"10px"}}
          value={this.state.oil_price}     
          variant="standard"
          onKeyDown={(event) => { if (event.key === 'Enter') {
            oilCommit();
          }}}
          onChange={(e) =>{ 

            if(e.target.value < 0)
            {
              this.setState({oil_price: 0});
            }else{                        
              this.setState({oil_price: parseFloat(e.target.value.toString())});
            }          
          
          
          }}
        />

        <Button variant="contained" onClick={oilCommit}>
          {this.state.oil_bs === "B" ? "Buy" : "Sell"}          
        </Button>

          
      </div>}
      
      {this.state.struct}


      {this.state.freezeMode == "Live" && this.state.marketStatus === "Live" && <h1 style={{color:"red"}}> Live </h1>}
      {this.state.freezeMode == "Freeze" && this.state.marketStatus === "Live" && <h1 style={{color:"blue"}}> Freeze Mode</h1>}

      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => { 
              handleSpeedDialClick(action.operation)
          }}
          />
        ))}     

        <SpeedDialAction        
            key={"Upload Excel"}
            icon={<FileUploadIcon />}
            tooltipTitle={"Upload Excel"}
            onClick={() => { 
              this.inputRef.current.click()          
          }}
          />


      </SpeedDial>

      <input type="file" ref={this.inputRef} style={{display:"none"}} onClick={(e)=> {e.target.value = null}} onChange={readExcel}></input>

      {this.state.setTime === "True" && 
          <div style={{display:"flex", flexDirection:"column", position:"absolute", left:"57.5%", top:"50%", width:"75%", height:"50%",backgroundColor:"#ffffff", transform: "translate(-50%, -50%)",boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px" }}>
          <div style={{display:"flex", width:"100%",justifyContent: "end" }}> 
          <CloseIcon fontSize={"large"} onClick={() => {this.setState({setTime: "False"})}}/>
          </div>

          <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center", flexDirection:"column", justifyContent:"space-evenly"}} >
          <h2>Set Arrival Time</h2>

          <TimePicker
          ampm={false}
          openTo="hours"
          views={['hours', 'minutes', 'seconds']}
          inputFormat="HH:mm:ss"
          mask="__:__:__"
          label="Arrival Time"
          value={this.state.arrivalTime}
          onChange={(newValue) => {
           this.setState({arrivalTime: newValue})
          }}
          renderInput={(params) => <TextField {...params} />}
        />

            <Button variant="contained" onClick={() => {
              this.setState({setTime: "False"}); 
              this.props.ws.send('SETARRIVAL{"time":"'+ this.state.arrivalTime.toDate()+'"}');
                 

              }} >Confirm Arrival Time</Button>

          </div>
          


          </div>        
        }
        
    </div>
    </LocalizationProvider>
      
    );
  }
}

export default withSnackbar(QuoteBook);

