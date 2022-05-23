// declare variables
let mapOptions = {'center': [34.0709,-118.444],'zoom': 5}

// define the leaflet map
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);

let CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

CartoDB_Positron.addTo(map);

let publicTransportation = L.featureGroup();
let rideApp = L.featureGroup();
let car = L.featureGroup();
let other = L.featureGroup();

let circleOptions = {
    radius: 4,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
}

let layers = {
    "Public transportation": publicTransportation,
    "Ride app (Uber, Lyft, etc.)": rideApp,
    "Car": car,
    "Other": other
}

const dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZS8I9FTBCynV59aBZVLlnfTcqxxjbUXkEVg2NrJVy979--15DEAcJNOMFSL2nOTKOnabZL8Mz7PMQ/pub?output=csv"

// add layer control box
L.control.layers(null,layers).addTo(map)



function addMarker(data){
    
    if(data['How did you get to the concert?'] == "Public transportation"){
        publicTransportation.addLayer(L.circleMarker([data.lat,data.lng],
            {"radius": 12,
            "color": "blue",
            "opacity": 200}
            ).bindPopup(`<h2>${data["What is the name of the artist?"]}</h2> <p>Recommended song: ${data["Recommend one song that was played during the concert."]}</p>`))
        createButtons(data.lat,data.lng,data['What is the name of the artist?'])
    }
    else if(data['How did you get to the concert?'] == "Ride app (Uber, Lyft, etc.)"){
        circleOptions.fillColor = "yellow"
        rideApp.addLayer(L.circleMarker([data.lat,data.lng], 
            {"radius": 12,
            "color": "green",
            "opacity": 200}).bindPopup(`<h2>${data["What is the name of the artist?"]}</h2> <p>Recommended song: ${data["Recommend one song that was played during the concert."]}</p>`))
        createButtons(data.lat,data.lng,data['What is the name of the artist?'])
    }
    else if(data['How did you get to the concert?'] == "Car"){
        car.addLayer(L.circleMarker([data.lat,data.lng], 
            {"radius": 12,
            "color": "orange",
            "opacity": 200}
            ).bindPopup(`<h2>${data["What is the name of the artist?"]}</h2> <p>Recommended song: ${data["Recommend one song that was played during the concert."]}</p>`))
        createButtons(data.lat,data.lng,data['What is the name of the artist?'])
    }
    else{
        other.addLayer(L.circleMarker([data.lat,data.lng],
            {"radius": 12,
            "color": "purple",
            "opacity": 200}
            ).bindPopup(`<h2>${data["What is the name of the artist?"]}</h2> <p>Recommended song: ${data["Recommend one song that was played during the concert."]}</p>`))
        createButtons(data.lat,data.lng,data['What is the name of the artist?'])
    }
    return data
}

function createButtons(lat,lng,title){
    const newButton = document.createElement("button"); // adds a new button
    newButton.id = "button"+title; // gives the button a unique id
    newButton.innerHTML = title; // gives the button a title
    newButton.setAttribute("lat",lat); // sets the latitude 
    newButton.setAttribute("lng",lng); // sets the longitude 
    newButton.addEventListener('click', function(){
        map.flyTo([lat,lng]); //this is the flyTo from Leaflet
    })
    const spaceForButtons = document.getElementById('placeForButtons')
    spaceForButtons.appendChild(newButton);//this adds the button to our page.
}

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
    publicTransportation.addTo(map) // add our layers after markers have been made
    rideApp.addTo(map) // add our layers after markers have been made  
    car.addTo(map) // add our layers after markers have been made 
    other.addTo(map) // add our layers after markers have been made 
    let allLayers = L.featureGroup([publicTransportation, rideApp, car, other]); // array of both englishFirst and nonEnglishFirst
    map.fitBounds(allLayers.getBounds());
}

loadData(dataUrl)
