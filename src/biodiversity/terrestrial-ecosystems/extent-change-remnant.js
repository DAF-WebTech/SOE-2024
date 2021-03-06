"use strict";

document.addEventListener("DOMContentLoaded", function () {

	const years = soefinding.findingJson.meta.fields.slice(4);
	const latestYear = years.at(-1)

	// sort data by latest year
	soefinding.findingJson.data.sort(function (a, b) {
		return b[latestYear] - a[latestYear]
	})

	const bioregions = {}
	const qldData = [] // we need to populate a qld item as we go
	soefinding.findingJson.data.forEach(d => {
		// fix up the group label
		d["Broad vegetation group label"] = `${d["Broad vegetation group number"]}. ${d["Broad vegetation group label"].replace("-", "—")}` //mdash

		// group by bioregion
		if (!bioregions[d.Bioregion]) {
			bioregions[d.Bioregion] = []
		}
		bioregions[d.Bioregion].push(d)

		let qldGroup = qldData.find(q => q["Broad vegetation group label"] == d["Broad vegetation group label"])
		if (!qldGroup) {
			qldGroup = {
				"Broad vegetation group label": d["Broad vegetation group label"],
				[latestYear]: 0
			}
			qldData.push(qldGroup)
		}
		qldGroup[latestYear] += d[latestYear]
	})

	// set our chart data for each region
	for (const bioregion in bioregions) {
		soefinding.findingContent[bioregion] = {
			series1: bioregions[bioregion].map(d => {
				// as a side effect populate qld value
				return d[latestYear]
			}),
			labels1: bioregions[bioregion].map(d => d["Broad vegetation group label"])
		}
	}
	// set chart date for qld, but first needs sorting
	qldData.sort(function (a, b) {
		return b[latestYear] - a[latestYear]
	})
	soefinding.findingContent.Queensland = {
		series1: qldData.map(d => d[latestYear]),
		labels1: qldData.map(d => d["Broad vegetation group label"]) // or could be keys of bioregions
	}

	const options1 = soefinding.getDefaultPieChartOptions()
	options1.chart.id = "chart1"
	options1.labels = soefinding.findingContent[soefinding.state.currentRegionName].labels1
	options1.tooltip = {
		y: {
			formatter: (val, options) => {
				const percent = options.globals.seriesPercent[options.seriesIndex][0]
				return `${val.toLocaleString()} ha. (${percent.toFixed(1)}%)`
			}
		}
	}
	options1.events = {
		mounted: function (chartContext, config) {
			console.log("chart 1 mounted")
		}
	}

	options1.xaxis.categories = ["Broad vegetation group", "Hectares"] // these are the table headings


	soefinding.state.chart1 = {
		options: options1,
		series: soefinding.findingContent[soefinding.state.currentRegionName].series1,
		chartactive: true,
	}


	// chart 2, column chart for each region, not displayed for qld
	const seriesNames = ["Pre-clear vegetation", latestYear]
	for (const bioregion in bioregions) {
		bioregions[bioregion].sort(function (a, b) {
			return a["Broad vegetation group number"] - b["Broad vegetation group number"]
		})
		soefinding.findingContent[bioregion].series2 = seriesNames.map(s => {
			return {
				name: s,
				data: bioregions[bioregion].map(d => d[s])
			}
		})
		soefinding.findingContent[bioregion].labels2 = bioregions[bioregion].map(d => d["Broad vegetation group label"])
	}
	soefinding.findingContent.Queensland.series2 = soefinding.findingContent["Wet Tropics"].series2 // won't be seen but needs a default
	soefinding.findingContent.Queensland.labels2 = soefinding.findingContent["Wet Tropics"].labels2 // won't be seen but needs a default

	const options2 = soefinding.getDefaultColumnChartOptions()
	options2.chart.id = "chart2"
	options2.tooltip.y = { formatter: val => `${val.toLocaleString()}ha` }
	options2.xaxis.categories = soefinding.findingContent[soefinding.state.currentRegionName].labels2
	options2.xaxis.labels.trim = true,
		options2.xaxis.labels.hideOverlappingLabels = false


	options2.xaxis.tickPlacement = "between" // not a good option, but it fixes a bug
	// where the chart xaxis did not redraw correctly when a) swapping between regions. and then b) clicking one of the legends
	options2.xaxis.title.text = "Broad Vegetation Group"
	options2.yaxis.labels.formatter = val => `${val / 1000000}M`
	options2.yaxis.title.text = "Hectares"

	soefinding.state.chart2 = {
		options: options2,
		series: soefinding.findingContent[soefinding.state.currentRegionName].series2,
		chartactive: true,
	}

	// third chart, stacked column for each region and qld
	const data3 = JSON.parse(document.getElementById("jsonData3").textContent) // data for chart 3
	const keys = data3.meta.fields.slice(3)
	const lastKey = keys.at(-1)

	const qldItem3 = {}
	for (let bioregion in bioregions) { // assume same bioregions as what we had in data file 1
		const regionData = data3.data.filter(d => d.Bioregion == bioregion)
		soefinding.findingContent[bioregion].series3 = regionData.map(d => {
			// as a side effect, populate the qld item
			const name = `${d["Broad vegetation group number"]}. ${d["Broad vegetation group label"]}`
			if (!qldItem3[name])
				qldItem3[name] = keys.map(k => 0)
			qldItem3[name].forEach((q, i) => qldItem3[name][i] += d[keys[i]])

			return {
				name,
				data: keys.map(k => d[k])
			}
		})
	}
	soefinding.findingContent.Queensland.series3 = Object.keys(qldItem3).map(q => {
		return {
			name: q.replace("-", "—"), //emdash
			data: qldItem3[q]
		}
	})
	soefinding.findingContent.Queensland.series3.sort(function (a, b) {
		return parseInt(a.name.substring(0, a.name.indexOf("."))) - parseInt(b.name.substring(0, b.name.indexOf(".")))
	})

	const options3 = soefinding.getDefaultStackedColumnChartOptions()
	options3.chart.height = 600
	options3.chart.id = "chart3"
	options3.legend.inverseOrder = false
	options3.legend.offsetY = 20
	options3.legend.position = "bottom"
	options3.tooltip.y = { formatter: val => val.toLocaleString() }
	options3.xaxis.categories = keys.map(k => [k.substring(0, k.indexOf("-")) + "–", k.substring(k.indexOf("-") + 1)])  //endash
	delete options3.xaxis.tickPlacement
	options3.xaxis.title.text = "Year"
	options3.yaxis.labels.formatter = val => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}k`
	options3.yaxis.labels.minWidth = 30
	options3.yaxis.title.text = "Hectares lost"
	options3.tooltip.shared = false



	soefinding.state.chart3 = {
		options: options3,
		series: soefinding.findingContent[soefinding.state.currentRegionName].series3,
		chartactive: true,
	}

	soefinding.state.latestYear = latestYear

	window.vueApp = Vue.createApp({
		data() {
			return soefinding.state
		},
		components: myComponents,
		methods: {
			formatter1: val => val.toLocaleString(),
			formatPercent: function (s) {
				const sum = this.chart1.series.reduce((acc, curr) => acc + curr)
				let fixed = 2
				switch (this.currentRegionName) {
					case "Queensland":
					case "New England Tableland":
					case "Wet Tropics":
						fixed = 1
						break
					case "Einasleigh Uplands":
						fixed = 3
						break
					case "Mitchell Grass Downs":
						fixed = 4
				}
				return (s / sum * 100).toFixed(fixed)
			},
			onStackedRadioClick: function () {
				this.chart3.options.chart.type = "bar"
				this.chart3.options.chart.stacked = true
			},
			onLineRadioClick: function () {
				this.chart3.options.chart.type = "line"
				this.chart3.options.chart.stacked = false
				this.chart3.options.markers = { size: 4 } // ignored by column chart
				this.chart3.options.tooltip.shared = false
			},
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newName) {
				this.chart1.options.labels = soefinding.findingContent[newName].labels1
				this.chart1.series = soefinding.findingContent[newName].series1
				if (newName != "Queensland") {
					this.chart2.series = soefinding.findingContent[newName].series2
					this.chart2.options.xaxis.categories = soefinding.findingContent[newName].labels2
				}
				this.chart3.series = soefinding.findingContent[newName].series3
				// take note!! we update series via the options, which seems to get around the bug 
				// where it doesn't always repaint properly if the new series has more items
				ApexCharts.exec("chart3", "updateOptions", { series: soefinding.findingContent[newName].series3 })
			}
		}
	}).mount("#chartContainer")


})