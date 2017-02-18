var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var parseTime = d3.timeParse("%Y%m%d");

var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.numero); })
    .y(function(d) { return y(d.quantidade); });

d3.csv("saida4.csv", function(error, data) {
    if (error) throw error;

    console.log(data);

    cities = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {
                return {numero: +d.Numero, quantidade: +d[id]};
            })
        };
    });

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    console.log(cities);

    x.domain(d3.extent(data, function(d) { return d.Numero; }));

    y.domain([
        0,
        d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.quantidade; }); })
    ]);

    z.domain(cities.map(function(c) { return c.id; }));

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("dx", width - margin.bottom)
        .attr("dy", "-0.71em")
        .attr("fill", "#000")
        .text("Quantidade");

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Quantidade");

    var city = g.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return z(d.id); })
        .on("mouseover", function(d) {
            div.style("opacity", .9);
            div.html(d.id)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    city.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.numero) + "," + y(d.value.quantidade) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.id; });
});

