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
       d["location"] = d["location"];
       d["total_deaths"] = +d["total_deaths"];
   });


   //Create a Crossfilter instance
   var ndx = crossfilter(sigQuakesProjects);
    console.log(ndx);
   //Define Dimensions

   var yearDim = ndx.dimension(function (d) {
       return d["year"];
   });
   var focalDepthDim = ndx.dimension(function (d) {
       return d["focal_depth"];
   });
   var eqPrimaryDim = ndx.dimension(function (d) {
       return d["eq_primary"];
   });
   var eqMagMwDim = ndx.dimension(function (d) {
       return d["eq_mag_mw"];
   });

    var eqMagMsDim = ndx.dimension(function (d) {
       return d["eq_mag_ms"];
   });
   var eqMagMbDim = ndx.dimension(function (d) {
       return d["eq_mag_mb"];
   });
   var countryDim = ndx.dimension(function (d) {
       return d["country"];
   });
   var locationDim = ndx.dimension(function (d) {
       return d["location"];
   });

   var latitudeDim = ndx.dimension(function (d) {
       return d["latitude"];
   });
   var longitudeDim = ndx.dimension(function (d) {
       return d["longitude"];
   });
   var totalDeathsDim = ndx.dimension(function (d) {
       return d["total_deaths"];
   });
   var totalInjuriesDim = ndx.dimension(function (d) {
       return d["total_injuries"];
   });
    var totalHousesDestroyedDim = ndx.dimension(function (d) {
       return d["total_houses_destroyed"];
   });
   var totalHousesDamagedDim = ndx.dimension(function (d) {
       return d["total_houses_damaged"];
   });

//Calculate metrics
   var totalDeaths = totalDeathsDim.group();

   //Charts
   var deathBarChart = dc.barChart("#deaths-bar-chart");

   deathBarChart
       .width(800)
       .height(200)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(totalDeathsDim)
       .group(totalDeaths);
       //.transitionDuration(500)
       //.x(d3.time.scale().domain([minDate, maxDate]))
       //.elasticY(true)
       //.xAxisLabel("Location")
      // .yAxis().ticks(10);



   dc.renderAll();
}