// color
const domain_arr = [1]; // cases with 1+ are colored
for (let i = 0; i < 9; i++) { // all other cases are colored with the zero case
    domain_arr.push((i + 1) * 69); //The multiplier fo case domains
}
const covid19_domain = domain_arr;
const covid19_color = d3.scaleThreshold()
    .domain(covid19_domain)
    .range(d3.schemeReds[9]);

// covid data csv
const covidData = d3.map();
const dateData = {};
const dateRef = [];

// tracks data for the day
startDate = new Date("2020-01-21");
endDate = new Date("2020-01-24");
console.log(new Date(startDate));

const createDateArr = () => {

}

// async tasks
d3.queue()
    .defer(d3.json, "./counties-10m.json")
    .defer(d3.csv, "./us-counties.csv", function (d) {

        // get data by date
        if (d.date) {
            if (dateData.hasOwnProperty(d.date)) {
                dateData[d.date].set(d.fips, +d.cases);
            } else {
                dateData[d.date] = d3.map().set(d.fips, +d.cases);
            }
        }


    })
    .await(ready);

// callaback function
function ready(error, data) {

    if (error) throw error;

    // gather map
    const usa_map = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.counties.geometries
    });

    // projection
    const projection = d3.geoAlbersUsa()
        .fitExtent([[0, 0], [800, 800]], usa_map);

    // path
    const geoPath = d3.geoPath()
        .projection(projection);


    // draw map
    const map = d3.select("svg.usamap").selectAll("path")
        .data(usa_map.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("stroke-width", 1)
        .attr("fill", (d) => {

            return covid19_color(d.corona = dateData["2020-04-24"].get(d.id) || 0);
        })
        //fill in counties according to cases. If no cases fill it with the 0 case
        // .transition()
        // .duration("1000")
        .attr("fill", (d) => {

            // d3.select("button.btn").on("click", (d) => {

            // });

            return covid19_color(d.corona = dateData["2020-04-24"].get(d.id) || 0);
        })
    d3.select("button.btn").on("click", (d) => {
        // setTimeout((tracker)=>{
        //     if(tracker < 94) {

        //     }
        // },700);

        map.attr("fill", (d) => {

            return covid19_color(d.corona = dateData["2020-01-21"].get(d.id) || 0);
        });
    });


}