require("./lib/social"); //Do not delete
var d3 = require("d3");

var windowWidth = $(window).width();
console.log("window width = ");
console.log(windowWidth);

var formatthousands = d3.format(",");

// setting sizes of interactive
var margin = {
  top: 15,
  right: 50,
  bottom: 50,
  left: 70
};
if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 20,
    right: 20,
    bottom: 35,
    left: 30
  };
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 20,
    right: 20,
    bottom: 35,
    left: 35
  };
}

var maxWidth = 800;

var colorScale = d3.scaleOrdinal(d3.schemeCategory20c);
var colorScale2 = d3.scaleOrdinal(d3.schemeCategory20b);

var dataNested = d3.nest()
  .key(function(d){ return d["FluYear"]; })
  .entries(fluHistoricalData);

dataNested.forEach(function(d) {
    d.values.sort(function(a, b) {
        return d3.ascending(+a.ConsecWeek, +b.ConsecWeek)
    });
});

function hoverChart(targetID) {

  d3.select(targetID).select("svg").remove();

  // create SVG container for chart components
  if (screen.width > 1400){
    var height = 700 - margin.top - margin.bottom;
    console.log("big desktop")
  } else if (screen.width >= 340 && screen.width <= 1400){
    var height = 500 - margin.top - margin.bottom;
    console.log("medium size");
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    // var width = 340 - margin.left - margin.right;
    var height = 380 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
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
      .call(d3.axisBottom(x))
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
          .attr("y", -35)
          .attr("x", 0)
          .attr("fill","black")
          .style("text-anchor", "end")
          .text("Percent of doctor visits for ifluenza-like illness")

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
          if (substr == 2017){
            return "#EC1C24";
          } else {
            return colorScale(+substr);
          }
        })
        .style("stroke-width",function(){
          if (d.key.substring(0,4) == 2017){
            return 5;
          } else {
            return 2;
          }
        })
        .style("opacity",function(){
          if (d.key.substring(0,4) == 2017){
            return 1;
          } else {
            return 0.6;
          }
        })
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
        .attr("y", 15);

    var voronoiGroup = svg.append("g")
      .attr("class", "voronoi");

    voronoiGroup.selectAll("path")
      .data(voronoi.polygons(d3.merge(dataNested.map(function(d) { return d.values; }))))
      .enter().append("path")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    function mouseover(d) {
      d3.select(".id"+d.data["FluYear"]).classed("line-hover", true);
      focus.attr("transform", "translate(" + x(d.data["ConsecWeek"]) + "," + y(d.data["PercentVisits"]) + ")");
      focus.select("text").text(function(){ return d.data["FluYear"]+", week "+d.data["ConsecWeek"]+": "+Math.round(d.data["PercentVisits"]*10)/10+ "%" });
    }

    function mouseout(d) {
      d3.select(".id"+d.data["FluYear"]).classed("line-hover", false);
      focus.attr("transform", "translate(-100,-100)");
      focus.select("text").text("");
    }

    svg.append("text")
      .attr("x", function(d) {
        return x(3);
      })
      .attr("y", function(d) {
        return y(7.9);
      })
      .attr("text-anchor", "start")
      .style("font-size", "13px")
      .text("H1N1 flu of 2009");

    svg.append("text")
      .attr("x", function(d) {
        return x(18);
      })
      .attr("y", function(d) {
        return y(7.8);
      })
      .attr("text-anchor", "start")
      .style("font-size", "13px")
      .text("Current flu season");
}

hoverChart("#bad-year-for-the-flu");

function animatedBarChart(targetID) {

  d3.select(targetID).selectAll("svg").remove();

  // show tooltip
  var bars_tooltip = d3.select("body")
      .append("div")
      .attr("class","bars_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("display", "none")

  // create SVG container for chart components
  // create SVG container for chart components
  if (screen.width > 1400){
    var height = 700 - margin.top - margin.bottom;
    console.log("big desktop")
  } else if (screen.width >= 340 && screen.width <= 1400){
    var height = 500 - margin.top - margin.bottom;
    console.log("medium size");
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    // var width = 340 - margin.left - margin.right;
    var height = 380 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var height = 370 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,maxWidth) - 10 - margin.left - margin.right;
  var svgBars = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xBars = d3.scaleBand()
    .domain(d3.range(19))
    .rangeRound([0, width])
    .padding(0.2);

  var yBars = d3.scaleLinear()
    .domain([0, 5000])
    .range([height, 0]);

  // Define the axes
  svgBars.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xBars).ticks(0))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Week of flu season")

  svgBars.append("g")
      .call(d3.axisLeft(yBars))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Flu strains")

  var successiveBars = ["AH3","AH1N1","Bsum","Other"];

  for (var ss=0; ss<successiveBars.length; ss++){

    // all strains, summed
    svgBars.selectAll("bar")
        .data(fluStrainsThisYear)
      .enter().append("rect")
        .style("fill", function(){
          console.log(ss);
          console.log(colorScale(ss));
          return colorScale(ss);
        })
        .attr("x", function(d) {
          return xBars(+d.WeekNum);
        })
        .attr("width", xBars.bandwidth())
        .attr("y", function(d) {
          if (ss == 0){
            return yBars(+d.Sum);
          } else if (ss == 1){
            return yBars(+d.AH3+d.AH1N1+d.Bsum);
          } else if (ss == 2){
            return yBars(+d.AH3+d.AH1N1);
          } else {
            return yBars(+d.AH3);
          }
        })
        .attr("height", function(d) {
          if (ss == 0){
            return height - yBars(+d.Sum);
          } else if (ss == 1){
            return height - yBars(+d.AH3+d.AH1N1+d.Bsum);
          } else if (ss == 2){
            return height - yBars(+d.AH3+d.AH1N1);
          } else {
            return height - yBars(+d.AH3);
          }
        })
        .on("mouseover", function(d) {
          bars_tooltip.html(`
            <div>Week <b>${d.WeekNum}</b></div>
            <div><b>${formatthousands(d.AH3)}</b> cases of the A (H3) strain</div>
            <div><b>${formatthousands(d.AH1N1)}</b> cases of the A (2009 H1N1) strain</div>
            <div><b>${formatthousands(d.Bsum)}</b> cases of the B strains</div>
            <div><b>${formatthousands(d.Other)}</b> other strains</div>
          `);
          bars_tooltip.style("display", "block");
        })
        .on("mousemove", function(d) {
          if (screen.width <= 480) {
            return bars_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",d3.event.pageX/2+20+"px");
          } else {
            return bars_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return bars_tooltip.style("display", "none");});
  }
}

animatedBarChart("#evolution-of-strains");

function regularBarChart(targetID) {

  d3.select(targetID).select("svg").remove();

  // show tooltip
  var regbars_tooltip = d3.select("body")
      .append("div")
      .attr("class","regularbars_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("display", "none")

  // create SVG container for chart components
  // margin.bottom = 140;
  if (screen.width > 480) {
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    // var width = 340 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var height = 370 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,700) - 10 - margin.left - margin.right;
  var svgBars = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xBarsReg = d3.scaleBand()
    .domain(efficacyByAge.map(function(d) { return d.Age; }))
    .rangeRound([0, width])
    .padding(0.2);

  var yBarsReg = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  // Define the axes
  svgBars.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xBarsReg))
        // .selectAll("text")
        //   .style("text-anchor", "end")
        //   .attr("dx", "-.8em")
        //   .attr("dy", "-.55em")
        //   .attr("transform", "rotate(-65)" )
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Age")

  svgBars.append("g")
      .call(d3.axisLeft(yBarsReg))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("% effectiveness")

    // all strains, summed
    svgBars.selectAll("bar")
        .data(efficacyByAge)
      .enter().append("rect")
        .style("fill", function(){
          console.log(colorScale(1))
          // return colorScale(0.5);
          return "#3182bd";
        })
        .attr("x", function(d) {
          return xBarsReg(d.Age);
        })
        .attr("width", xBarsReg.bandwidth())
        .attr("y", function(d) {
          return yBarsReg(+d.Effectiveness);
        })
        .attr("height", function(d) {
          return height - yBarsReg(+d.Effectiveness);
        })
        .on("mouseover", function(d) {
          regbars_tooltip.html(`
            <div><b>${d.Age}</b></div>
            <div><b>${d.Effectiveness}</b>% effective</div>
          `);
          regbars_tooltip.style("display", "block");
        })
        .on("mousemove", function(d) {
          if (screen.width <= 480) {
            return regbars_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",d3.event.pageX/2+20+"px");
          } else {
            return regbars_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return regbars_tooltip.style("display", "none");});
}

regularBarChart("#efficacy-by-age");

var r = [];

var statementsData = ["Overall, <span class='highlight'>50%</span> of Americans get the flu vaccine each year.","That is <span class='highlight'>46%</span> of men and <span class='highlight'>52%</span> of women.","Americans over the age of 65 are significantly more likely to get vaccinated than younger Americans, at <span class='highlight'>76%</span>.","Teenagers (9-17 years old) are the least likely, at <span class='highlight'>35%</span>.","White Americans are more likely to be vaccinated than black or hispanic Americans."];

function regularBarChartV2(targetID,data,percent) {

  d3.select(targetID).select("svg").remove();

  // show tooltip
  var regbars2_tooltip = d3.select("body")
      .append("div")
      .attr("class","regularbars2_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("display", "none")

  // create SVG container for chart components
  margin.bottom = 180;
  if (screen.width > 480) {
    var height = 630 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    // var width = 340 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var height = 370 - margin.top - margin.bottom;
  }
  if (percent == 0.63) {
    margin.right = 10;
  }
  if (windowWidth > 1200){
    maxWidth_new = 1200*percent;
  } else {
    maxWidth_new = windowWidth*percent;
  }
  var width = maxWidth_new - 10 - margin.left - margin.right;
  var svgBars2 = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xBarsReg2 = d3.scaleBand()
    .domain(data.map(function(d) { return d.Name; }))
    .rangeRound([0, width])
    .padding(0.2);

  var yBarsReg2 = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

  // Define the axes
  svgBars2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xBarsReg2))
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-65)" )
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Vaccine")

  if (percent == 0.63) {
  svgBars2.append("g")
      .call(d3.axisLeft(yBarsReg2))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("% effectiveness")
  } else {
    svgBars2.append("g")
        .call(d3.axisLeft(yBarsReg2))
  }

    // all strains, summed
    svgBars2.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .style("fill", function(d,i){
          if (d.Vaccine == "Influenza") {
            return "#fdae6b";
          } else {
            console.log(i);
            var index = i-20;
            return colorScale2(i);
          }
        })
        .attr("x", function(d) {
          return xBarsReg2(d.Name);
        })
        .attr("width", xBarsReg2.bandwidth())
        .attr("y", function(d) {
          return yBarsReg2(+d.Effectiveness);
        })
        .attr("height", function(d) {
          return height - yBarsReg2(+d.Effectiveness);
        })
        .on("mouseover", function(d) {
          if (d.Note){
            regbars2_tooltip.html(`
              <div><b>${d.Vaccine}</b> Vaccine</div>
              <div><b>${d.Effectiveness}</b>% effective</div>
              <div><b>${d.Note}</b></div>
            `);
          } else {
            regbars2_tooltip.html(`
              <div><b>${d.Vaccine}</b> Vaccine</div>
              <div><b>${d.Effectiveness}</b>% effective</div>
            `);
          }
          regbars2_tooltip.style("display", "block");
        })
        .on("mousemove", function(d) {
          if (screen.width <= 480) {
            return regbars2_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",d3.event.pageX/2+20+"px");
          } else {
            return regbars2_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return regbars2_tooltip.style("display", "none");});
}

var flu_efficacy = efficacyByVaccine.filter(function(d) { return d.Vaccine == "Influenza" });
var other_efficacy = efficacyByVaccine.filter(function(d) { return d.Vaccine != "Influenza" });

regularBarChartV2("#efficacy-by-vaccine-influenza",flu_efficacy, 0.63);
regularBarChartV2("#efficacy-by-vaccine-others",other_efficacy, 0.36);

$(window).resize(function () {
  windowWidth = $(window).width();

  hoverChart("#bad-year-for-the-flu");
  animatedBarChart("#evolution-of-strains");
  regularBarChart("#efficacy-by-age");
  regularBarChartV2("#efficacy-by-vaccine-influenza",flu_efficacy, 0.63);
  regularBarChartV2("#efficacy-by-vaccine-others",other_efficacy, 0.36);

});
