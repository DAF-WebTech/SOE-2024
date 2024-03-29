"use strict";

document.addEventListener("DOMContentLoaded", function () {

	const series1items = soefinding.findingJson.data.filter(d => d["Drainage division"] != "Queensland" && d.Indicator == "Area (ha)")
	const seriesNames = soefinding.findingJson.meta.fields.slice(2, 5)
	const series1 = seriesNames.map(n => {
		return {
			name: n,
			data: series1items.map(d => d[n])
		}
	})

	const options1 = soefinding.getDefaultStackedColumnChartOptions()
	options1.tooltip.y = { formatter: val => val.toLocaleString() }
	options1.xaxis.categories = series1items.map(d => {
		if (d["Drainage division"].startsWith("North East")) //separate into two lines
			return [
				d["Drainage division"].substring(0, d["Drainage division"].lastIndexOf(" ")),
				d["Drainage division"].substring(d["Drainage division"].lastIndexOf(" ") + 1)
			]
		else
			return d["Drainage division"]
	})
	options1.xaxis.title.text = "Wetland System"
	options1.yaxis.labels.formatter = val => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`
	options1.yaxis.forceNiceScale = false
	options1.yaxis.min = 0
	options1.yaxis.max = 3000000
	options1.yaxis.tickAmount = 6
	options1.yaxis.title.text = "Hectares"
	options1.yaxis.labels.minWidth = 25
	options1.chart.id = "chart1"


	soefinding.state.chart1 = {
		options: options1,
		series: series1,
		chartactive: true,
	}


	// chart 2 pie chart for each region but not qld
	const series2items = series1items.filter(d => d["Drainage division"] != "Other")
	series2items.forEach(d => {
		const series2 = seriesNames.map(n => d[n])
		const series2Sum = series2.reduce(function (acc, curr) { return acc + curr }, 0)
		soefinding.findingContent[d["Drainage division"]] = {
			series2,
			series2Sum
		}
	})

	const options2 = soefinding.getDefaultPieChartOptions()
	options2.chart.type = "donut"
	options2.chart.id = "chart2"
	options2.labels = seriesNames
	options2.xaxis = { categories: ["Drainage division", "Hectares"] }
	options2.tooltip = {
		y: {
			formatter: (val, options) => {
				const percent = options.globals.seriesPercent[options.seriesIndex][0]
				return `${val.toLocaleString()} (${percent.toFixed(1)}%)`
			}
		}
	}

	soefinding.findingContent.Queensland = {
		series2: [1, 2, 3]
	}// dummy values, never used


	soefinding.state.chart2 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series2,
		seriesSum: soefinding.findingContent[soefinding.state.currentRegionName].series2Sum,
		options: options2,
		chartactive: true,
	}



	// series 3 is shared between chart 3 (qld) and chart 4 (regional)
	const series3Names = [...seriesNames, "Total"]
	const series3items = soefinding.findingJson.data.filter(d => d["Drainage division"] != "Other"
		&& d["Drainage division"] != "Queensland"
		&& d.Indicator == "Percent of pre-clear")
	series3items.forEach(d => {
		soefinding.findingContent[d["Drainage division"]].series3 = [{
			name: "Percent",
			data: series3Names.map(n => d[n])
		}]
	})
	// qld is different
	soefinding.findingContent.Queensland.series3 = soefinding.findingJson.data
		.filter(d => d.Indicator == "Percent of pre-clear")
		.map(d => {
			return {
				name: d["Drainage division"],
				data: series3Names.map(n => d[n])
			}
		})

	const options3 = soefinding.getDefaultColumnChartOptions()
	options3.tooltip.y = { formatter: val => val }
	options3.xaxis.categories = series3Names
	options3.xaxis.title.text = "Wetland system"
	delete options3.xaxis.tickPlacement
	options3.yaxis.title.text = "Percent"
	options3.yaxis.forceNiceScale = false
	options3.yaxis.min = 0
	options3.yaxis.max = 100
	options3.yaxis.tickAmount = 5
	options3.yaxis.labels.formatter = val => Math.round(val)


	soefinding.state.chart3 = {
		options: options3,
		series: soefinding.findingContent.Queensland.series3,
		chartactive: true,
	}


	soefinding.state.chart4 = {
		options: options3,
		series: soefinding.findingContent[soefinding.state.currentRegionName].series3,
		chartactive: true,
	}


	let series5currentRegion = ""
	const series5Parse = JSON.parse(document.getElementById("jsonData2").textContent)
	const series5Keys = series5Parse.meta.fields.slice(2)
	soefinding.findingContent.Other = {} // not used but it's simpler if it's there
	series5Parse.data.forEach(d => {
		if (series5currentRegion != d["Drainage division"]) {
			soefinding.findingContent[d["Drainage division"]].series5 = [{
				name: d["Wetland system"],
				data: series5Keys.map(k => d[k])
			}]

			series5currentRegion = d["Drainage division"]
		}
		else
			soefinding.findingContent[d["Drainage division"]].series5.push({
				name: d["Wetland system"],
				data: series5Keys.map(k => d[k])
			})
	})

	const options5 = soefinding.getDefaultLineChartOptions()
	options5.xaxis.categories = series5Keys.map(k => k.replace("-", "–")) //ndash
	options5.xaxis.title.text = "Year"
	options5.yaxis.title.text = "Change in hectares"
	delete options5.yaxis.forceNiceScale
	options5.yaxis.labels.formatter = val => soefinding.convertToUnicodeMinus(val)

	soefinding.state.chart5 = {
		options: options5,
		series: soefinding.findingContent[soefinding.state.currentRegionName].series5,
		chartactive: true,
	}

	const YEAR = "2024 TODO YEAR"

	window.vueApp = Vue.createApp({
		data() {
			return soefinding.state
		},
		components: myComponents,
		computed: {
			heading1: () => `Freshwater wetland systems extent by region, ${YEAR}`,
			heading2() { return `Proportion of freshwater wetland systems extent in ${this.currentRegionName}, ${YEAR}` },
			heading3: () => `Freshwater wetland systems percentage of pre-clear extent remaining, ${YEAR}`,
			heading4() { return `Freshwater wetland system percentage of pre-clear extent remaining in ${this.currentRegionName}, ${YEAR}` },
			heading5() { return `Trends in change (loss or gain) in freshwater wetland systems in ${this.currentRegionName}` }
		},
		methods: {
			formatter1: val => val.toLocaleString(),
			formatter3: val => val.toFixed(1),
			formatter5: val => soefinding.convertToUnicodeMinus(val),
			formatPercent: function (s) {
				return (s / soefinding.findingContent[this.currentRegionName].series2Sum * 100).toFixed(1)
			},
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newRegionName) {
				if (newRegionName != "Queensland") {
					this.chart2.series = soefinding.findingContent[newRegionName].series2
					this.chart4.series = soefinding.findingContent[newRegionName].series3
				}
				this.chart5.series = soefinding.findingContent[newRegionName].series5
			}
		}
	}).mount("#chartContainer")

})

