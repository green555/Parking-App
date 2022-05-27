'use strict';

// We use a function declaration for initMap because we actually *do* need
// to rely on value-hoisting in this circumstance.
let markerArray = [];


function initMap() {
  
  // initial plan map
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

  hideForm('login-form');
  hideForm('signup-form');
  hideForm('comment-form');

  
  // const loginFormElements = document.querySelector('#login-form').children;
  // for (const element of loginFormElements) {
  //   element.setAttribute("hidden", true);
  // }

  // const signupFormElements = document.querySelector('#signup-form').children;
  // for (const element of signupFormElements) {
  //   element.setAttribute("hidden", true);
  
  // }


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
      removePreviousMarkers();
      markCurrentAddress(result);
      markNearbyMeters(result);     
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
            removePreviousMarkers();
            markCurrentAddress(result);
            markNearbyMeters(result);
            alert('successfully get your current location'); 
          });
      }  
  
  document.querySelector("#login").addEventListener('click', 
  evt => {
    evt.preventDefault();
    showForm('login-form');
    hideForm('login-entry');
  });
  
  document.querySelector("#signup").addEventListener('click', 
  evt => {
    evt.preventDefault();
    showForm('signup-form');
    hideForm('login-entry');
  });

  document.querySelector('#login-cancel').addEventListener('click',
  evt => {
    evt.preventDefault();
    hideForm('login-form');
    showForm('login-entry');
  });

  document.querySelector('#signup-cancel').addEventListener('click',
  evt => {
    evt.preventDefault();
    hideForm('signup-form');
    showForm('login-entry');
  });

  document.querySelector('#login-submit').addEventListener('click',
  evt => {
    evt.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const loginInput = {
      email: email,
      password: password,
      }

      fetch('/get-login-info', {
        method: 'POST',
        body: JSON.stringify(loginInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then((result) => {
        if(result.data) {
          alert(`success login as ${email}`);
          hideForm('login-form');
          showForm('comment-form');
          document.querySelector('#logoff').removeAttribute("hidden");
          document.querySelector('#user').removeAttribute("hidden");
        }
        else {alert('email or password is incorrect, please try again.');} 
      });// end of .then

  });

  document.querySelector('#signup-submit').addEventListener('click',
  evt => {
    evt.preventDefault();
    const email = document.querySelector("#signup-email").value;
    const password = document.querySelector("#signup-password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;
    const signupInput = {
      email: email,
      password: password,
      confirmPassowrd: confirmPassword
      }
      console.log(signupInput)
      if(!email || !password || !confirmPassword) {alert('email and password are required!')}
      else if(password != confirmPassword) {alert('passwords not identical!');}
      else {    

      fetch('/create-new-user', {
        method: 'POST',
        body: JSON.stringify(signupInput),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then((result) => {
        if(result.data) {
          alert(`Account created and success login as ${email}`);
          hideForm('signup-form');
          showForm('comment-form');
          document.querySelector('#logoff').removeAttribute("hidden");
        }
        else {
          alert('Account already exits. Please sign in');
          hideForm('signup-form');
          showForm('login-form');   
      
        } 
      });// end of .then
    }
  });
  
  document.querySelector('#logoff').addEventListener('click',
  evt => {
    evt.preventDefault();
    document.querySelector('#logoff').setAttribute("hidden", true);
    showForm('login-entry');
    hideForm('comment-form');

  });

  // helper function to remove map markers from previous search

  function removePreviousMarkers() {
    if (markerArray) {
      for (const marker of markerArray) {
        marker.setMap(null);        
        markerArray = [];
      }
    }
  }

  // helper function to create map marker on the current address
  function markCurrentAddress(result) {   
    
    const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
      let currCoords = {lat: result.curr_coords.lat, lng: result.curr_coords.lng};
      const selfMarker = new google.maps.Marker({position: currCoords, title: "you are here", map: basicMap, icon: image});
      markerArray.push(selfMarker);

  }

  // helper function to create map markers for the nearby meters
  function markNearbyMeters(result) {
    for (const coord of result["data"]) {
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
      markerArray.push(marker);
      

      marker.addListener('click', () => {
            infoWindow.open(basicMap, marker);
          });
      
      document.querySelector('#meter_list').insertAdjacentHTML('beforeend', `<li>${coord.street_address}</li>`);
      document.querySelector('#option').insertAdjacentHTML('afterend', `<option value=${coord.id}>${coord.street_address}</option>`);

    }

  }

  // function addComment(markerArray) {
  //   for(let i=1; i<markerArray.length; i++) {
  //     document.querySelector('#option').insertAdjacentHTML('afterend', `<option value=${coord.id}>${coord.street_address}</option>`);
  //   }
  // }
  
  function hideForm(id) {
    const formElements = document.querySelector(`#${id}`).children;
    for (const element of formElements) {
    element.setAttribute("hidden", true);
    }
  }

  function showForm(id) {
    const formElements = document.querySelector(`#${id}`).children;
    for (const element of formElements) {
    element.removeAttribute("hidden");
    }
  }

} // end of initMap function




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