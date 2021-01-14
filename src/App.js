import React, { useState, useEffect } from 'react';
// Table Style
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
//Google Maps
import { GoogleMap, LoadScript, TrafficLayer, Marker } from '@react-google-maps/api';
// Calendar
import moment from 'moment';
import 'moment-timezone';
// Camera
import CameraData from './data/dataCameraHCMFinal.json'


const containerStyle = {
  width: '100%',
  height: '600px'
};

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);


const statusStyle = {
  color: 'blue',
  fontWeight: 'bold',
};

export default function FetchAPI() {
  const [trafficRecord, setTrafficRecord] = useState([])
  const [totalTraffic, setTotalTraffic] = useState(0)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const classes = useStyles();

  const center = {
    lat: 10.8231,
    lng: 106.6297
  };

  useEffect(() => {
    (async () => {
      await fetch('http://dev.virtualearth.net/REST/v1/Traffic/Incidents/10.724,106.582,10.893,106.837/true?&severity=1,2,3,4&type=1,2,9&key=ArDtLTEg8-mhmlVc-FmvC1UH71IP9l6CSsZVvDQtVJ_yFP43f0uvz5mdwKwhACHE')
        .then((response) => response.json())
        .then((json) => {
          setTotalTraffic(json.resourceSets[0].estimatedTotal)
          setTrafficRecord(json.resourceSets[0].resources)
        })
        .catch((error) => console.error(error))
        .finally(() => {});
        })()
  }, [])

    const getTrafficStartRoad= ((str) => {
      var fromPoint = str.lastIndexOf("from");
      var toPoint = str.indexOf("to");
      var fromRoad = str.substring(fromPoint + "from".length, toPoint).trim();
      return fromRoad;
    })

    const getTrafficEndRoad = ((str) => {
      var toPoint = str.indexOf("to");
      var toRoad = str.substr(toPoint + "to".length).trim()
      return toRoad;
    })
    
    const convertUnixtimeToDatetime = ((str) => {
      var fromPoint = str.lastIndexOf("(");
      var toPoint = str.indexOf(")");
      var unixTime = str.substring(fromPoint + 1, toPoint).trim();
      var date = new Date(parseInt(unixTime));
      var dateTimeTemp = new moment(date);
      var dateTime = dateTimeTemp.format('hh:mm:ss A DD-MM-YYYY')
      return dateTime;
    })

    const convertSeverityToTrafficStatus = ((str) => {
      var statusTraffic = parseInt(str);
      switch(statusTraffic){
              case 1: 
                  statusTraffic = 'Lưu Thông Được';
                  break;
               case 2: 
                  statusTraffic = 'Mức Độ Thấp';
                  break;
              case 3: 
                  statusTraffic = 'Mức Độ Cao';
                  break;
              case 4: 
                  statusTraffic = 'Nghiêm Trọng';
                  break;
              default:
                  break;
      }
      return statusTraffic;
    })

    const loadMapWithTrafficJam = (() => {
      return (
        <GoogleMap mapContainerStyle={containerStyle}
                   center={center}
                   zoom={11.5}
                   mapTypeId={0}>
          
            {trafficRecord.map((row) => (
              <Marker key = {row.incidentId} 
                    position = {{ 
                          lat: row.point.coordinates[0], 
                          lng: row.point.coordinates[1]
                        }}
                    icon = {{
                      url: '/trafficjam.png',
                      scaledSize: new window.google.maps.Size(50,75)
               }}>
             </Marker>
            ))},

            {CameraData.map((camera) => (
              <Marker key = {camera.STT}
                      position = {{
                          lat: camera.Lat,
                          lng: camera.Lng
                      }}
                      onClick = {() => {
                        setSelectedCamera(camera);
                      }}
                      icon = {{
                        url: "/camera.png"
                }}>
              </Marker>
            ))}
          <>
            <TrafficLayer></TrafficLayer>
          </>
       </GoogleMap>
      )
    })

    return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyCagyAOmz3Hh4lxfWwnnUCxwkxNuhVB6cE">
        {loadMapWithTrafficJam()}
      </LoadScript>

      <p style={statusStyle} align="center">
        Tổng lượng kẹt xe: {totalTraffic}
      </p>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">STT</StyledTableCell>
              <StyledTableCell align="center">Đoạn Bắt Đầu</StyledTableCell>
              <StyledTableCell align="center">Đoạn Kết Thúc</StyledTableCell>
              <StyledTableCell align="center">Thời Điểm Kẹt</StyledTableCell>
              <StyledTableCell align="center">Trạng Thái</StyledTableCell>
              <StyledTableCell align="center">Chức năng</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trafficRecord.map((row,index) => (
              <StyledTableRow key={row.incidentId}>
                <StyledTableCell component="th" scope="row">{index+1}</StyledTableCell>
                <StyledTableCell align="left">{getTrafficStartRoad(row.description)}</StyledTableCell>
                <StyledTableCell align="left">{getTrafficEndRoad(row.description)}</StyledTableCell>
                <StyledTableCell align="left">{convertUnixtimeToDatetime(row.start)}</StyledTableCell>
                <StyledTableCell align="left">{convertSeverityToTrafficStatus(row.severity)}</StyledTableCell>
                <StyledTableCell>
                <Button variant="contained" align="left" color="secondary">Xử lí</Button>
                </StyledTableCell>  
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
     </TableContainer>
    </div> 
    );
}