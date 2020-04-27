// color
const domain_arr=[1]; // cases with 1+ are colored
for(let i = 0; i<9;i++){ // all other cases are colored with the zero case
domain_arr.push((i+1)*39); //The multiplier fo case domains
}
const covid19_domain = domain_arr;
const covid19_color = d3.scaleThreshold()
.domain(covid19_domain)
.range(d3.schemeBlues[9]);

// covid data csv
const covidData = d3.map();

// async tasks
d3.queue()
.defer(d3.json, "./counties-10m.json")
.defer(d3.csv, "./us-counties.csv", function(d) {

    // get data by date
    if(d.date === "2020-04-21") {
        covidData.set(d.fips, +d.cases);
    } 
    
})
.await(ready);

// callaback function
function ready(error, data) {

    if(error) throw error;


    // usa and gather mapmap
    const usa_map = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.counties.geometries
    });
 
    // projection
    const projection = d3.geoAlbersUsa()
    .fitExtent([[0,0],[800,800]],usa_map);

    // path
    const geoPath = d3.geoPath()
    .projection(projection);

    // draw map
    d3.select("svg.usamap").selectAll("path")
    .data(usa_map.features)
    .enter()
    .append("path")
    .attr("d", geoPath)
    .attr("fill", (d) => {
        return covid19_color(d.corona = covidData.get(d.id) || 0);
    }); //fill in counties according to cases. If no cases fill it with the 0 case


}