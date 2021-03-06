"use strict";

document.addEventListener("DOMContentLoaded", function () {

	const years = soefinding.findingJson.meta.fields.slice(2)
	const latestYear = years.at(-1)

	const regions = new Map()
	const sites = new Map()
	soefinding.regionNames.forEach(r => regions.set(r, []))
	soefinding.findingJson.data.forEach(d => {
		regions.get(d.Region).push(d)

		// sites are to populate qld item
		if (!sites.has(d.Site))
			sites.set(d.Site, [])
		sites.get(d.Site).push(d)
	})

	// add each "Site" up for our qld aggregate item
	regions.set("Queensland", [])
	for (let [site, data] of sites) {
		const newItem = {
			Region: "Queensland",
			Site: site,
		}
		years.forEach(y => newItem[y] = data.reduce((acc, curr) => {
			return acc + curr[y]
		}, 0))


		regions.get("Queensland").push(newItem)
	}

	// chart 1 stacked column
	for (let [region, data] of regions) {
		data.sort(function (a, b) {
			return b[latestYear] - a[latestYear]
		})
		soefinding.findingContent[region] = {
			series1: data.map(d => {
				return {
					name: d.Site,
					data: years.map(y => d[y])
				}
			}),
			series2: data.map(d => d[latestYear] ?? 0),
			series2Labels: data.map(d => d.Site)
		}
	}

	const options1 = soefinding.getDefaultStackedColumnChartOptions()
	options1.xaxis.title.text = "Year"
	options1.xaxis.categories = years
	options1.yaxis.title.text = "Number of places"
	options1.yaxis.labels.formatter = val => val.toLocaleString()
	options1.yaxis.forceNiceScale = false

	soefinding.state.chart1 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series1,
		options: options1,
		chartactive: true,
	}


	const options2 = soefinding.getDefaultPieChartOptions()
	options2.labels = soefinding.findingContent[soefinding.state.currentRegionName].series2Labels
	options2.tooltip.y = {
		formatter: (val, options) => {
			const percent = options.globals.seriesPercent[options.seriesIndex][0]
			return `${val.toLocaleString()} ha (${percent.toFixed(1)}%)`
		}
	}
	options2.xaxis.categories = ["Site", "Number of locations"]


	soefinding.state.chart2 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series2,
		options: options2,
		chartactive: true,
	}



	window.vueApp = Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1() {
				if (this.currentRegionName == "Queensland")
					return "Change in number of locations, by site type"
				else
					return `Change in number of locations by site type in ${this.currentRegionName} cultural heritage region`
			},
			heading2() {
				if (this.currentRegionName == "Queensland")
					return `Proportion of locations by site type, ${latestYear}`
				else
					return `Proportion of locations by site type in ${this.currentRegionName} cultural heritage region, ${latestYear}`
			},
		},
		methods: {
			formatter1: val => val?.toLocaleString() ?? "",
			onStackedRadioClick: function () {
				this.chart1.options.chart.type = "bar"
				this.chart1.options.chart.stacked = true
			},
			onLineRadioClick: function () {
				this.chart1.options.chart.type = "line"
				this.chart1.options.chart.stacked = false
				this.chart1.options.markers = { size: 4 } // ignored by column chart
				this.chart1.options.tooltip.shared = false
			},
			formatPercent: function (s, i, series) {
				const sum = series.reduce((acc, curr) => acc + curr)
				return (s / sum * 100).toFixed(1)
			},
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newRegionName) {
				this.chart1.series = soefinding.findingContent[newRegionName].series1
				this.chart2.options.labels = soefinding.findingContent[newRegionName].series2Labels
				this.chart2.series = soefinding.findingContent[newRegionName].series2
			}
		}
	}).mount("#chartContainer")

})