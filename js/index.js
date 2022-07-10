async function init() {
    const data = await d3.json('data/market_chart.json');
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const headerHeight = document.querySelector('#header').clientHeight
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom - headerHeight - margin['top'];

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

    let showHighlightedEvent = false;
    let currentAnnotationIndex = -1;

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

    const getPricesBeforeAnnotation = annotationIndex => {
        if (annotationIndex < 0) {
            return [];
        }
        let annotation = annotations[annotationIndex]
        const date = xScale.invert(annotation.x)

        const datesFromPrices = data.prices.map((x) => x[0])
        const priceIndex = datesFromPrices.indexOf(date.getTime())

        let ret = data.prices.slice(0, priceIndex + 1)
        return ret
    };

    const annotations = [{
        type: d3.annotationCallout,
        note: {
            label: "A South Korean crypto exchange launches the first LUNA staking product",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Feb.24 2020",
            wrap: 190
        },
        className: "show-bg",
        x: xScale(new Date(1582588800000)),
        y: yScale(parseFloat(0.24526159357715532)),
        dy: -100,
        dx: -100,
    }, {
        type: d3.annotationCallout,
        note: {
            label: "UST, the Terra blockchain's stablecoin, is publicly announced, with plans to launch on the Ethereum and Solana networks.",
            bgPadding: { "top": 15, "left": 10, "right": 15, "bottom": 10 },
            title: "Sept.21 2020",
            wrap: 190
        },
        className: "show-bg",
        x: xScale(new Date(1600732800000)),
        y: yScale(parseFloat(0.28865689959065377)),
        dy: -100,
        dx: -100
    }, {
        type: d3.annotationCallout,
        note: {
            label: "After hitting its all time high, the price drop sharply after U.S. Securities and Exchange Commission subpoenas Terraform Labs founder Do Kwon.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Sept.21 2021 -- Event 1",
            wrap: 190
        },
        className: "show-bg",
        x: xScale(new Date(1632268800000)),
        y: yScale(parseFloat(24.94675830843755)),
        dy: -100,
        dx: -175
    }, {
        type: d3.annotationCallout,
        note: {
            label: "LUNA's price nearly hit 100, extending a four-month winning trend and decoupling from the weak trend in other top coins.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Dec.22 2021",
            wrap: 200
        },
        className: "show-bg",
        x: xScale(new Date(1640563200000)),
        y: yScale(parseFloat(99.91986954719897)),
        dy: 50,
        dx: -100
    }, {
        type: d3.annotationCallout,
        note: {
            label: "Luna Foundation Guard launches, raising $1 billion to buy Bitcoin for UST's reserve system.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Feb.22 2022 -- Event 2",
            wrap: 160
        },
        className: "show-bg",
        x: xScale(new Date(1645574400000)),
        y: yScale(parseFloat(54.66896323920333)),
        dy: 130,
        dx: -2
    }, {
        type: d3.annotationCallout,
        note: {
            label: "LFG continued to purchase billion dollars worth of Bitcoin as LUNA price pushes to all time highs.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Mar-Apr 2022 -- Event 3",
            wrap: 190
        },
        className: "show-bg",
        x: xScale(new Date(1646956800000)),
        y: yScale(parseFloat(101.31585398716065)),
        dy: -5,
        dx: -5
    }, {

        type: d3.annotationCallout,
        note: {
            label: "The LUNA price falls 96% in a day, pushing it to less than 10 cents.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "May.12 2022 -- Event 4",
            wrap: 100
        },
        className: "show-bg",
        x: xScale(new Date(1652400000000)),
        y: yScale(parseFloat(0.0012191899563018388)),
        dy: -100,
        dx: 0
    }].map(function (d) { d.color = "#444444"; return d })

    const highlightedAnnotations = [{
        type: d3.annotationCallout,
        note: {
            label: "After hitting its all time high, the price dropped sharply after U.S. Securities and Exchange Commission subpoenas Terraform Labs founder Do Kwon. At issue is Terra's Mirror Protocol, a decentralized finance (DeFi) platform on which synthetic stocks mirroring the price of major U.S. firms are minted and traded. The subpoena requests that Kwon provide testimony to U.S. regulators. As a resident of South Korea, Kwon is contesting the subpoena. Terraform's lawsuit against the SEC is unusual but, according to Anderson Kill lawyer Stephen Palley, preemptive legal action might make sense in this case. The SEC told Terraform's lawyers the U.S. regulator might sue the company. “In a conversation on September 15, 2021, the SEC attorneys advised that they believe that some sort of enforcement action was warranted against TFL [Terraform Labs] and any cooperation, and implementation of remedial actions as to the Mirror Protocol, would result in a reduced financial sanction as part of any consent agreement,” according to the lawsuit. Five days later, Kwon was served. “The subpoenas were served on Mr. Kwon in public: Mr. Kwon was approached by the process server as he exited an escalator at the Mainnet Summit while on his way to make a scheduled presentation that was not about the Mirror Protocol,” the suit said.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Sept.21 2021 -- Event 1",
            wrap: 500
        },
        className: "show-bg",
        x: xScale(new Date(1632268800000)),
        y: yScale(parseFloat(24.94675830843755)),
        dy: -100,
        dx: -100
    }, {
        type: d3.annotationCallout,
        note: {
            label: "After Do Kwon announced the launch of Luna Foundation Guard, it raised $1 billion through the sale of LUNA tokens to buy Bitcoin for UST's reserve system with Jump Crypto and Three Arrows Capital as lead investors. The Luna Foundation Guard (LFG), a non-profit organization based in Singapore, has announced its formation and mission objective to support and sustain the growth and development of open-source technology, facilitating the realization of a decentralized economy. The entity, whose first prerogative is to focus on building reserves to better safeguard the UST peg during adverse market conditions, and second, allocating grants funding the development of the Terra ecosystem. LFG received an initial gift allocation of 50 million LUNA from Terraform Labs (TFL) to launch its intended initiatives. The funding will go toward building a bitcoin-denominated foreign-exchange reserve for UST, an algorithmic-based stablecoin in the Terra ecosystem, according to a statement.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Feb.22 2022 -- Event 2",
            wrap: 500
        },
        className: "show-bg",
        x: xScale(new Date(1645574400000)),
        y: yScale(parseFloat(54.66896323920333)),
        dy: -100,
        dx: -200
    }, {
        type: d3.annotationCallout,
        note: {
            label: "LFG continued to purchase billion dollars worth of BTC, Do Kown and other influential crypto investor tweeted to push the LUNA price to all time high. the Luna Foundation Guard’s (LFG) bitcoin wallet address purchased more than 27,000 BTC worth roughly $1.3 billion. The foundation is delivering on its month-old promise to add BTC as an additional layer of security for UST, which is Terra's decentralized dollar-pegged stablecoin. Do Kwon, the foundation's director, confirmed the address to Bitcoin Magazine in an email, which was also marked by OKLink, a blockchain information website. There appears to be a synergy between bitcoin and the Terra ecosystem, according to Lucas Outumuro, head of research at IntoTheBlock, a crypto data company. UST benefits from having additional backing and bitcoin benefits not just from the buying pressure, but also from having a stable medium of exchange backed by BTC, Outumuro wrote in an email to CoinDesk. On March 23, Do Kwon tweets “By my hand DAI will die” as he begins in earnest plans to starve off decentralized stablecoin DAI’s liquidity on Curve. On March 29, March 29: Kyle Davies, co-founder of influential trading firm Three Arrows Capital, tweets, “Grandpa, what was the world like when $LUNA was less than three digits?”",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "Mar-Apr 2022 -- Event 3",
            wrap: 500
        },
        className: "show-bg",
        x: xScale(new Date(1646956800000)),
        y: yScale(parseFloat(101.31585398716065)),
        dy: 50,
        dx: -250
    }, {
        type: d3.annotationCallout,
        note: {
            label: "The LUNA price falls 96% in a day, pushing it to less than 10 cents. On May 7, signs of capital flight from UST: Curve Whale Watching, a bot that monitors and tweets large amounts of swaps, shows an 85 million UST swap for 84.5 million USDC. On May 8, UST dropped to a low of $0.985 on Saturday after a series of large dumps of UST on Terra’s lending protocol Anchor and stablecoin exchange protocol Curve. On May 8, LFG commits to loaning $750 million of BTC to market makers to defend the peg of UST and another $750 million of UST to be used to buy back BTC after volatility subsides. On the same day, Do Kwon Do Kwon jokes his way out of UST’s depegging risk. On May 9, Deposits on the Anchor protocol plunge below $9 billion from $14 billion after UST struggles to recover to $1. ANC, the protocol’s token, fell 35% during the day. And UST loses its $1 peg for the second time and falls to as low as 35 cents. Do Kwon again tweets, “Deploying more capital – steady lads.” On May 10, Claims that UST’s depeg is due to a Soros-esque attack begin to emerge. On May 11, More than half, 58%, of traders place futures bets on higher LUNA prices despite Tuesday’s drop, leading to $63 million in liquidations. LUNA reaches price levels previously seen in August 2021. Value locked on Anchor, Terra’s largest decentralized finance (DeFi) protocol, drops $11 billion over two days. Do Kwon is revealed to be one of the pseudonymous co-founders behind the failed algorithmic stablecoin Basis Cash, CoinDesk reports. After LUNA almost lost all of its token value, The Terra blockchain is halted for the second time at block 7607789 but resumes activity after around nine hours. The Okx and Binance exchanges end trading of Terra tokens after UST loses its dollar peg and LUNA slumps by more than 99%.",
            bgPadding: { "top": 15, "left": 10, "right": 10, "bottom": 10 },
            title: "May.12 2022 -- Event 4",
            wrap: 600
        },
        className: "show-bg",
        x: xScale(new Date(1652400000000)),
        y: yScale(parseFloat(0.0012191899563018388)),
        dy: -300,
        dx: -350
    }].map(function (d) { d.color = "#444444"; return d })


    renderChart = () => {
        svg.select('#priceChart').remove()
        // Append the path and bind data
        svg
            .append('path')
            .data([getPricesBeforeAnnotation(currentAnnotationIndex)])
            .style('fill', 'none')
            .attr('id', 'priceChart')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', '1.5')
            .attr('d', line);
    }

    renderChart()

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
        .on('mouseover', () => {
            if (currentAnnotationIndex >= 0) {
                focus.style('display', null)
            }
        })
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

        clearLegend()
        if (currentAnnotationIndex >= 0 && correspondingDate <= xScale.invert(annotations[currentAnnotationIndex].x)) {
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
    }

    const clearLegend = () => {
        d3.selectAll('.lineLegend').remove();
    }

    const updateLegends = index => {
        const price = parseFloat(data.prices[index][1])
        const market_cap = parseFloat(data.market_caps[index][1])
        const volume = parseFloat(data.total_volumes[index][1])
        const date = new Date(data.prices[index][0])

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
                    return `${d}: $${numberWithCommas(price.toFixed(10))}`;
                } else if (d === 'market cap') {
                    return `${d}: $${numberWithCommas(market_cap.toFixed(10))}`;
                } else if (d === 'volume') {
                    return `${d}: $${numberWithCommas(volume.toFixed(10))}`;
                } else {
                    return `${d}: unknown?`;
                }
            })
            .style('fill', 'black')
            .attr('transform', 'translate(15,9)')
    };

    const findEventSubstring = "-- Event "
    getCurrentEventNumber = () => {
        const isEvent = currentAnnotationIndex >= 0 && annotations[currentAnnotationIndex].note.title.includes(findEventSubstring)
        if (isEvent) {
            const title = annotations[currentAnnotationIndex].note.title
            const eventNumber = parseInt(title[title.indexOf(findEventSubstring) + findEventSubstring.length])
            return eventNumber
        }

        return 0
    }

    renderAnnotations = () => {
        let makeAnnotations = d3.annotation();
        if (showHighlightedEvent) {
            makeAnnotations
                .editMode(true)
                .notePadding(15)
                .type(d3.annotationLabel)
                .annotations([highlightedAnnotations[getCurrentEventNumber() - 1]])
        } else {
            makeAnnotations
                .editMode(true)
                .notePadding(15)
                .type(d3.annotationLabel)
                .annotations(annotations.slice(0, currentAnnotationIndex + 1))
        }

        svg.select('.annotation-group').remove()
        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
    }

    renderAnnotations()


    renderButton = () => {
        // create button
        const buttonHeight = 40
        const buttonWidth = 60
        let buttonX = 0
        let buttonY = 0

        if (currentAnnotationIndex < 0) {
            buttonX = 0
            buttonY = height - 100
        } else {
            currentAnnotation = annotations[currentAnnotationIndex]
            if (currentAnnotation.dx < 0 && currentAnnotation.dy < 0 && currentAnnotation.dx < -20) {
                buttonX = currentAnnotation.x + currentAnnotation.dx - 20
                buttonY = currentAnnotation.y + currentAnnotation.dy + buttonHeight + 10
            } else if (currentAnnotation.dx < 0 && currentAnnotation.dy > 0 && currentAnnotation.dx < -20) {
                buttonX = currentAnnotation.x + currentAnnotation.dx - 5
                buttonY = currentAnnotation.y + currentAnnotation.dy - buttonHeight * 2
            } else {
                buttonX = currentAnnotation.x + currentAnnotation.dx + 20
                buttonY = currentAnnotation.y + currentAnnotation.dy + 5
            }
        }

        svg
            .select('#button-group')
            .remove()

        const group = svg
            .append('g')
            .attr('id', 'button-group')
            .on('click', () => {
                currentAnnotationIndex = currentAnnotationIndex + 1
                if (currentAnnotationIndex == annotations.length) {
                    currentAnnotationIndex = -1
                    clearLegend()
                }

                showHighlightedEvent = false
                renderChart()
                renderAnnotations()
                renderButton()
                focus.style('display', 'none')
            })

        group
            .append('rect')
            .attr('x', buttonX)
            .attr('y', buttonY)
            .attr('width', buttonWidth)
            .attr('height', buttonHeight)
            .attr('stroke', 'black')
            .attr('fill', () => {
                if (currentAnnotationIndex == -1) {
                    return '#77dd77'
                }

                if (currentAnnotationIndex == annotations.length - 1) {
                    return '#A7C7E7'
                }

                return '#ffcccb'
            })
            .attr('id', 'start')
            .attr('rx', 20)
            .attr('ry', 20)

        group
            .append('text')
            .attr('x', buttonX + buttonWidth / 2)
            .attr('y', buttonY + buttonHeight / 1.5)
            .text(() => {
                if (currentAnnotationIndex == -1) {
                    return 'start'
                }

                if (currentAnnotationIndex == annotations.length - 1) {
                    return 'reset'
                }

                return 'next'
            })
            .attr('fill', 'black')
            .style('font-size', '14pt')
            .style('text-anchor', 'middle')

        svg
            .select('#show-detail-group')
            .remove()

        const eventNumber = getCurrentEventNumber()
        if (eventNumber > 0) {
            let drillDownButtonY = buttonY + buttonHeight + 10

            const showDetailGroup = svg
                .append('g')
                .attr('id', 'show-detail-group')
                .on('click', () => {
                    showHighlightedEvent = !showHighlightedEvent
                    renderChart()
                    renderAnnotations()
                    renderButton()
                })

            showDetailGroup
                .append('rect')
                .attr('x', buttonX)
                .attr('y', drillDownButtonY)
                .attr('rx', 20)
                .attr('ry', 20)
                .attr('width', buttonWidth)
                .attr('height', buttonHeight)
                .attr('stroke', 'black')
                .attr('fill', '#77dd77')
                .attr('id', 'drilldown')

            showDetailGroup
                .append('text')
                .attr('x', buttonX + buttonWidth / 2)
                .attr('y', drillDownButtonY + (buttonHeight / 1.5))
                .text(() => {
                    if (showHighlightedEvent) {
                        return 'back'
                    } else {
                        return 'show'
                    }
                })
                .attr('fill', 'black')
                .style('font-size', '14pt')
                .style('text-anchor', 'middle')
        }
    }

    renderButton()
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}