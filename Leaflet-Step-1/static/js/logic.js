// Store API
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a get request to the URL
d3.json(link, function(data) {
    // After response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "<p> Magnitude: " + feature.properties.mag + "</p>")
      ;
  }
   function getColor(depth){
    switch (true) {
      case depth > 10:
        return "#ADFF2F";
      case depth > 30:
        return "#9ACD32";
      case depth > 50:
        return "#FFFF00";
      case depth > 70:
        return "#ffd700";
      case depth > 90:
        return "#FFA500";
      default:
        return "#FF0000";
      }
   }

   function markerRadius(Magnitude){
     return Magnitude * 5
   }

    var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    pointToLayer: function(feature, longLat){
      return L.circleMarker(longLat)

    },
    style: function(feature){
      return {
        color: "gray",
        weight: .5,
        fillOpacity: .2,
        fillColor: getColor (feature.geometry.coordinates[2]),
        radius: markerRadius (feature.properties.mag)
      }
    }


  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define lightmap and satelitemap layers
  var satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Satelite Map": satelitemap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the satelitemap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [31.57853542647338,-99.580078125],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ["-10-9","10-29","30-49","50-69","70-90","90+"];
    var colors = ["greenyellow", "yellowgreen", "yellow", "gold","orange","red"];
    var labels = [];

    // Add min & max
    var legendInfo = "<h2>Earthquake<br/>Depth</h2>" +
      "<div class=\"labels\">" +
        // "<div class=\"min\">" + limits[0] + "</div>" +
        // "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style= 'background-color: " + colors[index] + "'>"+limits[index] + "</li>");
    });

    div.innerHTML += "<ul style = 'list-style-type: none'>" + labels.join("") + "</ul>";
    return div;
  };
legend.addTo(myMap);

}