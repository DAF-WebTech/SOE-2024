"use strict"

document.addEventListener("DOMContentLoaded", function () {

	const yearKeys = soefinding.findingJson.meta.fields.slice(2)
	const latestYear = yearKeys[yearKeys.length - 1]

	//1. stacked column, all waste types each year
	const qldItems = soefinding.findingJson.data.filter(d => d["Waste region"] == "Queensland" && d["Waste source"] != "All")
	const wasteYearSeries = qldItems.map(d => {
		return {
			name: d["Waste source"],
			data: yearKeys.map(y => d[y])
		}
	})
	wasteYearSeries.sort(function (a, b) {
		return b.data[b.data.length - 1] - a.data[a.data.length - 1]
	})


	const options1 = soefinding.getDefaultBarChartOptions()
	options1.chart.stacked = true
	options1.legend.inverseOrder = true
	options1.xaxis.categories = yearKeys.map(y => y.replace("-", "–")) // ndash
	options1.xaxis.title.text = "Year"
	options1.yaxis.title.text = "Tonnes (million)"
	options1.yaxis.labels.formatter = val => {
		return `${(val / 1000000).toFixed(1)}M`
	}
	options1.tooltip.y = {
		formatter: val => val.toLocaleString()
	}

	soefinding.state.chart1 = {
		options: options1,
		series: wasteYearSeries,
		chartactive: true,
	}


	// 2. line, total
	const qldAll = soefinding.findingJson.data.find(d => d["Waste region"] == "Queensland" && d["Waste source"] == "All")
	const qldAllSeries = [{
		name: "Total",
		data: yearKeys.map(y => qldAll[y])
	}]

	const options2 = soefinding.getDefaultLineChartOptions()
	options2.xaxis.categories = yearKeys.map(y => y.replace("-", "–"))// .match(/[^–]+–?/g)) // ndash
	options2.xaxis.title.text = "Year"
	options2.yaxis.title.text = "Tonnes (million)"
	options2.yaxis.labels.formatter = val => {
		return `${(val / 1000000).toFixed(1)}M`
	}
	options2.tooltip.y = {
		formatter: val => val.toLocaleString()
	}

	soefinding.state.chart2 = {
		options: options2,
		series: qldAllSeries,
		chartactive: true,
	}


	// 3 pie, total in latest year for each region
	const regionItems = soefinding.findingJson.data.filter(d => d["Waste region"] != "Queensland")
	const regionSeries = regionItems.map(d => d[latestYear])
	regionSeries.sort(function (a, b) {
		return b - a
	})

	const options3 = soefinding.getDefaultPieChartOptions()
	options3.xaxis.categories = ["Region", "Tonnes"] //ndash
	options3.labels = regionItems.map(d => d["Waste region"].replace("-", "–"))
	options3.tooltip = {
		y: {
			formatter: (val, options) => {
				const percent = options.globals.seriesPercent[options.seriesIndex][0]
				return `${val.toLocaleString()} (${percent.toFixed(1)}%)`
			}
		}
	}

	soefinding.state.chart3 = {
		options: options3,
		series: regionSeries,
		chartactive: true,
	}


	Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1: () => "Household waste landfilled, by collection type",
			heading2: () => "Trend in total household waste landfilled",
			heading3: () => `Proportion of household waste landfilled by region, ${latestYear.replace("-", "–")}`, //ndash
		},
		methods: {
			formatter1: val => val?.toLocaleString() ?? "",
			formatPercent: function (s, i, series) {
				const sum = series.reduce((acc, curr) => acc + curr)
				return (s / sum * 100).toFixed(1)
			},
		}
	}).mount("#chartContainer")

})
