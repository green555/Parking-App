'use strict';


function updateCoords() {

  let coords_dict_string = coords.replaceAll("&#39;", '"');
  coords_dict_string = coords_dict_string.replaceAll("&#34;", '"');
  coords_dict_string = coords_dict_string.replaceAll('O"', '');

  let coords_dict = JSON.parse(coords_dict_string);
  console.log("***********updated coords", coords_dict)
  return coords_dict;
  
}

updateCoords();

// We use a function declaration for initMap because we actually *do* need
// to rely on value-hoisting in this circumstance.
function initMap() {
  const sfBayCoords = {
    lat: 37.774929,
    lng: -122.442418,
  };

  const basicMap = new google.maps.Map(document.querySelector('#map'), {
    center: sfBayCoords,
    zoom: 13.2,
  });  

  const sfInfo = new google.maps.InfoWindow({
    content: '<h1>San Francisco Bay!</h1>',
  });

  const coords_dict = updateCoords();
  // mark on the current location  
  const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
  let currCoords = {lat: coords_dict.curr_coords.lat, lng: coords_dict.curr_coords.lng};
  new google.maps.Marker({position: currCoords, title: "you are here", map: basicMap, icon: image});
  

  
  // mark on the nearby meters
  
  for (const coord of coords_dict.data) {
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

    // document.querySelector('#meter_list').insertAdjacentHTML('beforeend', `<li>${coord.street_address}</li>`);
  }


  
  const allow_track_location = document.querySelector("#allow_curr_location");
  
  if(allow_track_location){allow_track_location.addEventListener('click', get_location);
  function get_location() {
      console.log("inside get_location");
      navigator.geolocation.getCurrentPosition(success);
    }
  function success(position) {
      let curr_lat = position.coords.latitude;
      let curr_lng = position.coords.longitude;
      
      const formInputs = {
        lat: curr_lat,
        lng: curr_lng
      };
      
      console.log(formInputs);
  
      fetch('/track_curr_location', {
        method: 'POST',
        body: JSON.stringify(formInputs),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {alert('successfully get your current location'); window.location.reload();})
  }  
  
}

}

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

const loginButton = document.querySelector("#log-in");
console.log(loginButton);
function showLoginForm() {
  
  console.log("inside showLoginForm function");
  document.querySelector("#form").innerHTML=`
  <div>  
    <h2>Log In</h2>
    <form action="/login" method="POST">
      <p>Email <input type="text" name="email"></p>

      <p>Password <input type="password" name="password"></p>

      <p><input type="submit"></p>
    </form>
  
  </div>
  `;
}
if(loginButton){loginButton.addEventListener('click', showLoginForm);}


