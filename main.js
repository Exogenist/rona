// resize on initial load
const svgContainer = document.getElementById("svgContainer")
const w = svgContainer.clientWidth,
    h = w / 2;
console.log(w + ", " + h);

//tool tip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


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

// tracks data for the day
startDate = new Date("2020-01-21");
endDate = new Date("2020-04-26");
const createDateArr = (startDate, endDate) => {

    const arr = new Array();
    let dt = new Date(startDate);

    while (dt <= endDate) {
        arr.push(new Date(dt).toISOString().slice(0, 10));
        dt.setDate(dt.getDate() + 1);
        // console.log(new Date(dt).toISOString().slice(0, 10))
    }

    return arr;
}
const unique = createDateArr(startDate, endDate),
    dateRef = [...new Set(unique)];
// console.log(dateRef)

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
    let projection = d3.geoAlbersUsa()
        .fitExtent([[0, 0], [w, h]], usa_map);

    // path
    const geoPath = d3.geoPath()
        .projection(projection);


    // draw map
    const map = d3.select("svg.usamap").selectAll("path")
        .data(usa_map.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("stroke-width", 0.5)
        .attr("stroke", "#ffffff")
        .on("mouseover", (d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.properties.name + ": " + d.corona)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr("fill", (d) => {

            return covid19_color(d.corona = dateData["2020-01-21"].get(d.id) || 0);
        })




    // animation
    let tracker = 0;
    //slider
    const slider = document.getElementById("sliderRange");
    const dateLabel = document.getElementById("dateLabel");
    const btnState = document.getElementById("btnState");
    dateLabel.innerHTML = dateRef[slider.value]
    slider.oninput = () => {
        tracker = +slider.value;
        dateLabel.innerHTML = dateRef[slider.value];
        map.attr("fill", (d) => {

            return covid19_color(d.corona = dateData[dateRef[slider.value]].get(d.id) || 0);
        });
    };

    // button
    d3.select("button.btn").on("click", (e) => {
        if (btnState.innerHTML === "Play") {
            btnState.innerHTML = "Stop";
        } else {
            btnState.innerHTML = "Play";
        }

        const t = d3.interval(() => {

            if (btnState.innerHTML === "Stop") {

                map.attr("fill", (d) => {

                    return covid19_color(d.corona = dateData[dateRef[tracker]].get(d.id) || 0);
                });

                slider.value = tracker;
                dateLabel.innerHTML = dateRef[slider.value]
                tracker = tracker + 1;
                if (tracker > 95) {
                    tracker = 0;
                    t.stop();
                    btnState.innerHTML = "Play";

                }
                slider.oninput = () => {
                    t.stop();
                    btnState.innerHTML = "Play";
                    tracker = +slider.value;
                    dateLabel.innerHTML = dateRef[slider.value];
                    map.attr("fill", (d) => {

                        return covid19_color(d.corona = dateData[dateRef[slider.value]].get(d.id) || 0);
                    });
                };
            } else {
                t.stop();
            }

        }, 200);

    });

    // resize window function
    let resizeHelper;
    const resize = () => {
        map.attr("transform", "scale(" + svgContainer.clientWidth / w + ")");
    };
    window.onresize = () => {
        clearTimeout(resizeHelper);

        resizeHelper = setTimeout(resize, 500);
    }

}