// const caseData = d3.map();
const caseData = d3.csv("./covid19cases.csv");

const countiesMap = d3.json("./usa-counties.json");
// const countiesMapAlt = d3.json("usmap.json");

// data of all corona cases in the usa


//color
// const casesDomain = [0,5000,10000,15000,20000,25000,30000,35000,40000,50000];

// const casesColor = d3.scaleThreshold()
// .domain(casesDomain)
// .range(d3.schemeBlues[9])
// ---------------------------------



//Get the data csv
// caseData.then((data) => {
//     console.log(+data[57].fips);

//     let fipsVal;

//     for(var i = 0; i < data.length; i++) {
//         if(data[i].fips.includes(".") ) {
//             fipsVal = data[i].fips.split(".")[0]
//         };

    //     if(fipsVal.length === 4) { //there were some instances where the length of the FIPS code was 4, but 5 digit was needed
    //       fipsVal = "0" + fipsVal;
    //   }
    //     covid19data.set(+fipsVal, +data[i]["2020-04-23"]);
    // }        

// }).catch((err) => { return err });

//color scale & data
const dataMap = d3.map();
const colorScale = d3.scaleThreshold()
  .domain([0,5000,10000,15000,20000,25000,30000,35000,40000,50000])
  .range(d3.schemeBlues[7]);

Promise.all([caseData, countiesMap]).then((data) => {

//SET DATA POINTS
dataMap.set(data[0][0].fips, +data[0][0]["2020-04-23"])

    //usaMap
    const usaMap = topojson.feature(data[1], {
        type: "GeometryCollection",
        geometries: data[1].objects.countiesUnfiltered.geometries
    });

    //projection
    const projection = d3.geoAlbersUsa()
        .fitExtent([[0, 0], [800, 800]], usaMap);

    //path
    const geoPath = d3.geoPath()
        .projection(projection);

         d3.select("svg.usamap").selectAll("path")
        .data(usaMap.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("fill", (d) => {
            console.log(d)
            return d.cases = dataMap.get(+d.properties.FIPS);
        });
});

// countiesMap.then((data) => {

//     //usaMap
//     const usaMap = topojson.feature(data, {
//         type: "GeometryCollection",
//         geometries: data.objects.countiesUnfiltered.geometries
//     });

//     //projection
//     const projection = d3.geoAlbersUsa()
//         .fitExtent([[0, 0], [800, 800]], usaMap);

//     //path
//     const geoPath = d3.geoPath()
//         .projection(projection);

//  d3.select("svg.usamap").selectAll("path")
//         .data(usaMap.features)
//         .enter()
//         .append("path")
//         .attr("d", geoPath)
//         .attr("fill", "lightblue");


// }).catch((err) => { err });

   