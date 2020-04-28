// color
const domain_arr = [1]; // cases with 1+ are colored
for (let i = 0; i < 9; i++) { // all other cases are colored with the zero case
    domain_arr.push((i + 1) * 39); //The multiplier fo case domains
}
const covid19_domain = domain_arr;
const covid19_color = d3.scaleThreshold()
    .domain(covid19_domain)
    .range(d3.schemeReds[9]);

// covid data csv
const covidData = d3.map();
const dateData = {};
// const dateRef = [];

// tracks data for the day
startDate = new Date("2020-01-21");
endDate = new Date("2020-04-26");
const createDateArr = (startDate, endDate) => {

    const arr = new Array();
    let dt = new Date(startDate);

    while (dt <= endDate) {
        arr.push(new Date(dt).toISOString().slice(0, 10));
        dt.setDate(dt.getDate() + 1);
    }

    return arr;
}
dateRef = createDateArr(startDate, endDate);
// console.log(dateRef);

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

            return covid19_color(d.corona = dateData["2020-01-21"].get(d.id) || 0);
        })




    // animation
    let tracker = 0;


    d3.select("button.btn").on("click", () => {

        var t = d3.interval((e) => {
            map.transition()
                .duration("350")
                .attr("fill", (d) => {

                    return covid19_color(d.corona = dateData[dateRef[tracker]].get(d.id) || 0);
                })


            tracker = tracker + 1;
            if (tracker > 96) {
                tracker = 0;
                t.stop();
            }
        }, 200);






    });


}