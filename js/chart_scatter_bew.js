
function scene(make) {
    // Get current browser window dimensions
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x_size = w.innerWidth || e.clientWidth || g.clientWidth,
        y_size = w.innerHeight || e.clientHeight || g.clientHeight;

    // Set canvas and chart dimensions
    const width = 0.85 * x_size;
    const height = (0.5 * x_size < 0.62 * y_size) ? 0.5 * x_size : 0.62 * y_size;
    const canvas = { width: width, height: height };
    const margin = { left: 65, right: 52, top: 12, bottom: 36 };
    const chart = {
        width: canvas.width - (margin.right + margin.left),
        height: canvas.height - (margin.top + margin.bottom)
    };

    var scatterDiv = document.getElementById("scatterDivId");
    scatterDiv.innerHTML = "";

    document.getElementById("bh").style.visibility = 'hidden';
    document.getElementById("bs").style.visibility = 'hidden';

    // in element scatterDivId, add svg
    var svg = d3.select("#scatterDivId")
        .append("svg")
        .attr("width", canvas.width)
        .attr("height", canvas.height)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Load data
    d3.csv('data/cars2017.csv', function(error, data) {
        if (error) throw error;

        const makeMap = new Map()
        data.forEach(data => {
            const currentMake = data.Make;
            if (!makeMap.has(currentMake)){
                makeMap.set(currentMake, new Array())
            }
            makeList = makeMap.get(currentMake);
            makeList.push(data)
            makeMap.set(currentMake, makeList)
        })

        // const container = document.getElementById('makeDivId');
        // for (key of makeMap) {
        //     const MakeLink = document.createElement('a');
        //     MakeLink.href = 'javascript:void(0);'; // 不跳转
        //     MakeLink.className = 'make';
        //     MakeLink.textContent = key[0];
        //     MakeLink.addEventListener('click', (function(k) {
        //         return function() {
        //             alert(`You clicked on year: ${k}`);
        //         };
        //     })(key[0]));
        //     container.appendChild(MakeLink);
        // }

        console.log(makeMap.get(make))
        console.log(make)
        data = makeMap.get(make)

        var fuels = getFuelsList(data);

        // Domain scale x and y and color
        var x = d3.scaleLog().base(10).domain([2, 12]).range([0, chart.width]);
        console.log(x)
        var y = d3.scaleLinear().domain([1, 150]).range([chart.height, 0]);
        var c = d3.scaleOrdinal()
            .domain(["Gasoline", "Electricity", 'Diesel'])
            .range(["#0069b3ff", "#f07d20ff", "#00963fff"]);


        // Add Tooltip and customize action
        var tooltip = d3.select("#scatterDivId")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var mouseOver = function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.8);

            tooltip.html(getTooltipInfo(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        };

        // Add Mouse events
        var mouseOn = function(d) {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 30) + "px");
        };

        var mouseLeave = function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        };

        // Set axis tick
        var xAxis = d3.axisBottom(x)
            .tickValues([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            .tickFormat(d3.format('d'));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .transition().duration(1500)
            .call(xAxis);

        var yAxis = d3.axisLeft(y)
            .tickValues([1, 20, 40, 60, 80, 100, 120, 140, 150])
            .tickFormat(d3.format(',.2r'));

        svg.append("g")
            .attr("class", "y axis")
            .transition().duration(1500)
            .call(yAxis);

        // Add X and Y labels
        svg.append('g')
            .attr('transform', 'translate(' + (chart.width / 2) + ', ' + (chart.height + 32) + ')')
            .append('text')
            .style("opacity", 0).transition().duration(2000).style("opacity", 1)
            .attr("class", "x label")
            .attr('text-anchor', 'middle')
            .text("EngineCylinders");

        svg.append('g')
            .attr('transform', 'translate(' + (-margin.left + 15) + ', ' + (chart.height / 2 + margin.top) + ')')
            .append('text')
            .attr("class", "y label")
            .attr('text-anchor', 'middle')
            .attr("transform", "rotate(-90)")
            .text("AverageHighwayMPG")
            .style("opacity", 0).transition().duration(2000).style("opacity", 1);

        // Add circles
        console.log(data)
        var dots = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "datapoints")
            .attr("cx", 0)
            .attr("cy", (chart.height))
            .attr("r", 0)
            .style("fill", function(d) { return c(d.Fuel); })
            .style("opacity", 0.8);

        // Set radius
        dots.transition()
            .delay(750)
            .duration(2000)
            .attr("r", function(d) { return 13; })
            .attr("cx", function(d) { return x(parseInt(d.EngineCylinders, 10)); })
            .attr("cy", function(d) { return y(parseInt(d.AverageHighwayMPG, 10)); });


        // Add mouse events
        dots.on("mouseover", mouseOver)
            .on("mousemove", mouseOn)
            .on("mouseleave", mouseLeave);


        // Add color legend
        var colorLegend = svg.selectAll("colorlegend")
            .data(fuels)
            .enter().append("g")
            .attr("class", "colorlegend")
            .attr("transform", function(d, i) {
                return "translate(0," + (10 + i * 20) + ")";
            });

        colorLegend.append("circle")
            .attr("cx", chart.width - 8)
            .attr("r", 7)
            .style("fill", function(d) { return c(d); })
            .style("stroke-width", 0)
            .on("mouseover", filterFuel)
            .on("mouseout", filterFuelOff)
            .style("opacity", 0).transition().delay(1500).duration(2000).style("opacity", 0.8);

        colorLegend.append("text")
            .attr("x", chart.width - 20)
            .attr("y", 0)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .on("mouseover", filterFuel)
            .on("mouseout", filterFuelOff)
            .text(function(d) { return d; })
            .style("fill-opacity", 0).transition().delay(2000).duration(2000).style("fill-opacity", 0.7);


        // Add annotations (Hints)
        var xAnnotation = chart.width / 2;
        var yAnnotation = -3;
        svg.append("text")
            .attr("x", xAnnotation)
            .attr("y", yAnnotation)
            .attr("class", "annotation")
            .style("text-anchor", "middle")
            .text("Tip 1: hover over the circle for more details; Tip 2: hover over the color legend to filter fuel type")
            .style('opacity', 0);

    });


    function getFuelsList(data) {
        let set = new Set()
        data.forEach(data => {
            set.add(data.Fuel)
        })
        return Array.from(set)
    }

    function getTooltipInfo(d) {
        let htmlInfo;

        htmlInfo = "<b>Make:</b> " + d.Make + '<br>' +
            "&emsp;&#8226;<b>&emsp;Fuel:</b> " + d.Fuel +'<br>' +
            "&emsp;&#8226;<b>&emsp;Engine Cylinders:</b> " + d.EngineCylinders +'<br>' +
            "&emsp;&#8226;<b>&emsp;Average Highway MPG:</b> " + d.AverageHighwayMPG +'<br>' +
            "&emsp;&#8226;<b>&emsp;Average City MPG:</b> " + d.AverageCityMPG +'<br>'

        return htmlInfo;
    }

    function filterFuel(d) {
        svg.selectAll('.datapoints')
            .filter(function(data) {
                return (data.Fuel != d);
            })
            .transition()
            .style('opacity', 0.04);
    }

    function filterFuelOff(d) {
        svg.selectAll('.datapoints')
            .transition()
            .style('opacity', 0.8);
    }
}
