// color
const domain_arr=[1];
for(let i = 0; i<9;i++){
domain_arr.push((i+1)*39)
}
console.log(domain_arr)
const covid19_domain = domain_arr;
const covid19_color = d3.scaleThreshold()
.domain(covid19_domain)
.range(d3.schemeGreens[9]);

// covid data csv
const covidData = d3.map();

// async tasks
d3.queue()
.defer(d3.json, "./counties-10m.json")
.defer(d3.csv, "./us-counties.csv", function(d) {
    

    

    // let fipsVal = d.fips;
    // // console.log(typeof  d.fips )
    // if(fipsVal.includes(".")) {
    //     fipsVal = fipsVal.split(".")[0];
        
    // }
    // if(fipsVal.length === 4) {
    //     fipsVal = "0" + fipsVal;
    //     // console.log(fipsVal)
    // }

    if(d.date === "2020-04-21") {
        covidData.set(d.fips, +d.cases);
    } 
    
    // console.log(typeof fipsVal)
    
})
.await(ready);

// callaback function
function ready(error, data) {

    if(error) throw error;


    // usa map
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
        // console.log( typeof d.id);
        return covid19_color(d.corona = covidData.get(d.id) || 0);
    });


}