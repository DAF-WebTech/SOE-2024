"use strict";

document.addEventListener("DOMContentLoaded", function () {

	const keys = soefinding.findingJson.meta.fields.slice(2, 5)
	soefinding.state.year = "2016"


	// chart 1, pie
	const series1Items = soefinding.findingJson.data.filter(d => d.Measure == "2016 Census Number of Dwellings")
	series1Items.forEach(d =>
		soefinding.findingContent[d["Regional Planning Area"]] = { series1: keys.map(k => d[k]) }
	)

	const options1 = soefinding.getDefaultPieChartOptions()
	options1.labels = keys.map(k => k.replace("-", "–"))
	options1.xaxis.categories = ["Type", "Amount"]
	options1.tooltip = {
		y: {
			formatter: (val, options) => {
				const percent = options.globals.seriesPercent[options.seriesIndex][0]
				return `${val.toLocaleString()}ha (${percent.toFixed(1)}%)`
			}
		}
	}


	soefinding.state.chart1 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series1,
		options: options1,
		chartactive: true,
	}


	// chart 2, pie
	const series2Items = soefinding.findingJson.data.filter(d => d.Measure == "2016-2019 Building Approvals Data")
	series2Items.forEach(d => soefinding.findingContent[d["Regional Planning Area"]].series2 = keys.map(k => d[k]))


	soefinding.state.chart2 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series2,
		options: options1,
		chartactive: true,
	}


	// chart 3, stacked column, qld only
	const series3Items = soefinding.findingJson.data.filter(d => d.Measure == "2016 Census Number of Dwellings" && d["Regional Planning Area"] != "Queensland")
	const series3 = keys.map(k => {
		return {
			name: k.replace("-", "–"), // ndash
			data: series3Items.map(d => d[k])
		}
	})

	const options3 = soefinding.getDefaultStackedColumnChartOptions()
	options3.xaxis.categories = series3Items.map(d => d["Regional Planning Area"].split(/\s|–/))
	options3.xaxis.labels.hideOverlappingLabels = false
	options3.xaxis.labels.rotate = 0
	options3.xaxis.labels.rotateAlways = false
	options3.xaxis.tickPlacement = "between"
	options3.xaxis.title.text = "Regional plan area"
	options3.yaxis.forceNiceScale = false
	options3.yaxis.labels.formatter = (val) => val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`
	options3.yaxis.max = 1500000
	options3.yaxis.min = 0
	options3.yaxis.tickAmount = 6
	options3.yaxis.title.text = "Number of dwellings"

	soefinding.state.chart3 = {
		series: series3,
		options: options3,
		chartactive: true,
	}


	// chart 4, stacked column, qld only
	const series4Items = soefinding.findingJson.data.filter(d => d.Measure == "2016-2019 Building Approvals Data" && d["Regional Planning Area"] != "Queensland")
	const series4 = keys.map(k => {
		return {
			name: k.replace("-", "–"), // ndash
			data: series4Items.map(d => d[k])
		}
	})

	const options4 = JSON.parse(JSON.stringify(options3))
	options4.yaxis.labels.formatter = val => `${val / 1000}K`
	options4.yaxis.max = 120000
	//	options4.yaxis.tickAmount = 6
	options4.yaxis.title.text = "Number of building approvals"

	soefinding.state.chart4 = {
		series: series4,
		options: options4,
		chartactive: true,
	}


	new Vue({
		el: "#chartContainer",
		data: soefinding.state,
		computed: {
			heading1: function () {
				if (this.currentRegionName == "Queensland")
					return `Number of dwellings in ${this.year} Queensland census`
				else
					return `Number of dwellings in ${this.currentRegionName} in ${this.year} Queensland census`
			},
			heading2: function () {
				if (this.currentRegionName == "Queensland")
					return "Proportion of building approvals in 2016–2019 Queensland"
				else
					return `Number of building approvals in ${this.currentRegionName} between 2016–2019`
			},

			heading3: () => "Number of dwellings in Regional Planning Areas in Queensland 2016 census",
			heading4: () => "Number of building approvals in Regional Planning Areas between 2016–2019",
		},
		methods: {
			formatter1: val => val.toLocaleString(),
			percentcolumn: (series, s) => (s / series.reduce((acc, curr) => acc + curr) * 100).toFixed(1)
		}
	})


	window.soefinding.onRegionChange = function () {
		// set the data series in each of the vue apps, for the current region
		// chart 1
		ApexCharts.exec("chart1", "updateSeries", this.findingContent[this.state.currentRegionName].series1)
		// table 1
		soefinding.state.chart1.series = soefinding.findingContent[soefinding.state.currentRegionName].series1

		// chart 2
		ApexCharts.exec("chart2", "updateSeries", this.findingContent[this.state.currentRegionName].series2)
		soefinding.state.chart2.series = soefinding.findingContent[soefinding.state.currentRegionName].series2
		soefinding.loadFindingHtml()
	}

})