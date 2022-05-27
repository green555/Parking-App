'use strict';

// We use a function declaration for initMap because we actually *do* need
// to rely on value-hoisting in this circumstance.
function initMap(props) {
  
  // initial plan map
  const sfBayCoords = {
    lat: 37.774929,
    lng: -122.442418,
  };

  const basicMap = new google.maps.Map(document.querySelector('#root-map'), {
    center: sfBayCoords,
    zoom: 13.2,
  });  

  const sfInfo = new google.maps.InfoWindow({
    content: '<h1>San Francisco Bay!</h1>',
  });
  
  const [currCoords, setCurrCoords] = React.useState({});
  const [nearbyMeters, setNearbyMeters] = React.useState([]);
  const [hideStatus, setHideStatus] = React.useState('')
  

  // extract current address from browser by event handler
  // send current address to server by POST request, which in turn returns a list of nearby meters 
  document.querySelector("#submit-address").addEventListener('click',
   evt => {
    evt.preventDefault();
    const street = document.querySelector("#street").value;
    const city = document.querySelector("#city").value;
    const radius = document.querySelector("#radius").value;
    const addressInput = {
      street: street,
      city: city,
      radius: radius
      } 
    fetch('/get-nearby-meters', {
      method: 'POST',
      body: JSON.stringify(addressInput),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((result) => {      
      let allCoords = result;
      setCurrCoords(allCoords);
      setNearbyMeters(allCoords);     
    });// end of .then
  
    } // end of event response function
  ); // end of addEventListener
  

  document.querySelector("#allow_curr_location").addEventListener('click', 
   evt => {
    evt.preventDefault();
    navigator.geolocation.getCurrentPosition(success);
   });
  
   function success(position) {
          let curr_lat = position.coords.latitude;
          let curr_lng = position.coords.longitude;
          
          const formInputs = {
            lat: curr_lat,
            lng: curr_lng
          };
          
          console.log(formInputs);
      
          fetch('/get-nearby-meters', {
            method: 'POST',
            body: JSON.stringify(formInputs),
            headers: {
              'Content-Type': 'application/json',
            },
          })
          .then((response) => response.json())
          .then((result) => {
            let allCoords = result;
            setCurrCoords(allCoords);
            setNearbyMeters(allCoords);
            alert('successfully get your current location'); 
          });
      }  


  // helper function to create map marker on the current address
  function setCurrCoords(result) {
    const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
      currCoords = {lat: result.curr_coords.lat, lng: result.curr_coords.lng};
      new google.maps.Marker({position: currCoords, title: "you are here", map: basicMap, icon: image});

  }

  // helper function to create map markers for the nearby meters
  function setNearbyMeters(allCoords) {
    nearbyMeters = result.data
    for (const coord of nearbyMeters) {
      const meterCoords = {lat: coord.lat, lng: coord.lng};
      const markerInfo = `
        <h1>${coord.street_address}</h1>
        <p>
          Located at: <code>${coord.lat}</code>,
          <code>${coord.lng}</code>
        </p>
      `;

      const infoWindow = new google.maps.InfoWindow({
            content: markerInfo,
            maxWidth: 200,
          });
      const marker = new google.maps.Marker({position: meterCoords, title: null, map: basicMap});

      marker.addListener('click', () => {
            infoWindow.open(basicMap, marker);
          });
      
      document.querySelector('#meter_list').insertAdjacentHTML('beforeend', `<li>
                                                                                  <div>${coord.street_address}</div>
                                                                                  <input type="text" name="comment" ${props.hidden}>    
      
                                                                              </li>`);

    }
  }

  function setHideStatus() {
    if (sessionStorage.getItem("user_id")) {hideStatus = 'hidden'}
  }
  
  
} // end of initMap function

ReactDOM.render(<initMap hidden={hideStatus} />, document.querySelector('#root-map'));



// function Login(props) {
//   const [loginStatus, setLoginStatus] = React.useState(false);
//   return (
//     <form>    
//       <input type="submit" value="logoff" name="logoff" {props.hidden} />
//       <input type="submit" value="login" name="login" {props.hidden} />   
//       <input type="submit" value="signup" name="signup" {props.hidden} />
//     </form>
//   );
// } 
//   const allow_track_location = document.querySelector("#allow_curr_location");
  
//   if(allow_track_location){allow_track_location.addEventListener('click', get_location);
//   function get_location() {
//       console.log("inside get_location");
//       navigator.geolocation.getCurrentPosition(success);
//     }
//   function success(position) {
//       let curr_lat = position.coords.latitude;
//       let curr_lng = position.coords.longitude;
      
//       const formInputs = {
//         lat: curr_lat,
//         lng: curr_lng
//       };
      
//       console.log(formInputs);
  
//       fetch('/track_curr_location', {
//         method: 'POST',
//         body: JSON.stringify(formInputs),
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//       .then((response) => {alert('successfully get your current location')})
//   }  
  
// }

// }



// const loginButton = document.querySelector("#log-in");
// console.log(loginButton);
// function showLoginForm() {
  
//   console.log("inside showLoginForm function");
//   document.querySelector("#form").innerHTML=`
//   <div>  
//     <h2>Log In</h2>
//     <form action="/login" method="POST">
//       <p>Email <input type="text" name="email"></p>

//       <p>Password <input type="password" name="password"></p>

//       <p><input type="submit"></p>
//     </form>
  
//   </div>
//   `;
// }
// if(loginButton){loginButton.addEventListener('click', showLoginForm);}


// const addressSub = document.querySelector("#submit-address")
// const addParkingMarker = () => {
//   fetch('/adress')
//     .then((response) => response.json())
//     .then((result) => {
//         const parkings = result.data;
//         const currLocation = result.curr_coords;
//         new google.maps.Marker({position: currLocation, title: 'you are here', map: basicMap});
//         for (const parking of parkings) {
//           const meterCoords = {lat: parking.lat, lng: parking.lng};
//           new google.maps.Marker({position: meterCoords, title: null, map: basicMap});
          
//         }
            
//     });
// 