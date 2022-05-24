// declare variables
let mapOptions = {'center': [40,-100],'zoom':4}

// declare the map
const map = L.map('the_map').setView(mapOptions.center, mapOptions.zoom);5

let CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
CartoDB_Positron.addTo(map)

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
    // console.log(data)
    // these are the names of our lat/long fields in the google sheets:
    if(data['Experience'] == "Positive"){
        pos.addLayer(L.circleMarker([data.lat,data.lng],
            {"radius": 8,
            "color": "#FF0000",
            "weight":3,
            "opacity":500}).addTo(map).
        bindPopup(`<h3>${data['Experience']}</h3> <h3>${data['posExperience']}</h3>`))        
        createButtons(data.lat,data.lng,data['posLocation'])
    }
    else{
        neg.addLayer(L.circleMarker([data.lat,data.lng],
            {"radius": 8,
            "color": "#00008B",
            "weight":3,
            "opacity":300}).addTo(map).
        bindPopup(`<h2>${data['Experience']}</h3> <h3>${data['negExperience']}</h3>`))        
        createButtons(data.lat,data.lng,data['negLocation'])
    }
    return
}

function createButtons(lat,lng,title){
    const newButton = document.createElement("button"); // adds a new button
    newButton.id = "button"+title; // gives the button a unique id
    newButton.innerHTML = `<span style="font-family:'Trebuchet MS';">${title}</span>`;
    newButton.setAttribute("lat",lat); // sets the latitude 
    newButton.setAttribute("lng",lng); // sets the longitude 
    newButton.addEventListener('click', function(){
        map.flyTo([lat,lng]);
    })
    const spaceForButtons = document.getElementById('placeForButtons')
    spaceForButtons.appendChild(newButton);//this adds the button to our page.
}



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
    NIndian.addTo(map) // add our layers after markers have been made
    SIndian.addTo(map) // add our layers after markers have been made  
}

loadData(dataUrl)