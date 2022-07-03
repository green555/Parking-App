'use strict';

// We use a function declaration for initMap because we actually *do* need
// to rely on value-hoisting in this circumstance.

let currInfoWindow = null;
let markerArray = [];
let meterDict = {};
let currMeter_id;


function initMap() {
  
  // initial plan map
  const sfBayCoords = {
    lat: 37.774929,
    lng: -122.442418,
  };

  window.addEventListener('load', function() {
    // your code here
    console.log('before create map!');
    console.log(document.querySelector('#map'));
    const basicMap = new google.maps.Map(document.querySelector('#map'), {

      center: sfBayCoords,
      zoom: 13.2,
    });
    
  
    hideForm('login-form');
    hideForm('signup-form');
    document.querySelector("fieldset").setAttribute("disabled", true);

  
    document.querySelector("#submit-address").addEventListener('click',
    evt => {
     evt.preventDefault();
     const street = document.querySelector("#street").value;
     const city = document.querySelector("#city").value;
     const radius = document.querySelector("#radius").value;
     let addressInput = {
       street: street,
       city: city,
       radius: radius
       } 
     
     document.querySelector('#meter_list').innerHTML="";
     document.querySelector('#status').innerHTML = '<i>Loading</i>';
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
       document.querySelector('#status').innerHTML = '';    
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

         
         document.querySelector('#meter_list').innerHTML = "";
         document.querySelector('#status').innerHTML = '<i>Loading...</i>';
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
           document.querySelector('#status').innerHTML = ''; 
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
           document.querySelector("fieldset").removeAttribute("disabled");
           document.querySelector('#logoff').removeAttribute("hidden");
           document.querySelector('#user').removeAttribute("hidden");
           document.querySelector('#user').innerHTML=email;
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
           document.querySelector("fieldset").removeAttribute("disabled");
           document.querySelector('#logoff').removeAttribute("hidden");
           document.querySelector('#user').removeAttribute("hidden");
           document.querySelector('#user').innerHTML=email;
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
     document.querySelector("fieldset").setAttribute("disabled", true);
     document.querySelector('#user').setAttribute("hidden", true);
     fetch('/clear-session')
     .then(response => {});
 
   });
 
  //  document.querySelector('#web-comment-submit').addEventListener('click',
  //  evt => {
  //    evt.preventDefault();
  //    const comment = document.querySelector('#web-comment').value;
  //    console.log(comment);
  //    const commentInput = { web_comment: comment }
  //    fetch('/create-web-comment', {
  //      method: 'POST',
  //      body: JSON.stringify(commentInput),
  //      headers: {
  //        'Content-Type': 'application/json',
  //      },
  //    })
  //    .then((response) => alert('web-comment successfully added!')); // end of .then
   
  //    });
 
 
   
   document.querySelector('#comment-submit').addEventListener('click',
     evt => {
       evt.preventDefault();
       const comment = document.querySelector('#comment').value;
       const score = document.querySelector('#score').value;
       const meterID = document.querySelector('#comment-list').value;
       console.log(comment);
       const commentInput = { comment: comment, score: score, meterID: meterID }
       fetch('/create-new-comment', {
         method: 'POST',
         body: JSON.stringify(commentInput),
         headers: {
           'Content-Type': 'application/json',
         },
       })
       .then((response) => response.json())
       .then(data => {
        if(document.querySelector("#current-detail-meter").innerHTML == meterID) {
            document.querySelector("#comment-show").innerHTML = data.comment_list;
            document.querySelector("#rate-show").innerHTML = data.rate;
        }
        

       }) // end of .then

       document.querySelector("#comment").value = "";
       document.querySelector('#score').value = "";
       document.querySelector('#comment-list').value = "";
     
       });
   // helper function to remove map markers from previous search
 
   function removePreviousMarkers() {
     if (markerArray) {
       for (const marker of markerArray) {
         marker.setMap(null);
         markerArray = [];
       }
       let optionEntries = document.querySelectorAll('.temp-entry');
       for(const option of optionEntries) {
         option.remove();
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
 
     let bounds = new google.maps.LatLngBounds();
     bounds.extend({lat: result.curr_coords.lat, lng: result.curr_coords.lng});    
     
 
     for (const coord of result["data"]) {
       const meterCoords = {lat: coord.lat, lng: coord.lng};
       meterDict[coord.id] = coord;
       const markerInfo = `
         <h1>${coord.street_address}</h1>
         <p>
           Vehicle type:<br>
           <code>${coord.veh_type}</code>
         </p>
         <p>
           Capacity:<br>
           <code>${coord.capacity}</code>
         </p>   
         </p>
         <p>
           <button id=${coord.id} >Details</button>
         </p>
       `;
 
 
       const infoWindow = new google.maps.InfoWindow({
             content: markerInfo,
             maxWidth: 200,
           });
 
       
       google.maps.event.addListener(infoWindow, "domready", function() {
         
         document.getElementById(`${coord.id}`).addEventListener('click', 
           evt => {
             evt.preventDefault();

             fetch(`/get-meter-details/${coord.id}`)
             .then(response => response.json())
             .then(data => {

              // console.log(data);

              document.querySelector('#Details').innerHTML = `
              <div>
                <h1>${data.street_address}</h1>
                <p id="current-detail-meter" hidden>${data.id}</p>
                <p>
                  Located at: <code>${data.lat}</code>,
                  <code>${data.lng}</code>
                </p>
                <p>
                  Vehicle type: <code>${data.veh_type}</code><br><br>
                  Capacity: <code>${data.capacity}</code>
                </p>
                <p id='comment_list'>
                Comment: <code id="comment-show">${data.comment}</code>
                </p>
                <p id='ave-rate'>
                Rating: <code id='rate-show'>${data.rate}</code>
                </p>
              </div>`;


             });         
       });
      });
       
       const marker = new google.maps.Marker({position: meterCoords, title: null, map: basicMap});
       markerArray.push(marker);
       bounds.extend(marker.position);
       
       
       marker.addListener('click', () => {
             if (currInfoWindow){
               currInfoWindow.close();
             }
             currMeter_id = coord.id;
             infoWindow.open(basicMap, marker);
             currInfoWindow = infoWindow;
           });
       
       document.querySelector('#meter_list').insertAdjacentHTML('afterend', `<li class='temp-entry'>${coord.street_address}</li>`);
       document.querySelector('#option').insertAdjacentHTML('afterend', `<option value=${coord.id} class='temp-entry'>${coord.street_address}</option>`);
 
     }
     
     basicMap.fitBounds(bounds);
   }
 
  
   
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

   
  
  
  
  
  
  
  
  
  
  
  }) //everything in the eventlistener Load
  
  

  

  
  // extract current address from browser by event handler
  // send current address to server by POST request, which in turn returns a list of nearby meters 
  

} // end of initMap function
