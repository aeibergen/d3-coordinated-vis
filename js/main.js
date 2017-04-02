//Andrea Eibergen
//March 8, 2017
//didn't use grat or background -styling choice

(function(){

//pseudo-global variables
var attrArray = ["Fruit", "Vegetables", "Exercise", "NoExercise", "Overweight", "Obese", "FarmersMarkets", "SNAP"];
var expressed = attrArray[0]; //initial attribute

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
        //create the color scale
        var colorScale = makeColorScale(csvData);

        //translate US topojson
        var unitedStates = topojson.feature(states, states.objects.states).features;

        //join csv data to GeoJSON enumeration units
        unitedStates = joinData(unitedStates, csvData);

        //add enumeration units to the map
        setEnumerationUnits(unitedStates, map, path, colorScale);
    };
}; //goodbye setmap

function joinData(unitedStates, csvData){

        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csvData.length; i++){
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.name; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a=0; a<unitedStates.length; a++){

                var geojsonProps = unitedStates[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.name; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                        console.log(geojsonProps);
                    });
                };
            };
        };

    return unitedStates;
};

//function to create units to be used to display choropleth
function setEnumerationUnits(unitedStates, map, path, colorScale){

    //add states to map
    var states = map.selectAll(".states")
        .data(unitedStates)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "states " + d.properties.name;
        })
        .attr("d", path)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        });
};

//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
    ];
    //assign two-value array as scale domain
    colorScale.domain(minmax);

    return colorScale;
};

//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};

})();