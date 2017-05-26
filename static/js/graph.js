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

   //Create a Crossfilter instance
   var ndx = crossfilter(sigQuakesProjects);

   //Define Dimensions


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
   var locationDim = ndx.dimension(function (d) {
       return d["LOCATION_NAME"];
   });
var idDim = ndx.dimension(function (d) {
       return d["I_D"];
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
   //var totalDeaths = totalDeathsDim.group();
     var countryDim = ndx.dimension(function (d) {return d["COUNTRY"];});
   var deathsByCountry = countryDim.group().reduceSum(function (d) {
        return d["TOTAL_DEATHS"];
    });
    var deathsByLocation = locationDim.group().reduceSum(function (d) {
        return d["TOTAL_DEATHS"];});
     var allLocations = sigQuakesProjects.map(d => d['LOCATION_NAME']);
  var uniqueLocations = Array.from(new Set(allLocations)).sort();
   // var locationGroup = locationDim.group();

   //Bar Charts
   var deathBarChart = dc.barChart("#deaths-bar-chart");

   var allCountries = sigQuakesProjects.map(d => d['COUNTRY']);
  var uniqueCountries = Array.from(new Set(allCountries)).sort();

  //row chart country
  var  countryGroup = countryDim.group();

  //Pie Chart year

      var yearDim = ndx.dimension(function (d) {
       return d["YEAR"];
   });
      var yearGroup = yearDim.group();

    //table


   deathBarChart
      .width(800)
       .height(200)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(locationDim)
       .group(deathsByLocation)
       .x(d3.scale.ordinal().domain(uniqueLocations))
       // .dimension(countryDim)
       // .group(deathsByCountry)
       //.x(d3.scale.ordinal().domain(uniqueCountries))
        .xUnits(dc.units.ordinal);

   var pieChart = dc.pieChart("#year-pie-chart")
       .height(600)
       .radius(150)
       .innerRadius(50)
       .dimension(yearDim)
       .group(yearGroup);

   var countryChart = dc.rowChart("#country-chart")
        .height(300)
       .width(600)
       //.innerRadius(50)
       .dimension(countryDim)
       .group(countryGroup)
        .x(d3.scale.linear().domain([0, 50]))
       .elasticX(true);
   //.legend(dc.legend());

     var bubbleDim = ndx.dimension(function (d) {
       return [d.FOCAL_DEPTH, d.EQ_PRIMARY];
   });

     var bubbleGroup = bubbleDim.group();
     var minDepth = focalDepthDim.bottom(1)[0].FOCAL_DEPTH;
     var maxDepth = focalDepthDim.top(1)[0].FOCAL_DEPTH;

     var minMag = eqPrimaryDim.bottom(1)[0].EQ_PRIMARY;
     var maxMag = eqPrimaryDim.top(1)[0].EQ_PRIMARY;

      var minDeath = totalDeathsDim.bottom(1)[0].TOTAL_DEATHS;
     var maxDeath = totalDeathsDim.top(1)[0].TOTAL_DEATHS;

    var bubble = dc.bubbleChart("#total-chart")
        .width(900)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(bubbleDim)
       .group(bubbleGroup)
        .colorAccessor(function (d) {return d.value;})
        .colors(d3.scale.category20b())
         .keyAccessor(function (d) {
             return d.key[0];
         })
        .valueAccessor(function (d) {
             return d.key[1];
         })
        .radiusValueAccessor(function (d) {
            return d.value;
        })
        .maxBubbleRelativeSize(0.1)
        .yAxisLabel("EQ PRIMARY")
        .xAxisLabel("FOCAL DEPTH")
        .title(function (d) {
            return 'x: ' +d.key[0] + ', y: ' +d.key[1]+', val: '+d.value;
        })
        .r(d3.scale.linear().domain([minDeath,maxDeath]))
        .y(d3.scale.linear().domain([minMag,maxMag]))

        .x(d3.scale.linear().domain([minDepth,maxDepth]));


   var dataTable = dc.dataTable("#sigQuake-table")
       .width(900)
       .height(1000)
       .dimension(idDim)
       .group(function (d) {return d.YEAR; })
       .columns(['YEAR', 'COUNTRY', 'LOCATION_NAME', 'FOCAL_DEPTH', 'EQ_PRIMARY', 'EQ_MAG_MB', 'TOTAL_DEATHS', 'TOTAL_INJURIES', 'TOTAL_HOUSES_DESTROYED',
        'TOTAL_HOUSES_DAMAGED'])
       .on("renderlet", function(table){
           table.selectAll('.dc-table-group').classed('info',true);
       })
      .sortBy(function(d){return d.COUNTRY})
      .order(d3.ascending);


   dc.renderAll();
}