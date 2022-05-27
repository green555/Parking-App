'use strict';

// We chose to attach all our event listeners in this function since this is
// where the `map` object is in-scope.
//
// There are other ways to do this. Another way to make sure `map` is in-scope
// is to define functions outside of `initMap` that take in a Google Map
// object as an argument.
function initMap() {
  const map = new google.maps.Map(document.querySelector('#map'), {
    center: {
      lat: 37.601773,
      lng: -122.20287,
    },
    zoom: 11,
  });

  // Apply custom styles to a map. In this example, we just make the
  // water pink.
  document.querySelector('#custom-style').addEventListener('click', () => {
    const customStyledMap = new google.maps.StyledMapType([
      {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ffd1e4' }],
      },
    ]);

    map.mapTypes.set('map_style', customStyledMap);
    map.setMapTypeId('map_style');
  });

  // Ask user to enter a location. Geocode the location to get its coordinates
  // and drop a marker onto the map.
  document.querySelector('#geocode-address').addEventListener('click', () => {
    const userAddress = prompt('Enter a location');

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: userAddress }, (results, status) => {
      if (status === 'OK') {
        // Get the coordinates of the user's location
        const userLocation = results[0].geometry.location;

        // Create a marker
        new google.maps.Marker({
          position: userLocation,
          map,
        });

        // Zoom in on the geolocated location
        map.setCenter(userLocation);
        map.setZoom(18);
      } else {
        alert(`Geocode was unsuccessful for the following reason: ${status}`);
      }
    });
  });

  // Draw a line on the map from Hackbright to Powell Street Station to
  // Montgomery Station
  document.querySelector('#draw-polyline').addEventListener('click', () => {
    const polyline = new google.maps.Polyline({
      path: [
        {
          lat: 37.7887459, // Hackbright
          lng: -122.4115852,
        },
        {
          lat: 37.7844605, // Powell Street Station
          lng: -122.4079702,
        },
        {
          lat: 37.7894094, // Montgomery Station
          lng: -122.4013037,
        },
      ],
      geodesic: true,
      strokeColor: '#ff0000',
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });

    polyline.setMap(map);
  });

  // Display walking directions from Hackbright to Powell Street Station
  // on the map
  document.querySelector('#display-directions').addEventListener('click', () => {
    const directionsService = new google.maps.DirectionsService();

    // The DirectionsRenderer object is in charge of drawing directions
    // on maps
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const hbToPowellRoute = {
      origin: {
        lat: 37.7887459,
        lng: -122.4115852,
      },
      destination: {
        lat: 37.7844605,
        lng: -122.4079702,
      },
      travelMode: 'WALKING',
    };

    directionsService.route(hbToPowellRoute, (response, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);
      } else {
        alert(`Directions request unsuccessful due to: ${status}`);
      }
    });
  });
}
