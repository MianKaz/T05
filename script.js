// Load the CSV files, then draw one chart for each dataset.
Promise.all([
  d3.csv("chart/data/Ex5_ARE_Spot_Prices.csv"),
  d3.csv("chart/data/Ex5_TV_energy_Allsizes_byScreenType.csv"),
  d3.csv("chart/data/Ex5_TV_energy_55inchtv_byScreenType.csv"),
  d3.csv("chart/data/Ex5_TV_energy.csv")
])
  .then(([prices, allSizes, size55, televisions]) => {
    drawPriceChart(prices);
    drawEnergyChart(allSizes, size55);
    drawScatterChart(televisions);
    drawTechnologyChart(televisions);
  })
  .catch(error => {
    console.error("Could not load the chart data:", error);
    const message = document.createElement("p");
    message.className = "error";
    message.textContent = "Could not load the CSV files. Check the data folder and your internet connection.";
    document.querySelector("#charts").prepend(message);
  });

// Draw a line for each region in the electricity price dataset.
function drawPriceChart(data) {
  const svg = d3.select("#price-chart");
  const margin = { top: 10, right: 20, bottom: 40, left: 60 };
  const width = 760;
  const height = 360;
  const year = d => +d.Year;
  const regionNames = Object.keys(data[0]).filter(name =>
    name !== "Year" && !name.startsWith("Average")
  );
  const colors = d3.scaleOrdinal()
    .domain(regionNames)
    .range(["#368b78", "#e19a52", "#688db0", "#b66c73", "#846ca8", "#758b44"]);

  // Scales translate data values into positions on the SVG.
  const x = d3.scaleLinear()
    .domain(d3.extent(data, year))
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain([0, 200])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(""));
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(7));
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));

  const line = d3.line()
    .defined(d => d.value !== "")
    .x(d => x(year(d)))
    .y(d => y(+d.value));

  // Each line is one region; blank CSV values become gaps in the line.
  regionNames.forEach(region => {
    const regionData = data.map(row => ({ Year: row.Year, value: row[region] }));
    svg.append("path")
      .datum(regionData)
      .attr("fill", "none")
      .attr("stroke", colors(region))
      .attr("stroke-width", 2)
      .attr("d", line);

    d3.select("#price-legend")
      .append("span")
      .html(`<i class="swatch" style="background:${colors(region)}"></i>${region.replace(" ($ per megawatt hour)", "")}`);
  });
}

// Compare the two supplied averages with a grouped bar chart.
function drawEnergyChart(allSizes, size55) {
  const svg = d3.select("#energy-chart");
  const margin = { top: 10, right: 20, bottom: 45, left: 55 };
  const width = 760;
  const height = 360;
  const types = allSizes.map(row => row.Screen_Tech);
  const series = [
    { name: "All sizes", data: allSizes, color: "#368b78" },
    { name: "55-inch TVs", data: size55, color: "#e19a52" }
  ];

  const x = d3.scaleBand()
    .domain(types)
    .range([margin.left, width - margin.right])
    .padding(0.25);
  const xSeries = d3.scaleBand()
    .domain(series.map(d => d.name))
    .range([0, x.bandwidth()])
    .padding(0.08);
  const y = d3.scaleLinear()
    .domain([0, 600])
    .range([height - margin.bottom, margin.top]);
  const valueColumn = "Mean(Labelled energy consumption (kWh/year))";

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickSize(-width + margin.left + margin.right).tickFormat(""));
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(6));

  // Each technology gets two bars, one from each summary dataset.
  series.forEach(group => {
    svg.selectAll(`.bar-${group.name.replaceAll(" ", "-")}`)
      .data(group.data)
      .join("rect")
      .attr("x", d => x(d.Screen_Tech) + xSeries(group.name))
      .attr("y", d => y(+d[valueColumn]))
      .attr("width", xSeries.bandwidth())
      .attr("height", d => y(0) - y(+d[valueColumn]))
      .attr("fill", group.color)
      .append("title")
      .text(d => `${group.name}: ${Math.round(+d[valueColumn])} kWh/year`);
  });
}

// Plot screen size on the x-axis and energy use on the y-axis.
function drawScatterChart(data) {
  const svg = d3.select("#scatter-chart");
  const margin = { top: 10, right: 20, bottom: 45, left: 55 };
  const width = 760;
  const height = 360;
  const x = d3.scaleLinear()
    .domain([20, 80])
    .range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain([0, 800])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-width + margin.left + margin.right).tickFormat(""));
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6));
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5));
  svg.append("text")
    .attr("class", "legend-label")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .text("Screen size (inches)");
  svg.append("text")
    .attr("class", "legend-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("Energy use (kWh/year)");

  // A circle marks each TV row in the original dataset.
  svg.selectAll("circle")
    .data(data.filter(d => d.screensize && d.energy_consumpt))
    .join("circle")
    .attr("cx", d => x(+d.screensize))
    .attr("cy", d => y(+d.energy_consumpt))
    .attr("r", 3)
    .attr("fill", "#368b78")
    .attr("opacity", 0.55)
    .append("title")
    .text(d => `${d.brand}, ${d.screen_tech}: ${d.screensize}" — ${d.energy_consumpt} kWh/year`);
}

// Add up the TV counts for each screen technology and show their shares.
function drawTechnologyChart(data) {
  const totals = Array.from(
    d3.rollup(data, rows => d3.sum(rows, d => +d.count), d => d.screen_tech),
    ([technology, count]) => ({ technology, count })
  );
  const colors = d3.scaleOrdinal()
    .domain(totals.map(d => d.technology))
    .range(["#368b78", "#e19a52", "#688db0", "#b66c73"]);
  const svg = d3.select("#technology-chart");
  const group = svg.append("g").attr("transform", "translate(200,160)");
  const arc = d3.arc().innerRadius(58).outerRadius(110);
  const pie = d3.pie().value(d => d.count);

  group.selectAll("path")
    .data(pie(totals))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => colors(d.data.technology))
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .append("title")
    .text(d => `${d.data.technology}: ${d.data.count} TVs`);

  const totalCount = d3.sum(totals, d => d.count);
  const legend = d3.select("#technology-legend");
  totals.forEach(item => {
    const share = Math.round(item.count / totalCount * 100);
    legend.append("span")
      .html(`<i class="swatch" style="background:${colors(item.technology)}"></i>${item.technology}: ${share}%`);
  });
}