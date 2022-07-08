async function init() {
    const data = await d3.json('data/market_chart.json');
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;
    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('width', width + margin['left'] + margin['right'])
        .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
        .attr('transform', `translate(${margin['left']},  ${margin['top']})`);
    // find data range
    const xMin = new Date(2019, 5, 8)
    const xMax = new Date(2022, 7, 6)

    // scales for the charts
    const xScale = d3
        .scaleTime()
        .domain([xMin, xMax])
        .range([0, width]);
    const yScale = d3
        .scaleLinear()
        .domain([0, 119.18])
        .range([height, 0]);
    // create the axes component
    svg
        .append('g')
        .attr('id', 'xAxis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    svg
        .append('g')
        .attr('id', 'yAxis')
        .attr('transform', `translate(${width}, 0)`)
        .call(d3.axisRight(yScale));
    let line = d3
        .line()
        .x(d => {
            return xScale(new Date(d[0]));
        })
        .y(d => {
            return yScale(parseFloat(d[1]));
        });
    // Append the path and bind data
    svg
        .append('path')
        .data([data.prices])
        .style('fill', 'none')
        .attr('id', 'priceChart')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1.5')
        .attr('d', line);

    // renders x and y crosshair
    const focus = svg
        .append('g')
        .attr('class', 'focus')
        .style('display', 'none');
    focus.append('circle').attr('r', 4.5);
    focus.append('line').classed('x', true);
    focus.append('line').classed('y', true);
    svg
        .append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', () => focus.style('display', null))
        .on('mouseout', () => focus.style('display', 'none'))
        .on('mousemove', e => generateCrosshair(e));
    d3.select('.overlay').style('fill', 'none');
    d3.select('.overlay').style('pointer-events', 'all');
    d3.selectAll('.focus line').style('fill', 'none');
    d3.selectAll('.focus line').style('stroke', '#67809f');
    d3.selectAll('.focus line').style('stroke-width', '1.5px');
    d3.selectAll('.focus line').style('stroke-dasharray', '3 3');

    const bisectDate = d3.bisector(d => new Date(d[0])).left;
    function generateCrosshair(event) {
        //returns corresponding value from the domain
        const correspondingDate = xScale.invert(d3.pointer(event)[0]);
        //gets insertion point
        const i = bisectDate(data.prices, correspondingDate, 1);
        const d0 = data.prices[i - 1];
        const d1 = data.prices[i];
        const currentPoint = correspondingDate - new Date(d0[0]) > new Date(d1[0]) - correspondingDate ? d1 : d0;

        focus.attr('transform', `translate(${xScale(new Date(currentPoint[0]))},     ${yScale(parseFloat(currentPoint[1]))})`);
        focus
            .select('line.x')
            .attr('x1', 0)
            .attr('x2', width - xScale(new Date(currentPoint[0])))
            .attr('y1', 0)
            .attr('y2', 0);
        focus
            .select('line.y')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height - yScale(currentPoint[1]));
        updateLegends(i);
    }
    const updateLegends = index => {
        const price = parseFloat(data.prices[index][1])
        const market_cap = parseFloat(data.market_caps[index][1])
        const volume = parseFloat(data.total_volumes[index][1])
        const date = new Date(data.prices[index][0])
        d3.selectAll('.lineLegend').remove();
        const legendKeys = ["date", "price", "market cap", "volume"]
        const lineLegend = svg
            .selectAll('.lineLegend')
            .data(legendKeys)
            .enter()
            .append('g')
            .attr('class', 'lineLegend')
            .attr('transform', (d, i) => {
                return `translate(0, ${i * 20})`;
            });
        lineLegend
            .append('text')
            .text(d => {
                if (d === 'date') {
                    return `${d}: ${date.toLocaleDateString()}`;
                } else if (d === 'price') {
                    return `${d}: ${price.toFixed(10)}`;
                } else if (d === 'market cap') {
                    return `${d}: ${market_cap.toFixed(10)}`;
                } else if (d === 'volume') {
                    return `${d}: ${volume.toFixed(10)}`;
                } else {
                    return `${d}: unknown?`;
                }
            })
            .style('fill', 'black')
            .attr('transform', 'translate(15,9)');
    };

    const annotations = [{
        //below in makeAnnotations has type set to d3.annotationLabel
        //you can add this type value below to override that default
        type: d3.annotationCallout,
        note: {
            label: "LFG continued to purchase billion dollars worth of BTC, Do Kown and other influential crypto investor tweeted to push the LUNA price to all time high. the Luna Foundation Guard’s (LFG) bitcoin wallet address purchased more than 27,000 BTC worth roughly $1.3 billion. The foundation is delivering on its month-old promise to add BTC as an additional layer of security for UST, which is Terra's decentralized dollar-pegged stablecoin. Do Kwon, the foundation's director, confirmed the address to Bitcoin Magazine in an email, which was also marked by OKLink, a blockchain information website. There appears to be a synergy between bitcoin and the Terra ecosystem, according to Lucas Outumuro, head of research at IntoTheBlock, a crypto data company. UST benefits from having additional backing and bitcoin benefits not just from the buying pressure, but also from having a stable medium of exchange backed by BTC, Outumuro wrote in an email to CoinDesk. On March 23, Do Kwon tweets “By my hand DAI will die” as he begins in earnest plans to starve off decentralized stablecoin DAI’s liquidity on Curve. On March 29, March 29: Kyle Davies, co-founder of influential trading firm Three Arrows Capital, tweets, “Grandpa, what was the world like when $LUNA was less than three digits?”",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Mar-Apr 2022 -- Event3",
            wrap: 500
        },
        className: "show-bg",
        x: xScale(new Date(1646956800000)),
        y: yScale(parseFloat(101.31585398716065)),
        dy: 50,
        dx: -250
    }].map(function (d) { d.color = "#E8336D"; return d })

    const makeAnnotations = d3.annotation()
        .editMode(true)
        .notePadding(15)
        .type(d3.annotationLabel)
        .annotations(annotations)
    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations)



}
