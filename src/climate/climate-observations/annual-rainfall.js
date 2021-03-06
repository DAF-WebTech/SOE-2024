"use strict"

soefinding.regions = pinLocations // these should already be set in ssjs


document.addEventListener("DOMContentLoaded", function () {

	soefinding.yearKeys = soefinding.findingJson.meta.fields.slice(2);
	const regionNames = Object.keys(soefinding.regions)
	regionNames.push("Queensland")


	for (let regionName of regionNames) {

		// create a data series for this region
		const item = soefinding.findingJson.data.filter(d => d.Name == regionName)
		const seriesNames = ["Actual", "Moving average"]
		const series = seriesNames.map(s => {
			const regionItem = item.find(d => d.Measure == s)
			return {
				name: s,
				data: soefinding.yearKeys.map(y => regionItem[y])
			}
		})

		// findingContent holds the html and data series for each region
		soefinding.findingContent[regionName] = {
			html: "",
			app1: series
		}
	}

	const options1 = soefinding.getDefaultLineChartOptions()
	options1.stroke = { width: 1.5 }
	options1.markers.size = 0
	options1.tooltip.x = {
		formatter: val => soefinding.yearKeys[val - 1]
	}
	options1.xaxis.categories = soefinding.yearKeys
	const YEAR_GAP = 4
	options1.xaxis.labels.formatter = (val) => val % YEAR_GAP == 0 ? val : ""
	options1.xaxis.tickAmount = Math.floor(soefinding.yearKeys / YEAR_GAP)
	delete options1.xaxis.tickPlacement
	options1.xaxis.title.text = "Year"
	options1.yaxis.labels.formatter = val => val
	options1.yaxis.title.text = "Rainfall (millimetres)"



	soefinding.state.chart1 = {
		options: options1,
		series: soefinding.findingContent[soefinding.state.currentRegionName].app1,
		chartactive: true,
	}


	window.vueApp = Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1() { return `Annual average rainfall for ${this.currentRegionName}` },
		},
		methods: {
			formatter1: (val) => val?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "",
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newRegionName) {
				this.chart1.series = soefinding.findingContent[newRegionName].app1
			}
		}
	}).mount("#chartContainer")
})

