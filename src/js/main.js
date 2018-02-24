require("./lib/social"); //Do not delete
var d3 = require("d3");

var windowWidth = $(window).width();
console.log("window width = ");
console.log(windowWidth);

var formatthousands = d3.format(",");

$('a[href^="http"]').not('a[href*=gusdecool]').attr('target','_blank');

// setting sizes of interactive
var margin = {
  top: 15,
  right: 50,
  bottom: 80,
  left: 70
};
if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 20,
    right: 10,
    bottom: 60,
    left: 30
  };
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 20,
    right: 10,
    bottom: 60,
    left: 30
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

var weeknums = [];
for (var i = 40; i <= 52; i++) { weeknums.push(i);}
for (var i = 1; i <= 39; i++) { weeknums.push(i);}

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
  if (screen.width <= 480){
    margin.left = 50;
    margin.right = 30;
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
        .ticks(10)
        .tickFormat(function(d,i){return weeknums[5*(i+1)];}))
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
        .attr("y", function(){
          if (screen.width <= 480){
            return -30;
          } else {
            return -35;
          }
        })
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
          if ((d.key.substring(0,4) == 2017) || (d.key.substring(0,4) == 2009)) {
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

    var voronoiGroup = svg.append("g")
      .attr("class", "voronoi");

    var focus = svg.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
        .attr("id","text1")
        .attr("y", 20)
        .attr("text-anchor", "middle");

    focus.append("text")
        .attr("id","text2")
        .attr("y", 40)
        .attr("text-anchor", "middle");

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
      focus.select("#text1").text(function(){ return d.data["FluYear"]});
      focus.select("#text2").text(function(){ return Math.round(d.data["PercentVisits"]*10)/10+ "%"});
    }

    function mouseout(d) {
      d3.select(".id"+d.data["FluYear"]).classed("line-hover", false);
      focus.attr("transform", "translate(-100,-100)");
      focus.select("text").text("");
    }

    svg.append("text")
      .attr("x", function(d) {
        if (screen.width <= 480){
          return x(3.2);
        } else {
          return x(3);
        }
      })
      .attr("y", function(d) {
        return y(8.1);
      })
      .attr("text-anchor", "start")
      .style("font-size", "13px")
      .text("H1N1 flu of 2009");

    svg.append("text")
      .attr("x", function(d) {
        if (screen.width <= 480){
          return x(18.4);
        } else {
          return x(18);
        }
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
  var successiveBars = ["AH3","AH1N1","Bsum","Other"];

  // show tooltip
  var bars_tooltip = d3.select("body")
      .append("div")
      .attr("class","bars_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("display", "none")

  if (screen.width <= 480) {
    margin.left = 50;
    margin.right = 20;
  }
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
    .domain(d3.range(20))
    .rangeRound([0, width])
    .padding(0.2);

  var yBars = d3.scaleLinear()
    .domain([0, 5000])
    .range([height, 0]);

  var z = d3.scaleBand()
    .domain(d3.range(4))
    .rangeRound([0, xBars.bandwidth()]);

  // Define the axes
  svgBars.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xBars)
        .ticks(19)
        .tickFormat(function(d,i){
          if (screen.width <= 480){
            if (i % 2 == 0){
              return weeknums[i];
            } else {
              return "";
            }
          } else {
            return weeknums[i];
          }
        }))
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

  for (var ss=0; ss<successiveBars.length; ss++){

    // all strains, summed
    svgBars.selectAll("bar")
        .data(fluStrainsThisYear)
      .enter().append("rect")
        .attr("id",function(d){
          return "bar"+ss+"week"+d.WeekNum;
        })
        .style("fill", function(){
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
            <div>Week <b>${d.WEEK}</b></div>
            <div><b>${formatthousands(d.AH3)}</b> cases of the A (H3) strain</div>
            <div><b>${formatthousands(d.AH1N1)}</b> cases of the A (2009 H1N1) strain</div>
            <div><b>${formatthousands(d.Bsum)}</b> cases of the B strains</div>
            <div><b>${formatthousands(d.Other)}</b> cases of other strains</div>
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

  var toggle = "stacked";
  document.getElementById("click-to-see-strains").addEventListener("click", function(e) {
    if (toggle == "stacked"){
      transitionGrouped();
      toggle = "grouped";
    } else {
      transitionStacked();
      toggle = "stacked";
    }
  });

  function transitionGrouped() {

    var rectBars = svgBars.selectAll("rect");

    rectBars.transition()
      .duration(500)
      .delay(function(d, i) { return i * 10; })
      .attr("x", function(d,i) {
        var idnum = this.id.split("bar")[1][0];
        return xBars(d.WeekNum)+z(idnum);
      })
      .attr("width", function(){
        return xBars.bandwidth() / 4;
      })
      .transition()
      .attr("y", function(d) {
        var idnum = this.id.split("bar")[1][0];
        if (idnum == 3){
          return yBars(d.AH3);
        } else if (idnum == 2){
          return yBars(d.AH1N1);
        } else if (idnum == 1){
          return yBars(d.Bsum);
        } else {
          return yBars(d.Other);
        }
      })
      .attr("height", function(d) {
        var idnum = this.id.split("bar")[1][0];
        if (idnum == 3){
          return height - yBars(d.AH3);
        } else if (idnum == 2){
          return height - yBars(d.AH1N1);
        } else if (idnum == 1){
          return height - yBars(d.Bsum);
        } else {
          return height - yBars(d.Other);
        }
      });
  }

  function transitionStacked() {

    var rectBars = svgBars.selectAll("rect");

    rectBars.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) {
          var idnum = this.id.split("bar")[1][0];
          if (idnum == 0){
            return yBars(+d.Sum);
          } else if (idnum == 1){
            return yBars(+d.AH3+d.AH1N1+d.Bsum);
          } else if (idnum == 2){
            return yBars(+d.AH3+d.AH1N1);
          } else {
            return yBars(+d.AH3);
          }
        })
        .attr("height", function(d) {
          var idnum = this.id.split("bar")[1][0];
          if (idnum == 0){
            return height - yBars(+d.Sum);
          } else if (idnum == 1){
            return height - yBars(+d.AH3+d.AH1N1+d.Bsum);
          } else if (idnum == 2){
            return height - yBars(+d.AH3+d.AH1N1);
          } else {
            return height - yBars(+d.AH3);
          }
        })
      .transition()
        .attr("x", function(d) { return xBars(+d.WeekNum); })
        .attr("width", xBars.bandwidth());
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
  margin.top = 40;
  if (screen.width > 480) {
    margin.bottom = 70;
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    margin.bottom = 130;
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    margin.bottom = 130;
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
  if (screen.width <= 480){
    svgBars.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xBarsReg))
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)" )
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 40)
          .attr("fill","black")
          .style("text-anchor", "end")
          .text("Age")
  } else {
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
  }

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
  if (screen.width <= 480){
    margin.bottom = 140;
  } else {
    margin.bottom = 150;
  }
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
    if (screen.width <= 480){
      margin.right = 0;
    } else {
      margin.right = 10;
    }
  }
  if (screen.width <= 480){
    console.log("here");
    margin.left = 30;
  }
  if (windowWidth > 1000){
    maxWidth_new = 1000*percent;
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
          .attr("transform", function(){
            if (screen.width <= 480){
              return "rotate(-90)";
            } else {
              return "rotate(-65)";
            }
          })
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

function dotChart(targetID){

  d3.select(targetID).select("svg").remove();

  if (screen.width <= 480){
    var widthCircles = Math.min(windowWidth*0.9,300) - 10 - margin.left - margin.right;
  } else {
    var widthCircles = Math.min(windowWidth/2,400) - 10 - margin.left - margin.right;
  }
  var heightCircles = widthCircles;
  margin.bottom = 0;
  margin.top = 0;
  margin.right = 10;
  margin.left = 10;

  var svgDots = d3.select(targetID).append("svg")
      .attr("width", widthCircles + margin.left + margin.right)
      .attr("height", heightCircles + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var pack = d3.pack()
      .size([widthCircles, heightCircles])
      .padding(1.5);

  // var demographicData = {[50,50],[46,52],[49,35,41,59,76],[52,40,41,50]};
  var demographicData = [];
  demographicData.push([{name:"Vaccinated",size: 50},{name:"Unvaccinated",size: 50}]);
  demographicData.push([{name:"Men",size: 46},{name:"Women",size: 52}]);
  demographicData.push([{name:"6 mo.s-8 years",size: 49},{name:"9-17 years",size: 35},{name:"18-49 years",size: 41},{name:"50-64 years",size: 59},{name:"Over 65 years",size: 76}]);
  demographicData.push([{name:"White",size: 52},{name:"Black",size: 40},{name:"Hispanic",size:41},{name:"Other",size:50}]);

  var sentenceData = [];
  sentenceData.push("Overall, <span class='highlight'>50%</span> of Americans get the flu vaccine each year.");
  sentenceData.push("That is <span class='highlight'>46%</span> of men and <span class='highlight'>52%</span> of women.");
  sentenceData.push("Older Americans are significantly more likely to get vaccinated. Teenagers are the least likely.");
  sentenceData.push("White Americans are more likely to be vaccinated than black or hispanic Americans.")
  var i = 0;

  var updateInfo = function(sentence) {
    document.querySelector("#sentence").innerHTML = sentence;
  };

  var loop = null;
  var tick = function() {
    drawBubbles(demographicData[i]);
    updateInfo(sentenceData[i]);
    $(".li").removeClass("active");
    for (var li_idx=0; li_idx<=i; li_idx++){
      document.querySelector("#li"+li_idx).classList.add("active");
    }
    i = (i + 1) % demographicData.length;
    loop = setTimeout(tick, i == 0 ? 8000 : 4000);
  };

  tick();

  function drawBubbles(data,dataIDX){

    // transition
    var t = d3.transition()
        .duration(750);

    // hierarchy
    var h = d3.hierarchy({children: data})
        .sum(function(d) { return d.size; })

    //JOIN
    var circle = svgDots.selectAll("circle")
        .data(pack(h).leaves(), function(d){
          return d.data.name;
        });

    var text = svgDots.selectAll("text")
        .data(pack(h).leaves(), function(d){
          return d.data.name;
        });

    //EXIT
    circle.exit()
        .style("fill", colorScale(i))
      .transition(t)
        .attr("r", 1e-6)
        .remove();

    text.exit()
      .transition(t)
        .attr("opacity", 1e-6)
        .remove();

    //UPDATE
    circle
      .transition(t)
        .style("fill", colorScale(i))
        .attr("r", function(d){ return d.r })
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })

    text
      .transition(t)
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; });

    //ENTER
    circle.enter().append("circle")
        .attr("r", 1e-6)
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .style("fill", "#fff")
      .transition(t)
        .style("fill", colorScale(i))
        .attr("r", function(d){ return d.r });

    text.enter().append("text")
        .attr("opacity", 1e-6)
        // .attr("fill","white")
        .attr("x", function(d){ return d.x })
        .attr("y", function(d){
          if (d.data.name == "9-17 years"){
            return d.y-15;
          } else {
            return d.y;
          }
        })
        .attr("text-anchor", "middle")
        .text(function(d){
          return d.data.name+", "+d.data.size+"%";
        })
      .transition(t)
        .attr("opacity", 1);
  }

}

var initialVar = 0;
if (screen.width <= 480){
  offsetvar = 400;
} else {
  offsetvar = 500;
}
$(window).scroll(function(){
  if (initialVar == 0){
    var pos = $(this).scrollTop();
    var top_pos = $("#sentence").offset().top-offsetvar;
    if (pos > top_pos){
      dotChart("#who-gets-the-vaccine");
      initialVar = 1;
    }
  }
});

function groupedBars(targetID){
  d3.select(targetID).selectAll("svg").remove();

  // show tooltip
  var groupedbars_tooltip = d3.select("body")
      .append("div")
      .attr("class","groupedbars_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("display", "none")

  // create SVG container for chart components
  margin.bottom = 50;
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
  margin.left = 50;
  margin.right = 20;
  if (screen.width <= 480){
    margin.bottom = 170;
  }
  var width = Math.min(windowWidth,maxWidth) - 10 - margin.left - margin.right;
  var svgGroupedBars = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xGroupedBars = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1);

  var xGroupedBarsInner = d3.scaleBand()
    .padding(0.05);

  var yGroupedBars = d3.scaleLinear()
    .range([height, 0]);

  xGroupedBars.domain(efficacyOther.map(function(d){return d.Averted;}));

  xGroupedBarsInner.domain(efficacyOther.map(function(d){return d.Age;})).rangeRound([0, xGroupedBars.bandwidth()]);
  yGroupedBars.domain([0,d3.max(efficacyOther,function(d){return d.Count/1000000;})]);

  // Define the axes
  if (screen.width <= 480){
    svgGroupedBars.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xGroupedBars))
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)" )
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 40)
          .attr("fill","black")
          .style("text-anchor", "end")
  } else {
    svgGroupedBars.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xGroupedBars))
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 40)
          .attr("fill","black")
          .style("text-anchor", "end")
  }

  svgGroupedBars.append("g")
      .call(d3.axisLeft(yGroupedBars))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Number of cases (M)")

  svgGroupedBars.selectAll(".bar")
      .data(efficacyOther)
      .enter().append("rect")
      .attr("x", function(d,i) {return (xGroupedBars(d.Averted)+xGroupedBarsInner(d.Age)); })
      .attr("y", function(d) {
        if (d.Count < 5000){
          return yGroupedBars(d.Count/1000000+0.01);
        } else {
          return yGroupedBars(d.Count/1000000);
        }
      })
      .attr("width",xGroupedBarsInner.bandwidth())
      .attr("height", function(d) {
        if (d.Count < 5000){
          return height - yGroupedBars(d.Count/1000000+0.01);
        } else {
          return height - yGroupedBars(d.Count/1000000);
        }
      })
      .attr("fill", function(d,i) {
        return colorScale(d.ColorIdx);
      })
      .on("mouseover", function(d) {
        groupedbars_tooltip.html(`
          <div><b>Age: ${d.Age}</b></div>
          <div><b>${formatthousands(d.Count)} ${d.Averted.toLowerCase()}</b></div>
        `);
        groupedbars_tooltip.style("display", "block");
      })
      .on("mousemove", function(d) {
        if (screen.width <= 480) {
          return groupedbars_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",d3.event.pageX/2+20+"px");
        } else {
          return groupedbars_tooltip
            .style("top", (d3.event.pageY+20)+"px")
            .style("left",(d3.event.pageX-80)+"px");
        }
      })
      .on("mouseout", function(){return groupedbars_tooltip.style("display", "none");});
}

groupedBars("#other-efficacy");

function deathsBarChart(targetID) {

  d3.select(targetID).select("svg").remove();

  // show tooltip
  var deaths_tooltip = d3.select("body")
      .append("div")
      .attr("class","deaths_tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("display", "none")

  // create SVG container for chart components
  // margin.bottom = 140;
  margin.top = 40;
  margin.bottom = 110;
  if (screen.width > 480) {
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    // margin.bottom = 120;
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    // margin.bottom = 120;
    var height = 370 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,700) - 10 - margin.left - margin.right;
  var svgD = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xBarsD = d3.scaleBand()
    .domain(deaths.map(function(d) { return d.Week; }))
    .rangeRound([0, width])
    .padding(0.2);

  var yBarsD = d3.scaleLinear()
    .domain([0, 50])
    .range([height, 0]);

  // Define the axes
  // if (screen.width <= 480){
    svgD.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xBarsD))
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)" )
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 40)
          .attr("fill","black")
          .style("text-anchor", "end")
          .text("Week")
  // } else {
  //   svgD.append("g")
  //       .attr("transform", "translate(0," + height + ")")
  //       .call(d3.axisBottom(xBarsD))
  //         // .selectAll("text")
  //         //   .style("text-anchor", "end")
  //         //   .attr("dx", "-.8em")
  //         //   .attr("dy", "-.55em")
  //         //   .attr("transform", "rotate(-65)" )
  //       .append("text")
  //         .attr("class", "label")
  //         .attr("x", width)
  //         .attr("y", 40)
  //         .attr("fill","black")
  //         .style("text-anchor", "end")
  //         .text("Week")
  // }

  svgD.append("g")
      .call(d3.axisLeft(yBarsD))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Number of deaths")

    // all strains, summed
    svgD.selectAll("bar")
        .data(deaths)
      .enter().append("rect")
        .style("fill", function(){
          return "#3182bd";
        })
        .attr("x", function(d) {
          return xBarsD(d.Week);
        })
        .attr("width", xBarsD.bandwidth())
        .attr("y", function(d) {
          return yBarsD(+d.Deaths);
        })
        .attr("height", function(d) {
          return height - yBarsD(+d.Deaths);
        })
        .on("mouseover", function(d) {
          deaths_tooltip.html(`
            <div><b>${d.Week}</b></div>
            <div><b>${d.Deaths}</b> deaths</div>
          `);
          deaths_tooltip.style("display", "block");
        })
        .on("mousemove", function(d) {
          if (screen.width <= 480) {
            return deaths_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",d3.event.pageX/2+20+"px");
          } else {
            return deaths_tooltip
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return deaths_tooltip.style("display", "none");});
}

deathsBarChart("#deaths");

$(window).resize(function () {
  windowWidth = $(window).width();

  hoverChart("#bad-year-for-the-flu");
  animatedBarChart("#evolution-of-strains");
  regularBarChart("#efficacy-by-age");
  regularBarChartV2("#efficacy-by-vaccine-influenza",flu_efficacy, 0.63);
  regularBarChartV2("#efficacy-by-vaccine-others",other_efficacy, 0.36);
  dotChart("#who-gets-the-vaccine");
  groupedBars("#other-efficacy");
  deathsBarChart("#deaths");

});
