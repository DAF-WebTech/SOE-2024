"use strict";

document.addEventListener("DOMContentLoaded", function () {

	const fields = ["Endangered", "Of concern", "No concern at present"]
	const yearKeys = soefinding.findingJson.meta.fields.slice(6)
	const latestYear = yearKeys.at(-1)
	const bioregions = new Set()


	soefinding.findingContent.Queensland = {
		series1: fields.map(f => { return { name: f, data: [] } }),
		series2: fields.map(f => { return { name: f, data: [] } }),
		series3: fields.map(f => { return { name: f, data: yearKeys.map(y => 0) } }),
	}
	soefinding.findingJson.data.forEach((d, i) => {
		// the data comes in groups of 3
		// qld only for charts 1 and 2
		soefinding.findingContent.Queensland.series1[i % 3].data.push(d["Number of regional ecosystem"])
		soefinding.findingContent.Queensland.series2[i % 3].data.push(d[latestYear])
		bioregions.add(d.Bioregion)

		// chart 3 qld
		yearKeys.forEach((y, j) => soefinding.findingContent.Queensland.series3[i % 3].data[j] += d[y])

		// chart 3, 4, 5 each region
		if (!soefinding.findingContent[d.Bioregion]) {
			soefinding.findingContent[d.Bioregion] = {
				series3: [],
				series4: [],
				series5: [],
			}
		}
		soefinding.findingContent[d.Bioregion].series3.push({
			name: d["Biodiversity Status"],
			data: yearKeys.map(y => d[y])
		})
		soefinding.findingContent[d.Bioregion].series4.push(d["Number of regional ecosystem"])
		soefinding.findingContent[d.Bioregion].series5.push(d[latestYear])

	})


	const options1 = soefinding.getDefaultStackedColumnChartOptions()
	options1.chart.height = 450
	options1.xaxis.categories = [...bioregions]
	options1.xaxis.title.text = "Bioregion"
	options1.yaxis.title.text = "Number of regional ecosystems"

	soefinding.state.chart1 = {
		options: options1,
		series: soefinding.findingContent.Queensland.series1,
		chartactive: true,
	}


	const options2 = JSON.parse(JSON.stringify(options1))
	options2.yaxis.labels.formatter = val => `${val / 1000000}M`
	options2.yaxis.title.text = "Hectares"

	soefinding.state.chart2 = {
		options: options2,
		series: soefinding.findingContent.Queensland.series2,
		chartactive: true,
	}


	const options3 = soefinding.getDefaultLineChartOptions()
	options3.chart.id = "chart3"
	options3.xaxis.title.text = "Year"
	options3.yaxis.title.text = "Hectares"
	options3.xaxis.categories = yearKeys
	options3.yaxis.labels.formatter = val => {
		if (val >= 1000000)
			return `${val / 1000000}M`
		else
			return `${val / 1000}K`
	}
	options3.tooltip.y = { formatter: val => val.toLocaleString() }

	soefinding.state.chart3 = {
		options: options3,
		series: soefinding.findingContent["Wet Tropics"].series3, /* just for a default, so the chart will draw */
		chartactive: true,
	}


	const options4 = soefinding.getDefaultPieChartOptions()
	options4.chart.id = "chart4"
	options4.chart.type = "donut"
	options4.labels = fields
	options4.xaxis.categories = ["Biodiversity status", "Number of regional ecosystems"]
	options4.tooltip.y = {
		formatter: (val, options) => {
			const percent = options.globals.seriesPercent[options.seriesIndex][0]
			return `${val.toLocaleString()} (${percent.toFixed(1)}%)`
		}
	}

	soefinding.state.chart4 = {
		options: options4,
		series: soefinding.findingContent["Wet Tropics"].series4, /* just for a default, so the chart will draw */
		chartactive: true,
	}

	const options5 = JSON.parse(JSON.stringify(options4))
	options5.chart.id = "chart5"
	options5.tooltip.y = options4.tooltip.y

	soefinding.state.chart5 = {
		options: options5,
		series: soefinding.findingContent[soefinding.state.currentRegionName].series5,
		chartactive: true,
	}


	window.vueApp = Vue.createApp({
		data() {
			return soefinding.state
		},
		components: myComponents,
		computed: {
			heading1: () => `Extent of regional ecosystems by biodiversity status, ${latestYear}`,
			heading2: () => `Extent of biodiversity status area, ${latestYear}`,
			heading3() { return `Trends in extent of remnant vegetation, by biodiversity status in ${this.currentRegionName}` },
			heading4() { return `Proportion of regional ecosystems by biodiversity status in ${this.currentRegionName}, ${latestYear}` },
			heading5() { return `Proportion area of biodiversity status in ${this.currentRegionName}, ${latestYear}` }
		},
		methods: {
			formatter1: val => val.toLocaleString(),
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
				this.chart3.series = soefinding.findingContent[newRegionName].series3
				if (newRegionName != "Queensland") {
					this.chart4.series = soefinding.findingContent[newRegionName].series4 // perhaps not needed ApexCharts.exec("chart4", "render")
					this.chart5.series = soefinding.findingContent[newRegionName].series5 // perhaps not needed  ApexCharts.exec("chart5", "render")
				}
			}
		}

	}).mount("#chartContainer")

})
