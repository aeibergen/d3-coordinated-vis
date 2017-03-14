//Andrea Eibergen
//March 8, 2017
//didn't use grat or background -styling choice

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on the US
    var projection = d3.geoAlbersUsa()
        .scale(950)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    //use d3.queue to load data in parallel
    d3.queue()
        .defer(d3.csv, "data/HealthData.csv") //load attributes from csv
        .defer(d3.json, "data/states.topojson") //load spatial data
        .await(callback);

    function callback(error, csvData, states){
        //translate states TopoJSON
        console.log(states);
        var unitedStates = topojson.feature(states, states.objects.states).features;
        //examine the results
        console.log(unitedStates);

        //add states to map
        var states = map.selectAll(".states")
            .data(unitedStates)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "states " + d.properties.name;
            })
            .attr("d", path);
    };
};