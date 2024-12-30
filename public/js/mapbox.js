const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

export const displayMap = (locations) => {

    mapboxgl.accessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ib50maWCT_Dj2fStFJ9Mzo4JXR04ptHa0';

    var map = new mapboxgl.map({
        container:'map',
        style:'mapbox://styles/',
        scrollZoom: false
    });
    
    const bounds = new mapboxgl.lnglatBounds();
    
    locations.forEach(loc=>{
        //create marker
        const el = document.createElement('div');
        el.className = 'marker';
    
        //add marker
        new mapboxgl.Marker({
            element:el,
            anchor:'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);
    
        //add popup
        new mapboxgl.Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p?>Day ${loc.day}:${loc.description}</p>`)
        .addTo(map)
    
        //extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    
    map.fitBounds(bounds,{
        padding:{
            top:200,
            bottom:150,
            left:100,
            right:100
        }
    });
    
}
