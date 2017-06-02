queue()
   .defer(d3.json, "/earthquakes/project2")
    .defer(d3.json, "/static/js/world.json")
   .await(makeGraphs);


function makeGraphs(error, projectsJson, countryJson) {

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
    // var eqMagMwDim = ndx.dimension(function (d) {
    //     return d["EQ_MAG_MW"];
    // });
    //
    //  var eqMagMsDim = ndx.dimension(function (d) {
    //     return d["EQ_MAG_MS"];
    // });
    // var eqMagMbDim = ndx.dimension(function (d) {
    //     return d["EQ_MAG_MB"];
    // });
    var locationDim = ndx.dimension(function (d) {
        return d["LOCATION_NAME"];
    });
    var idDim = ndx.dimension(function (d) {
        return d["I_D"];
    });

    var totalDeathsDim = ndx.dimension(function (d) {
        return d["TOTAL_DEATHS"];
    });
    // var totalInjuriesDim = ndx.dimension(function (d) {
    //     return d["TOTAL_INJURIES"];
    // });

    // var minInjuries = totalInjuriesDim.bottom(1)[0].TOTAL_INJURIES;
    //  var maxInjuries = totalDeathsDim.top(1)[0].TOTAL_INJURIES;
    //var totalHousesDestroyedDim = ndx.dimension(function (d) {
    //     return d["TOTAL_HOUSES_DESTROYED"];
    // });
    // var totalHousesDamagedDim = ndx.dimension(function (d) {
    //     return d["TOTAL_HOUSES_DAMAGED"];
    // });

//Calculate metrics
    //var totalDeaths = totalDeathsDim.group();
    var countryDim = ndx.dimension(function (d) {
        return d["COUNTRY"];
    });
    // var deathsByCountry = countryDim.group().reduceSum(function (d) {
    //      return d["TOTAL_DEATHS"];
    //  });
    var deathsByLocation = locationDim.group().reduceSum(function (d) {
        return d["TOTAL_DEATHS"];
    });
    var allLocations = sigQuakesProjects.map(d => d['LOCATION_NAME']);
    var uniqueLocations = Array.from(new Set(allLocations)).sort();
    // var locationGroup = locationDim.group();

    //Bar Charts
    var deathBarChart = dc.barChart("#deaths-bar-chart");

    //  var allCountries = sigQuakesProjects.map(d => d['COUNTRY']);
    // var uniqueCountries = Array.from(new Set(allCountries)).sort();

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

    worldChart
        .width(1360)
        .height(500)
        .dimension(countryDim)
        .projection(d3.geo.equirectangular())
        .group(totalInjuriesGroup)
        .overlayGeoJson(countryJson.features, "COUNTRY", function (d) {
            return d.properties.name;
        });

    // dc.lineChart("#injuries-bar-chart")
    //     .width(800)
    //     .height(200)
    //     .margins({top: 10, right: 0, bottom: 30, left: 40})
    //     .dimension(eqMagMsDim)
    //     .group(totalInjuriesGroup)
    //     .legend(dc.legend().x(500).y(5).gap(5))
    //     .x(d3.scale.linear().domain([0,10]));

    deathBarChart
        .width(800)
        .height(200)
        .margins({top: 10, right: 0, bottom: 30, left: 40})
        .dimension(locationDim)
        .group(deathsByLocation)
        .x(d3.scale.ordinal().domain(uniqueLocations))
        // .dimension(countryDim)
        // .group(deathsByCountry)
        //.x(d3.scale.ordinal().domain(uniqueCountries))
        .xUnits(dc.units.ordinal)
        .xAxis().tickValues([]);
    // .renderlet(function(chart){
    //  var colors =d3.scale.ordinal().domain([uniqueLocations])
    //      .range(["steelblue", "brown", "red", "green", "yellow", "grey"]);
    //  chart.selectAll('rect.bar').each(function(d){
    //       d3.select(this).attr("style", "fill: " + colors(d.key)); // use key accessor if you are using a custom accessor
    //  });

    pieChart
        .height(300)
        .radius(150)
        .innerRadius(50)
        .dimension(yearDim)
        .group(yearGroup);


    countryChart
        .height(300)
        .width(600)
        //.transitionDuration(1500)
        //.innerRadius(50)
        .dimension(countryDim)
        .group(countryGroup)
        .x(d3.scale.linear().domain([0, 50]))
        .elasticX(true);
    //.legend(dc.legend());

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
        .width(800)
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
        .maxBubbleRelativeSize(0.05)
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
                label: "EQ MAG MB", format: function (d) {
                return d.EQ_MAG_MB
            }
            },
            {
                label: "EQ MAG MS", format: function (d) {
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
        })
        .size(Infinity)
        .sortBy(function (d) {
        return d["YEAR"];
        })
        .order(d3.ascending);

    update();
    dc.renderAll();


//dataTable pagination
//code adapted from https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html
var pageOffset = 0;
var pageSize = 15;
  function display() {
      d3.select('#begin')
          .text(pageOffset);
      d3.select('#end')
          .text(pageOffset+(pageSize-1));
      d3.select('#last')
          .attr('disabled', pageOffset-pageSize<0 ? 'true' : null);
      d3.select('#next')
          .attr('disabled', pageOffset+pageSize>=ndx.size() ? 'true' : null);
      d3.select('#size').text(ndx.size());
  }
  function update() {
      tableChart.beginSlice(pageOffset);
      tableChart.endSlice(pageOffset+pageSize);
      display();
  }
  function next() {
      pageOffset += pageSize;
      update();
      tableChart.redraw();
  }
  function last() {
      pageOffset -= pageSize;
      update();
      tableChart.redraw();
  }

  document.getElementById('last').onclick = last;
  document.getElementById('next').onclick = next;


}
