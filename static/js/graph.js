queue()
   .defer(d3.json, "/earthquakes/project2")
   .await(makeGraphs);

function makeGraphs(error, projectsJson) {

   //Clean projectsJson data
   var sigQuakesProjects = projectsJson;
  // var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
   sigQuakesProjects.forEach(function (d) {
      // d["date_posted"] = dateFormat.parse(d["date_posted"]);
      // d["date_posted"].setDate(1);
       d["TOTAL_DEATHS"] = +d["TOTAL_DEATHS"];
   });

console.log(sigQuakesProjects);
   //Create a Crossfilter instance
   var ndx = crossfilter(sigQuakesProjects);
    //console.log(ndx);
   //Define Dimensions

   var yearDim = ndx.dimension(function (d) {
       return d["YEAR"];
   });
   var focalDepthDim = ndx.dimension(function (d) {
       return d["FOCAL_DEPTH"];
   });
   var eqPrimaryDim = ndx.dimension(function (d) {
       return d["EQ_PRIMARY"];
   });
   var eqMagMwDim = ndx.dimension(function (d) {
       return d["EQ_MAG_MW"];
   });

    var eqMagMsDim = ndx.dimension(function (d) {
       return d["EQ_MAG_MS"];
   });
   var eqMagMbDim = ndx.dimension(function (d) {
       return d["EQ_MAG_MB"];
   });
   var countryDim = ndx.dimension(function (d) {
       return d["COUNTRY"];
   });
   var locationDim = ndx.dimension(function (d) {
       return d["LOCATION"];
   });

   var latitudeDim = ndx.dimension(function (d) {
       return d["LATITUDE"];
   });
   var longitudeDim = ndx.dimension(function (d) {
       return d["LONGITUDE"];
   });
   var totalDeathsDim = ndx.dimension(function (d) {
       return d["TOTAL_DEATHS"];
   });
   var totalInjuriesDim = ndx.dimension(function (d) {
       return d["TOTAL_INJURIES"];
   });
    var totalHousesDestroyedDim = ndx.dimension(function (d) {
       return d["TOTAL_HOUSES_DESTROYED"];
   });
   var totalHousesDamagedDim = ndx.dimension(function (d) {
       return d["TOTAL_HOUSES_DAMAGED"];
   });

//Calculate metrics
   var totalDeaths = totalDeathsDim.group();
   var deathsByCountry = countryDim.group().reduceSum(function (d) {
        return d["TOTAL_DEATHS"];
    });

   //Charts
   var deathBarChart = dc.barChart("#deaths-bar-chart");

   deathBarChart
       .width(800)
       .height(200)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(countryDim)
       .group(deathsByCountry)
       .x(d3.scale.ordinal().domain(['PAKISTAN','INDONESIA', 'SPAIN','ALGERIA']));



   dc.renderAll();
}