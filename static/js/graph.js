queue()
  .defer(d3.json, "/earthquakes/project2")
  .defer(d3.json, "/static/js/world.json")
  .await(makeGraphs);


function makeGraphs(error, projectsJson, countryJson) {

  //Clean projectsJson data
  var sigQuakesProjects = projectsJson;

  sigQuakesProjects.forEach(function (d) {
    d["TOTAL_DEATHS"] = +d["TOTAL_DEATHS"];
  });

  //Create a Crossfilter instance
  var ndx = crossfilter(sigQuakesProjects);
  var all = ndx.groupAll();

  dc.dataCount(".dc-data-count")
    .dimension(ndx)
    .group(all)
    .html({
      some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records | <a href="\javascript:dc.filterAll(); dc.renderAll();\">Reset All</a>',
      all: 'All records selected. Please click on a graph to apply filters.'
    });

  //Define Dimensions

  var focalDepthDim = ndx.dimension(function (d) {
      return d["FOCAL_DEPTH"];
  });

  var eqPrimaryDim = ndx.dimension(function (d) {
      return d["EQ_PRIMARY"];
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


//Calculate metrics

  //Bar Charts
  var deathBarChart = dc.barChart("#deaths-bar-chart");
  var countryDim = ndx.dimension(function (d) {
    return d["COUNTRY"];
  });

  var deathsByLocation = locationDim.group().reduceSum(function (d) {
    return d["TOTAL_DEATHS"];
  });

  var allLocations = sigQuakesProjects.map(d => d['LOCATION_NAME']);
  var uniqueLocations = Array.from(new Set(allLocations)).sort();

  //row chart country
  var countryGroup = countryDim.group();
  var totalInjuriesGroup = countryDim.group().reduceSum(function (d) {
      return d.TOTAL_INJURIES
  });

  //Pie Chart year

  var yearDim = ndx.dimension(function (d) {
      return d["YEAR"];
  });
  var yearGroup = yearDim.group();
  var countryChart = dc.rowChart("#country-chart");
  var pieChart = dc.pieChart("#year-pie-chart");
  var tableChart = dc.dataTable("#sigQuake-table");
  var worldChart = dc.geoChoroplethChart("#map");

  //Bubble Chart

  var bubbleDim = ndx.dimension(function (d) {
    return [d.FOCAL_DEPTH, d.EQ_PRIMARY, d.COUNTRY];
  });

  var bubbleGroup = bubbleDim.group().reduceSum(function (d) {
    return d.TOTAL_DEATHS;
  });
  var minDepth = focalDepthDim.bottom(1)[0].FOCAL_DEPTH;
  var maxDepth = focalDepthDim.top(1)[0].FOCAL_DEPTH;

  var minMag = eqPrimaryDim.bottom(1)[0].EQ_PRIMARY;
  var maxMag = eqPrimaryDim.top(1)[0].EQ_PRIMARY;

  var minDeath = totalDeathsDim.bottom(1)[0].TOTAL_DEATHS;
  var maxDeath = totalDeathsDim.top(1)[0].TOTAL_DEATHS;

  var bubble = dc.bubbleChart("#total-chart")
  //chart with variable definitions
  var chartWidth = $("#resizeChart").width();
  var rowWidth = $("#resizeRow").width();
  if(chartWidth >= 480){
    rowSize = rowWidth;
  } else {
    rowSize = rowWidth * 0.3;
  }


  if(chartWidth >= 480){
    mapSize =chartWidth;
    mapHeight=chartWidth*0.43;
  } else {
    mapSize=chartWidth;
    mapHeight=chartWidth*0.7;
  }

  //draw charts
  worldChart
    .width(mapSize)
    .height(500)
    .dimension(countryDim)
    .projection(d3.geo.equirectangular())
    .group(totalInjuriesGroup)
    .overlayGeoJson(countryJson.features, "COUNTRY", function (d) {
        return d.properties.name;
    });

  deathBarChart
    .width(chartWidth)
    .height(500)
    .margins({top: 10, right: 90, bottom: 240, left: 35})
    .dimension(locationDim)
    .group(deathsByLocation)
    .x(d3.scale.ordinal().domain(uniqueLocations))
    .xUnits(dc.units.ordinal)

  pieChart
    .height(300)
    .radius(150)
    .innerRadius(50)
    .dimension(yearDim)
    .group(yearGroup);

  countryChart
    .height(300)
    .width(rowSize)
    .dimension(countryDim)
    .group(countryGroup)
    .x(d3.scale.linear().domain([0, 50]))
    .elasticX(true);

  bubble
    .width(chartWidth)
    .height(300)
    .margins({top: 10, right: 50, bottom: 30, left: 50})
    .dimension(bubbleDim)
    .group(bubbleGroup)
    .colorAccessor(function (d) {
      return d.value;
    })
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
    .maxBubbleRelativeSize(0.08)
    .yAxisLabel("EQ PRIMARY")
    .xAxisLabel("FOCAL DEPTH")
    .renderLabel(true)
    .label(function(d){return d.key[2]})
    .title(function (d) {
      return 'Focal Depth: ' + d.key[0] + ', Eq Primary: ' + d.key[1] + ', total deaths: ' + d.value;
    })
    .clipPadding(70)
    .r(d3.scale.linear().domain([minDeath, maxDeath]))
    .y(d3.scale.linear().domain([minMag, maxMag]))
    .x(d3.scale.linear().domain([minDepth, maxDepth]));
bubble.yAxis().ticks(8);


  tableChart
    .width(800)
    .height(400)
    .dimension(idDim)
    .group(function (d) {
      return d.YEAR;
    })
    .columns(['YEAR', {
      label: "LOCATION", format: function (d) {
        return d.LOCATION_NAME;
      }
    },
      {
        label: "FOCAL DEPTH", format: function (d) {
          return d.FOCAL_DEPTH;
      }
      },
      {
        label: "EQ PRIMARY", format: function (d) {
          return d.EQ_PRIMARY
      }
      },
      {
        label: "MB MAGNITUDE", format: function (d) {
          return d.EQ_MAG_MB
      }
      },
      {
        label: "MS MAGNITUDE", format: function (d) {
          return d.EQ_MAG_MS
      }
      },
      {
        label: "TOTAL DEATHS", format: function (d) {
          return d.TOTAL_DEATHS
      }
      },
      {
        label: "TOTAL INJURIES", format: function (d) {
          return d.TOTAL_INJURIES
      }
      },
      {
          label: "TOTAL HOUSES DESTROYED", format: function (d) {
          return d.TOTAL_HOUSES_DESTROYED
      }
      },
      {
        label: "TOTAL HOUSES DAMAGED", format: function (d) {
          return d.TOTAL_HOUSES_DAMAGED
      }
      }])
    .on("renderlet", function (table) {
        table.selectAll('.dc-table-group').classed('info', true);
        setTimeout(update, 100); //we need to wait for the table to load before the update function can be applied.
    })

    .size(Infinity)
    .sortBy(function (d) {
    return d["YEAR"];
    })
    .order(d3.ascending);


// Make charts responsive
$(window).resize(function() {
// Recalculate chart size
  var chartWidth = $("#resizeChart").width();
  var rowWidth = $("#resizeRow").width();

  if(chartWidth >= 480){
    rowSize = rowWidth;
  } else {
    rowSize = rowWidth * 0.3;
  }


  if(chartWidth >= 480){
    mapSize =chartWidth;
    mapHeight=chartWidth*0.43;
  } else {
    mapSize=chartWidth;
    mapHeight=chartWidth*0.7;
  }

// Set new values and redraw charts

bubble
  .width(chartWidth)
  .rescale()
  .redraw();

deathBarChart
  .width(chartWidth)
  .rescale()
  .redraw();

countryChart
  .width(rowWidth)
  .redraw();

  worldChart
    .width(mapSize)
    .height(mapHeight)
    .projection(d3.geo.equirectangular().scale(Math.min(mapSize*0.15)).translate([mapSize/2, mapHeight/2]))
    .redraw();

});

dc.renderAll();


//dataTable pagination
//code adapted from https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
var pageOffset = 0;
var pageSize = 15;
  function display() {
      d3.select('#begin')
          .text(pageOffset);
      d3.select('#end')
          .text(pageSize > all.value() ? all.value() : pageOffset+(pageSize -1));
      d3.select('#last')
          .attr('disabled', pageOffset-pageSize<0 ? 'true' : null);
      d3.select('#next')
          .attr('disabled', pageOffset+pageSize>=all.value() ? 'true' : null);
      d3.select('#size').text(all.value());
  }
  function update() {
      tableChart.beginSlice(pageOffset);
      tableChart.endSlice(pageOffset+pageSize);
      if (all.value() < pageSize){
          pageOffset = 0;
      }

      display();
      tableChart.redraw();
  }
  function next() {
      pageOffset += pageSize;
      update();
  }
  function last() {
      pageOffset -= pageSize;
      update();
  }
    document.getElementById('pieChartReset').onclick = function () {
      pieChart.filterAll();
      dc.redrawAll();
  };
   document.getElementById('bubbleChartReset').onclick = function () {
      bubble.filterAll();
      dc.redrawAll();
  };
     document.getElementById('deathsBarChartReset').onclick = function () {
      deathBarChart.filterAll();
      dc.redrawAll();
  };
       document.getElementById('mapReset').onclick = function () {
      worldChart.filterAll();
      dc.redrawAll();
  };
      document.getElementById('countryChartReset').onclick = function () {
      countryChart.filterAll();
      dc.redrawAll();
  };

document.getElementById('last').onclick = last;
document.getElementById('next').onclick = next;

}
