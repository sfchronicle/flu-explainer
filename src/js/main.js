require("./lib/social"); //Do not delete
var d3 = require("d3");

console.log(d3);

var windowWidth = $(window).width();
console.log("window width = ");
console.log(windowWidth);

var maxWidth = 800;

var colorScale = d3.scaleOrdinal(d3.schemeCategory20c);

var dataNested = d3.nest()
  .key(function(d){ return d["FluYear"]; })
  .entries(fluHistoricalData);

dataNested.forEach(function(d) {
    d.values.sort(function(a, b) {
        return d3.ascending(+a.ConsecWeek, +b.ConsecWeek)
    });
});

console.log(dataNested);

function hoverChart(targetID) {

  // show tooltip
  var toolipLines = d3.select("body").append("div")
    .attr("class", "tooltip-lines");

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 65,
    bottom: 40,
    left: 60
  };
  if (screen.width > 1025) {
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 1024 && screen.width > 768) {
    var margin = {
      top: 15,
      right: 80,
      bottom: 40,
      left: 60
    };
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var margin = {
      top: 15,
      right: 200,
      bottom: 40,
      left: 100
    };
    // var width = 440 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 60,
      bottom: 50,
      left: 50
    };
    // var width = 340 - margin.left - margin.right;
    var height = 380 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 55,
      bottom: 50,
      left: 50
    };
    // var width = 310 - margin.left - margin.right;
    var height = 370 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,maxWidth) - 10 - margin.left - margin.right;
  console.log(width);

  d3.select(targetID).select("svg").remove();
  var svg = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var x = d3.scaleLinear().range([0, width]),
      y = d3.scaleLinear().range([height, 0]);
      // yRight = d3.scaleLinear().range([height,0]);

  x.domain([1, 52]);
  y.domain([0,10]);

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Week of flu season")

    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 20)
          .attr("x", 0)
          .attr("fill","black")
          .style("text-anchor", "end")
          .text("Weekly flu rate")

    var voronoi = d3.voronoi()
        .x(function(d) {
          return x(d["ConsecWeek"]);
        })
        .y(function(d) {
          return y(d["PercentVisits"])
        })
        .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

    var line = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) {
          return x(d["ConsecWeek"]);
        })
        .y(function(d) {
          return y(d["PercentVisits"]);
        });

    dataNested.forEach(function(d) {

      // var class_list = "line voronoi"
      var class_list = "line voronoi id"+d.key;
      svg.append("path")
        .attr("class", class_list)
        .style("stroke", function(){
          var substr = d.key.substring(0,4);
          console.log(substr);
          console.log(colorScale(+substr));
          return colorScale(+substr);
        })//color_by_year(d.key))//color_by_gender(d.values[0].gender))
        .style("stroke-width",2)
        .attr("d", line(d.values));//lineAllStrava(d.values));
    });

    var focus = svg.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
        .attr("y", -10);

    var voronoiGroup = svg.append("g")
      .attr("class", "voronoi");

    var focus = svg.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
        .attr("y", -10);

    var voronoiGroup = svg.append("g")
      .attr("class", "voronoi");

    voronoiGroup.selectAll("path")
      .data(voronoi.polygons(d3.merge(dataNested.map(function(d) { return d.values; }))))
      .enter().append("path")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    function mouseover(d) {
      console.log(d.data["FluYear"]);
      d3.select(".id"+d.data["FluYear"]).classed("line-hover", true);
      focus.attr("transform", "translate(" + x(d.data["ConsecWeek"]) + "," + y(d.data["PercentVisits"]) + ")");
    }

    function mouseout(d) {
      d3.select(".id"+d.data["FluYear"]).classed("line-hover", false);
      focus.attr("transform", "translate(-100,-100)");
    }

}

hoverChart("#bad-year-for-the-flu");

function dotChart(targetID){

  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  var format = d3.format(",d");

  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  var pack = d3.pack()
      .size([width, height])
      .padding(1.5);

  d3.csv("flare.csv", function(d) {
    d.value = +d.value;
    if (d.value) return d;
  }, function(error, classes) {
    if (error) throw error;

    var root = d3.hierarchy({children: classes})
        .sum(function(d) { return d.value; })
        .each(function(d) {
          if (id = d.data.id) {
            var id, i = id.lastIndexOf(".");
            d.id = id;
            d.package = id.slice(0, i);
            d.class = id.slice(i + 1);
          }
        });

    var node = svg.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.package); });

    node.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.id; })
      .append("use")
        .attr("xlink:href", function(d) { return "#" + d.id; });

    node.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
      .selectAll("tspan")
      .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
        .text(function(d) { return d; });

    node.append("title")
        .text(function(d) { return d.id + "\n" + format(d.value); });
  });
}
