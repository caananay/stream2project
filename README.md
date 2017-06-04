The Significant earthquakes dashboard is a graphical visualisation of earthquakes that occurred within the period of 2006 to 2016.
It uses various kinds of charts (bar chart, row chart, pie chart, choropleth map, bubble chart and a data table) to show at a glance where and when
the earthquake occurred, the total number of deaths and injuries that resulted from the earthquake, the total number of houses damaged and destroyed by the earthquake and
the focal depth & magnitude of the earthquake.

The data set used for the dashboard on this website is culled from the following database National Geophysical Data Center / World Data Service (NGDC/WDS): Significant Earthquake Database. National Geophysical Data Center, NOAA.<a href="http://dx.doi.org/10.7289/V5TD9V7K">doi:10.7289/V5TD9V7K</a>
The dashboard displays information on destructive earthquakes from 2006 to 2016 (with the exclusion of Haiti) that meet at least one of the following criteria: 10 0r more deaths and Magnitude 7.5 or greater.

The website consists of two pages, the home page and the dashboard page.

The home page includes details of the what the website is about, where the data set was gotten, definitions of variables used in the data set, what the information on the dashboard represent and how to use the dashboard.

On the other hand the dashboard page displays a graphical representation of the data set used, showing:

 - a bar chart with the total number of deaths by location name
 - A choropleth map of the world showing the total number of injuries by country. All the areas coloured light blue show counties where no earthquakes occurred.
 - A row chart showing earthquake count by country. This shows the country where an earthquake occurred and the number of times it occurred in the given timeframe of 2006 to 2016.
 - A bubble chart showing the relationship between the focal depth, primary magnitude and the total number of death.
 - A pie chart showing the years between 2006 and 2016 an earthquake occurred and the count.
 - The table showing all the relevant data for the earthquakes that occured within the period of 2006 and 2016.</p>

The website was designed using the following technologies:

 - Bootstrap: this was used for the page layout design, look and feel of the website.
 - d3.js
 - dc.js
 - javascript
 - python
 - Mongo DB
 - Crossfilter.js
 - HTML
 - CSS
 - Flask

 A third party code was used for the data table pagination (culled from https://github.com/dc-js/dc.js/blob/master/web/examples/table-pagination.html) with a few minor changes made to the variable names.

The project was deployed using Heroku.