// declare variables
const boundaryLayer = "data/uclamap.geojson"
let boundary; // place holder for the data
let collected; // variable for turf.js collected points 
let allPoints = []; // array for all the data points

let mapOptions = {'center': [34.0709,-118.444],'zoom': 50}

// declare the map
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);5

let Jawg_Light = L.tileLayer('https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	subdomains: 'abcd',
	accessToken: 'FkWnkf1e22dnL71CnkeDRnZeEZRyPNd6DqNr2frT4o5zPMcnKvgfcgG2gQCNjnR7'
});

Jawg_Light.addTo(map)

let pos = L.featureGroup();
let neg = L.featureGroup();

// define layers
let layers = {
    "Positive Experience": pos,
    "Negative Experience": neg
}
// add layer control box
L.control.layers(null,layers).addTo(map)



function addMarker(data){

    let year = data['What year are you?'];
    let academicPressures = data['What type of academic pressure, if any, do you face?'];
    let experience = data['Would you like to share about a positive or negative academic experience?'];
    let positive = data['Describe a positive academic experience you had this school year.'];
    let negative = data['Describe a time during this school year where you went through an academic struggle.'];
    
    //if user didn't fillout anything for academic pressures
    if (!academicPressures){
    academicPressures = "";
    }

    let surveyResponse ={
      "year" :  data['What year are you?'],
      "academicPressures": academicPressures,
      "experience" :  data['Would you like to share about a positive or negative academic experience?'],
      "positive" :  data['Describe a positive academic experience you had this school year.'],
      "negative" :  data['Describe a time during this school year where you went through an academic struggle.']  
    }

    // create the turfJS point
    let thisPoint = turf.point([Number(data.lng),Number(data.lat)],{surveyResponse})
    console.log(thisPoint)
    // put all the turfJS points into `allPoints`
    allPoints.push(thisPoint)
    
    if(experience == "Positive"){

        
        let posExperience = data['Describe a positive academic experience you had this school year.'];
        let posLocation = data['Where on campus would you like to share this positive experience about?'];

        let marker = L.circleMarker([data.lat,data.lng],
            {"radius": 8,
            "color": "#228B22",
            "weight": 3,
            "opacity": 500})

        pos.addLayer(marker).addTo(map)
    }
    else{

        let negExperience = data['Describe a time during this school year where you went through an academic struggle.'];
        
        let negLocation = data['Where on campus would you like to share this negative experience about?'];

        let marker = L.circleMarker([data.lat,data.lng],
            {"radius": 8,
            "color": "#FF6961",
            "weight": 3,
            "opacity": 300})

        marker.addEventListener("click", function(){
            document.getElementById("year").innerHTML = year;
            document.getElementById("pressure_question").innerHTML = "<b>What type of academic pressure, if any, do you face?</b>";
            document.getElementById("pressure").innerHTML = academicPressures;
            document.getElementById("story").innerHTML = "<b>Story</b>";
            document.getElementById("experience").innerHTML = negExperience; //add positive experience to sidebar 
        })

        neg.addLayer(marker).addTo(map)
    }


    

    return
}

// function createButtons(lat,lng,title){
//     const newButton = document.createElement("button"); // adds a new button
//     newButton.id = "button"+title; // gives the button a unique id
//     newButton.innerHTML = `<span style="font-family:'Trebuchet MS';">${title}</span>`;
//     newButton.setAttribute("lat",lat); // sets the latitude 
//     newButton.setAttribute("lng",lng); // sets the longitude 
//     newButton.addEventListener('click', function(){
//         map.flyTo([lat,lng]);
//     })
//     const spaceForButtons = document.getElementById('placeForButtons')
//     spaceForButtons.appendChild(newButton);//this adds the button to our page.
// }



const dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKwV5fLY967Dz_lXGKPKdNoLbmIZtgDesIOp0BCKj2iS5ep1S63D7MDfKFaLlKmh4H-DG7VO6SR8Em/pub?output=csv"

function loadData(url){
    Papa.parse(url, {
        header: true,
        download: true,
        complete: results => processData(results)
    })
}

function processData(results){
    console.log(results)
    results.data.forEach(data => {
        console.log(data)
        addMarker(data)
    })
    pos.addTo(map) // add our layers after markers have been made
    neg.addTo(map) // add our layers after markers have been made  
    let allLayers = L.featureGroup([pos,neg]);
    map.fitBounds(allLayers.getBounds());

    // step 1: turn allPoints into a turf.js featureCollection
    thePoints = turf.featureCollection(allPoints)

    // step 2: run the spatial analysis
    getBoundary(boundaryLayer)
    // createHeader()
}

let currentLayer;

//hovering over polygons
  //post hover
function resetHighlight(e) {
  currentLayer.resetStyle(e.target);
}

  //hover 
function highlightFeature(e) { 
  var layer = e.target;
  layer.openPopup()

  layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: '',
      fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  }
}



//clicking on polygons -> shows number
function onEachFeature(feature, layer) {
  console.log(feature.properties)
  if (feature.properties.values) {
      let count = feature.properties.values.length
      console.log(count) // see what the count is on click
      let text = count.toString() // convert it to a string
      layer.bindPopup(text); //bind the pop up to the number
  }

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: populateSidebar
  });
}


function populateSidebar(e){
  let layer = e.target;

  //this is the region for the layer we are clicking
  let targetRegion = layer.feature.properties.region
  let numOfStories = layer.feature.properties.values.length
  document.getElementById("stories").innerHTML = '<h2 style="text-align: center;">' + targetRegion + '</h2>';
  document.getElementById("stories").innerHTML += '<h3 style="text-align: center;">(' + numOfStories + ' responses)</h3>';
  
  let stories = layer.feature.properties.values
  stories.forEach(story => addToStoryContent(story))  

  //add styling to story divs
  for (const s of document.getElementsByClassName("posStory")) {
    s.style.backgroundColor = '#AACFA0';
    s.style.padding = "10px";
    s.style.margin = "10px";
    s.style.borderRadius = "10px";
    
  }

  for (const s of document.getElementsByClassName("negStory")) {
    s.style.backgroundColor = '#F0939B';
    s.style.padding = "10px";
    s.style.margin = "10px";
    s.style.borderRadius = "10px";
  }
}

function addToStoryContent(data){

  if(data.experience == 'Positive'){ //if experience was positive

    document.getElementById("stories").innerHTML += `<div class="posStory">
    <h3>${data.year}</h3>
    <b>What type of academic pressure, if any, do you face?</b>
    <p>${data.academicPressures}<p>
    <b>Story</b>
    <p>${data.positive}</p></div>`; 

  }
  else{ //if experience was negative
    document.getElementById("stories").innerHTML += `<div class="negStory">
    <h3>${data.year}</h3>
    <b>What type of academic pressure, if any, do you face?</b>
    <p>${data.academicPressures}<p>
    <b>Story</b>
    <p>${data.negative}</p></div>`; 
  }    
}

// new function to get the boundary layer and add data to it with turf.js
function getBoundary(layer){
  fetch(layer)
  .then(response => {
      return response.json();
      })
  .then(data =>{
              //set the boundary to data
              boundary = data

              collected = turf.collect(boundary, thePoints, 'surveyResponse', 'values');
              console.log(collected.features)

              // here is the geoJson of the `collected` result:
              currentLayer = L.geoJson(collected,{onEachFeature: onEachFeature,style:function(feature)
              {
                  console.log(feature)

                  if (feature.properties.region == "South Campus") { 
                      return {color: "#F2A33A",stroke: false};
                  }
                  if (feature.properties.region == "North Campus") { 
                    return {color: "#2E6C6C",stroke: false};
                  }
                  if (feature.properties.region == "The Hill") { 
                    return {color: "#921C6A",stroke: false};
                  }
                  else{
                      // make the polygon gray and blend in with basemap if it doesn't have any values
                      return{opacity:0,color:"#efefef" }
                  }
              }
              // add the geojson to the map
                  }).addTo(map)
      }
  )   
}



//About popup

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}



//Survey popup
// Get the modal
var formModal = document.getElementById("formModal");

// Get the button that opens the modal
var formBtn = document.getElementById("formBtn");

// Get the <span> element that closes the modal
var formSpan = document.getElementsByClassName("close")[1];

// When the user clicks on the button, open the modal
formBtn.onclick = function() {
  formModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
formSpan.onclick = function() {
  formModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == formModal) {
    formModal.style.display = "none";
  }
}


loadData(dataUrl)