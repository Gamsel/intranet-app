import React from "react";
import { withSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { visuallyHidden } from '@mui/utils';
import { ResponsiveLine } from '@nivo/line'


function createData(index,strikeID, optionType, side, price, quantity, cp) {
    return {
        index, strikeID, optionType, side, price, quantity, cp,
    };
}
    
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  
const headCells = [
    {
        id: 'Strike',
        numeric: false,
        disablePadding: true,
        label: 'Strike',
    },
    {
        id: 'optionType',
        numeric: false,
        disablePadding: true,
        label: 'P/C',
    },
    {
        id: 'side',
        numeric: false,
        disablePadding: true,
        label: 'B/S',
    },
    {
        id: 'price',
        numeric: false,
        disablePadding: true,
        label: 'Price',
    },
    {
        id: 'quantity',
        numeric: false,
        disablePadding: true,
        label: 'QTY',
    },
    {
        id: 'cp',
        numeric: false,
        disablePadding: true,
        label: 'CounterPart',
    },
    {
        id: 'cv',
        numeric: false,
        disablePadding: true,
        label: 'Current Value',
    }


  ];
  
function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };
  
const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;
  
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Position
          </Typography>
        )}

      </Toolbar>
    );
  };
  
EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };


class Portfolio extends React.Component {    

  constructor(props) {
    super(props)

    this.state = {
       struct:<p>Empty</p>,
       order:"asc",
       orderBy:"calories",
       selected:[],
       page:0,
       dense:true,
       rowsPerPage:100,
       rows:[],
       time: new Date(Date.now()),  
       arrived: false,       
       plotData: [],
       plotDataSelect: [],
       groupedValue: {}
    }

    }

    componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed
        if (prevState.selected !== this.state.selected) {
            this.setPlotDataSelection()
        }

        if (prevState.plotDataSelect !== this.state.plotDataSelect) {
            this.generatePlotData()
        }

        if (prevState.rows !== this.state.rows) {
            this.generatePlotData()
        }

        if (prevState.time.getTime() !== this.state.time.getTime()) {
            this.getGroupedPrices()
        }

        if (prevState.arrived !== this.state.arrived) {    
           
            if(this.state.arrived){             
                clearInterval(this.interval);               
            }       
           
        }


        
      }


    getGroupedPrices = () =>{
        let current = {};

        const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};     

        for(let i = 0; i < this.state.rows.length; i++){

            const row = this.state.rows[i];

            const value = Math.round(this.getCurrentValue(row.side,row.optionType,strikeMap[row.strikeID],row.quantity, this.state.time ,row.price)*100) / 100;

            if(current[row.cp] == undefined) current[row.cp] = value;
            else current[row.cp] = current[row.cp] + value;

        }
      

        this.setState({groupedValue: current});
    }
    
    getTimeDiff = (start, end) => {    

        start = start.split(':');    
        start.push(0)
    
        for(let i = 0; i< start.length; i++){
            start[i] = parseInt(start[i])
        }
         
        let startSecounds = start[0] * 3600 + start[1] * 60 + start[2]
        let endSecounds = end.getHours() * 3600 + end.getMinutes() * 60 + end.getSeconds()
    
        return  endSecounds - startSecounds;
    
    
    
    }    
    
    getCurrentValue = (BuySell, CallPut, Strike, quantity,currentTime, price ) => {
    
        if(BuySell == "B"){
    
            if(CallPut== "C"){
    
                let timeDiff = this.getTimeDiff(Strike,currentTime) / 60
    
               
                if(timeDiff > 0){               
                    return timeDiff * 0.1 * quantity + price * quantity * -1;
                }else{
                    return  price * quantity * -1;
                }
            
    
    
            }else{
    
                let timeDiff =  this.getTimeDiff(Strike,currentTime) / 60
                
                if(timeDiff < 0){
                    return timeDiff * -0.1 * quantity + price * quantity * -1;
                }else{
                    return  price * quantity * -1;
                }
              
            }
        }else{
    
            if(CallPut== "C"){
    
                let timeDiff =  this.getTimeDiff(Strike,currentTime) / 60
    
                if(timeDiff < 0){
                    return price * quantity;
                }else{
                    return timeDiff * -0.1 * quantity + price * quantity;
                }
    
               
            }else{
    
                let timeDiff =  this.getTimeDiff(Strike,currentTime) / 60
                
                if(timeDiff > 0){
                    return  price * quantity;
                }else{
                    return timeDiff * 0.1 * quantity + price * quantity ;
                }
    
            }
    
        }
      
    };

    setPlotDataSelection = () =>{
        let selection = [];

        for(let i = 0; i < this.state.selected.length; i++){
            selection.push(this.state.rows[this.state.selected[i]]);
        }
      

        this.setState({plotDataSelect: selection});

    }

    generatePlotData = () => {
        let plotData = []

        let baseData = null;

 

        if(this.state.plotDataSelect.length > 0){
            baseData = this.state.plotDataSelect;    

            for(let i = 0; i < baseData.length; i++){

                let data = [];
                const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};                

                for(let p = 0; p <= 150; p += 5){

                    let time = null;
                
                    time = new Date(1970,1,1,12,p,0);
                
                    let value = this.getCurrentValue(
                        baseData[i].side,
                        baseData[i].optionType,
                        strikeMap[baseData[i].strikeID] ,
                        baseData[i].quantity,
                        time,
                        baseData[i].price);


                    value = Math.round(value * 100) / 100;

                    let min = "";

                    if( time.getMinutes() < 10){
                        min = "0" + time.getMinutes().toString()
                    }else{
                        min = time.getMinutes().toString()
                    }


                    data.push({
                        "x": time.getHours().toString()+":"+ min,
                        "y": value
                    });
                    
                        

                }
                
                plotData.push(
                    {
                        "id": strikeMap[baseData[i].strikeID] + " " + baseData[i].optionType  + " " + baseData[i].side + " @" + baseData[i].price,
                        "data": data
                    }  



                )

            }

        }else{                
            baseData = this.state.rows;    

            let data = [];
                const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};                

                for(let p = 0; p <= 150; p += 5){
           
                    let time = new Date(1970,1,1,12,p,0);

                    let value = 0

                    for(let i = 0; i < baseData.length; i++){

                        let tmpValue = this.getCurrentValue(
                            baseData[i].side,
                            baseData[i].optionType,
                            strikeMap[baseData[i].strikeID] ,
                            baseData[i].quantity,
                            time,
                            baseData[i].price);    
    
                        value = value + Math.round(tmpValue * 100) / 100;

                    }

                    let min = "";

                    if( time.getMinutes() < 10){
                        min = "0" + time.getMinutes().toString()
                    }else{
                        min = time.getMinutes().toString()
                    }


                    data.push({
                        "x": time.getHours().toString()+":"+ min,
                        "y": value
                    });
                    
                        

                }
                
                plotData.push(
                    {
                        "id": "All",
                        "data": data
                    }  
                )

        
        }

        this.setState({plotData: plotData })
    }

    handleTime = () => {

        let date = new Date(Date.now());


        this.setState({ time: date });
    }

    componentDidMount(){
    try{
        this.props.ws.send('PI{"user":"'+ this.props.username +'"}');

        this.handleTime();

        this.getGroupedPrices()

        this.interval = setInterval(() =>{ this.handleTime()}, 1000);
    } catch (err) {
        console.log(err);
    }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

  render(){   

  this.props.ws.onmessage = function (event) {
    
    try {        
       
      if(event.data.substring(0, 15) === "PortfolioUpdate"){    

      let jsonResponse = JSON.parse(event.data.substring(15));

      let jsonObjectRaw = null;
      
  

      for(let p = 0; p < jsonResponse.length - 1; p++) { 
        if(jsonResponse[p].name == this.props.username)
        jsonObjectRaw = jsonResponse[p];
      }

      

      if(jsonObjectRaw.data == 420){
        this.setState({struct: <h1>No Positions</h1>})
        if(jsonResponse[jsonResponse.length - 1].arrivalTime !== 'None'){
            const time = new Date(jsonResponse[jsonResponse.length - 1].arrivalTime);        
            this.setState({arrived: true, time: time});
        }
        return;
      }

       let tmpRows = [];

       let jsonObject = jsonObjectRaw.data;

        for(let p = 0; p < jsonObject.length; p++) { 
            tmpRows.push(createData(p, jsonObject[p]['strikeID'], jsonObject[p]['optionType'],jsonObject[p]['side'],jsonObject[p]['price'],jsonObject[p]['quantity'],jsonObject[p]['cp']))            
        }       


        if(jsonResponse[jsonResponse.length - 1].arrivalTime !== 'None'){
            const time = new Date(jsonResponse[jsonResponse.length - 1].arrivalTime);  
            this.setState({rows: tmpRows,arrived: true, time: time });
        }else{
            this.setState({rows: tmpRows});
        }
       
 

     }
    } catch (err) {
      console.log(err);
    }
  }.bind(this);

  const strikeMap = { 0: "12:00", 1:"12:15" , 2:"12:30" , 3:"12:45" , 4:"13:00", 5:"13:15" , 6:"13:30" ,  7:"13:45" , 8:"14:00"};

  const handleRequestSort = (event, property) => {
    const isAsc = this.state.orderBy === property && this.state.order === 'asc';
    this.setState({order: isAsc ? 'desc' : 'asc',orderBy:property});
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = this.state.rows.map((n) => n.index);
      this.setState({selected:newSelected});
      return;
    }
    this.setState({selected:[]});
  };

  const handleClick = (event, name) => {
    const selectedIndex = this.state.selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat( this.state.selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat( this.state.selected.slice(1));
    } else if (selectedIndex ===  this.state.selected.length - 1) {
      newSelected = newSelected.concat( this.state.selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        this.state.selected.slice(0, selectedIndex),
        this.state.selected.slice(selectedIndex + 1),
      );
    }

    this.setState({selected:newSelected});
  };

  const handleChangePage = (event, newPage) => {
 
    this.setState({page:newPage});
  };

  const handleChangeRowsPerPage = (event) => {
    this.setState({rowsPerPage:parseInt(event.target.value, 10), page: 0});
  };

  const isSelected = (name) => this.state.selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty this.state.rows.
  const emptyRows =
    this.state.page > 0 ? Math.max(0, (1 +  this.state.page) *  this.state.rowsPerPage - this.state.rows.length) : 0;


   let groupedPrices = [];

   for(let [key, val] of Object.entries(this.state.groupedValue)) {

        groupedPrices.push(<div style={{width:"100%", display:"flex",flexDirection:"column",alignItems:"center"}} key ={key}>
            <h3 style={{margin:"0"}}>{key}</h3>
            <h4 style={{marginTop:"0"}}>{Math.round(val*100)/100} GP</h4>

        </div>);   
    }



  


  return ( <div style={{display:"flex", flexDirection:"column",alignItems:"center"}}>

    <div style={{height:"40vh",width:"100%"}}>
    
   
        <ResponsiveLine
            data={this.state.plotData}
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 'auto',
                max: 'auto',
                stacked: false,
                reverse: false
            }}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                orient: 'bottom',
                tickSize: 0,
                tickPadding: 5,
                tickRotation: -90,
                legend: 'Strike',
                legendOffset: 45,
                legendPosition: 'middle'
            }}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'GP',
                legendOffset: -40,
                legendPosition: 'middle'
            }}
            enableGridX={false}
            enableGridY={false}
            colors={{ scheme: 'category10' }}
            enablePoints={false}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            crosshairType="cross"
            useMesh={true}
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 100,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
            animate={false}
        />
    
    </div> 

    <h3 style={{marginTop:"50px"}}>{this.state.time.getHours()} : { this.state.time.getMinutes() < 10 ? "0" + this.state.time.getMinutes().toString() :  this.state.time.getMinutes()} : {this.state.time.getSeconds() < 10 ? "0" + this.state.time.getSeconds().toString() : this.state.time.getSeconds()}</h3>
    <div style={{display:"flex", flexDirection:"row",width:"100%"}}>
    <Box sx={{width: '50%' }}>

        <EnhancedTableToolbar numSelected={ this.state.selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={ this.state.dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={ this.state.selected.length}
              order={ this.state.order}
              orderBy={ this.state.orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={this.state.rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 this.state.rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(this.state.rows, getComparator( this.state.order,  this.state.orderBy))
                .slice( this.state.page *  this.state.rowsPerPage,  this.state.page *  this.state.rowsPerPage + this.state.rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.index);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.index)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.index}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {strikeMap[row.strikeID]}
                      </TableCell>
                      <TableCell>{row.optionType}</TableCell>
                      <TableCell>{row.side}</TableCell>
                      <TableCell>{row.price}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.cp}</TableCell>
                      <TableCell>{(Math.round(this.getCurrentValue(row.side,row.optionType,strikeMap[row.strikeID],row.quantity, this.state.time ,row.price)*100) / 100).toString() + " GP"}</TableCell>
                  
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: ( this.state.dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[100]}
          component="div"
          count={this.state.rows.length}
          rowsPerPage={ this.state.rowsPerPage}
          page={ this.state.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Box> 
    <div style={{display:"flex", flexDirection:"column",width:"50%", justifyContent:"center", alignItems:"center"}}>
     <h2>Sum Current Value</h2>               
    {groupedPrices}

    </div>
     
    </div>
    </div>

  );
   
  }
}

export default withSnackbar(Portfolio);
