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
            label: "The LUNA price falls 96% in a day, pushing it to less than 10 cents. On May 7, Signs of capital flight from UST: Curve Whale Watching, a bot that monitors and tweets large amounts of swaps, shows an 85 million UST swap for 84.5 million USDC. On May 8, UST dropped to a low of $0.985 on Saturday after a series of large dumps of UST on Terra’s lending protocol Anchor and stablecoin exchange protocol Curve. On May 8, LFG commits to loaning $750 million of BTC to market makers to defend the peg of UST and another $750 million of UST to be used to buy back BTC after volatility subsides. On the same day, Do Kwon Do Kwon jokes his way out of UST’s depegging risk. On May 9, Deposits on the Anchor protocol plunge below $9 billion from $14 billion after UST struggles to recover to $1. ANC, the protocol’s token, fell 35% during the day. And UST loses its $1 peg for the second time and falls to as low as 35 cents. Do Kwon again tweets, “Deploying more capital – steady lads.” On May 10, Claims that UST’s depeg is due to a Soros-esque attack begin to emerge. On May 11, More than half, 58%, of traders place futures bets on higher LUNA prices despite Tuesday’s drop, leading to $63 million in liquidations. LUNA reaches price levels previously seen in August 2021. Value locked on Anchor, Terra’s largest decentralized finance (DeFi) protocol, drops $11 billion over two days. Do Kwon is revealed to be one of the pseudonymous co-founders behind the failed algorithmic stablecoin Basis Cash, CoinDesk reports. After LUNA almost lost all of its token value, The Terra blockchain is halted for the second time at block 7607789 but resumes activity after around nine hours. The Okx and Binance exchanges end trading of Terra tokens after UST loses its dollar peg and LUNA slumps by more than 99%.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "May.12 2022 -- Event 4",
            wrap: 600
        },
        className: "show-bg",
        x: xScale(new Date(1652400000000)),
        y: yScale(parseFloat(0.0012191899563018388)),
        dy: -300,
        dx: -350
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
