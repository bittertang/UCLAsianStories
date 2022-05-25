// declare variables
let mapOptions = {'center': [34.0709,-118.444],'zoom': 15}

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

    let year = data['What year are you?'];
    let experience = data['Would you like to share about a positive or negative academic experience?'];
    let academicPressures = data['What type of academic pressure, if any, do you face?'];

    //if user didn't fillout anything for academic pressures
    if (!academicPressures){
        academicPressures = "";
    }

    console.log(experience);
    if(experience == "Positive"){

        
        let posExperience = data['Describe a positive academic experience you had this school year.'];
        let posLocation = data['Where on campus would you like to share this positive experience about?'];

        let marker = L.circleMarker([data.lat,data.lng],
            {"radius": 8,
            "color": "#228B22",
            "weight": 3,
            "opacity": 500})

        //when user clicks on marker, add story to side bar
        marker.addEventListener("click", function(){
            document.getElementById("year").innerHTML = year;
            document.getElementById("pressure").innerHTML = academicPressures;
            document.getElementById("experience").innerHTML = posExperience; 
        })

        pos.addLayer(marker).addTo(map)
        // .bindPopup(`<h2>${year}</h2>`)       
        // createButtons(data.lat,data.lng,posLocation)
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
            document.getElementById("pressure").innerHTML = academicPressures;
            document.getElementById("experience").innerHTML = negExperience; //add positive experience to sidebar 
        })

        neg.addLayer(marker).addTo(map)
        // .bindPopup(`<h2>${year}</h2> <h3>${negExperience}</h3>`)        
        // createButtons(data.lat,data.lng,negLocation)
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
}





loadData(dataUrl)