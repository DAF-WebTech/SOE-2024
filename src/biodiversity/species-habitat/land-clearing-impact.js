//used by flora and fauna
"use strict";

document.addEventListener("DOMContentLoaded", function () {

	const years = soefinding.findingJson.meta.fields.slice(2)
	const latest = years.at(-1)


	// create a new qld object
	const qldArray = []
	for (let i = 0; i < 7; ++i) {
		const qldObj = {
			Bioregion: "Queensland",
			"Clearing type": soefinding.findingJson.data[i]["Clearing type"],
		}
		years.forEach(y => qldObj[y] = 0)

		qldArray.push(qldObj)

	}

	// sort our data so pie charts look better
	soefinding.findingJson.data.sort(function (a, b) {
		return b[latest] - a[latest]
	})

	// group our regions, and keep tally for qld
	const regions = new Map()
	soefinding.findingJson.data.forEach(d => {

		if (!regions.has(d.Bioregion))
			regions.set(d.Bioregion, [d])
		else
			regions.get(d.Bioregion).push(d)

		const item = qldArray.find(q => q["Clearing type"] == d["Clearing type"])
		years.forEach(y => item[y] += d[y])
	})

	// add our qld object into the map
	qldArray.sort(function (a, b) {
		return b[latest] - a[latest]
	})
	regions.set("Queensland", qldArray)

	// for each of our regions, sort them so the pie chart looks better
	for (let [region, data] in regions) {

	}

	// series 1 is the last year values, in a pie chart
	for (let [region, data] of regions) {
		// series 1 is the last year values, in a pie chart
		const series1 = data.map(d => d[latest])
		const series1Sum = series1.reduce(function (acc, curr) { return acc + curr }, 0)
		soefinding.findingContent[region] = {
			series1,
			series1Sum,
			labels: data.map(d => d["Clearing type"])
		}

		//chart 2, line chart, all regions all years
		soefinding.findingContent[region].series2 = data.map(d => {
			return {
				name: d["Clearing type"].split(" "),
				data: years.map(y => d[y])
			}
		})

		const totalItem = {
			Bioregion: region,
			"Clearing type": "total",
		}
		years.forEach(y => totalItem[y] = 0)
		data.forEach(d => {
			years.forEach(y => {
				totalItem[y] += d[y]
			})
		})
		soefinding.findingContent[region].series3 = [{
			name: "Hectares",
			data: years.map(y => totalItem[y])
		}]

	}

	const options1 = soefinding.getDefaultPieChartOptions()
	options1.chart.id = "chart1"
	options1.labels = soefinding.findingContent[soefinding.state.currentRegionName].labels
	options1.xaxis.categories = ["Clearing type", "Hectares"]
	options1.tooltip = {
		y: {
			formatter: (val, options) => {
				const percent = options.globals.seriesPercent[options.seriesIndex][0]
				return `${val.toLocaleString()} ha. (${percent.toFixed(1)}%)`
			}
		}
	}

	soefinding.state.chart1 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series1,
		seriesSum: soefinding.findingContent[soefinding.state.currentRegionName].series1Sum,
		options: options1,
		chartactive: true,
	}


	const options2 = soefinding.getDefaultLineChartOptions()
	options2.chart.id = "chart2"
	options2.xaxis.categories = years.map(y => y.replace("-", "–")) // en dash
	options2.xaxis.title.text = "Year"
	options2.yaxis.title.text = "Hectares"
	options2.yaxis.labels.formatter = val => {
		if (val >= 1000000)
			return `${val / 1000000}M`
		if (val >= 1000)
			return `${val / 1000}K`
		return val
	}
	options2.tooltip.y = { formatter: val => `${val.toLocaleString()} ha.` }

	soefinding.state.chart2 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series2,
		options: options2,
		chartactive: true,
	}

	soefinding.state.chart3 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series3,
		options: options2, // reüse
		chartactive: true,
	}


	window.vueApp = Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1() {
				let retVal = `Proportion of replacement landcover (clearing type) in threatened ${soefinding.biota} habitat`
				if (this.currentRegionName != "Queensland") {
					retVal += " in "
					if (!this.currentRegionName.startsWith("South") && !this.currentRegionName.startsWith("Cape"))
						retVal += " the "
					retVal += `${this.currentRegionName}`
				}
				retVal += `, ${latest.replace("-", "–")}` // en dash
				return retVal
			},
			heading2() {
				let retVal = `Trends in replacement landcover (clearing type) in threatened ${soefinding.biota} habitat`
				if (this.currentRegionName != "Queensland") {
					retVal += " in "
					if (!this.currentRegionName.includes("Queensland"))
						retVal += " the "
					retVal += `${this.currentRegionName}`
				}
				retVal += `, ${latest.replace("-", "–")}` // en dash
				return retVal
			},
			heading3() {
				let retVal = `Trend in total replacement landcover (clearing type) in threatened ${soefinding.biota} habitat`
				if (this.currentRegionName != "Queensland") {
					retVal += " in "
					if (!this.currentRegionName.includes("Queensland"))
						retVal += " the "
					retVal += `${this.currentRegionName}`
				}
				retVal += `, ${latest.replace("-", "–")}` // en dash
				return retVal
			},
		},
		methods: {
			formatter1: val => val.toLocaleString(),
			formatPercent: function (s) {
				return (s / soefinding.findingContent[this.currentRegionName].series1Sum * 100).toFixed(1)
			},
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newRegionName) {
				this.chart1.series = soefinding.findingContent[newRegionName].series1
				this.chart1.options.labels = soefinding.findingContent[newRegionName].labels
				this.chart2.series = soefinding.findingContent[newRegionName].series2
				this.chart3.series = soefinding.findingContent[newRegionName].series3
			}
		}
	}).mount("#chartContainer")

})