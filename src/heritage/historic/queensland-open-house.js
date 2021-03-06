"use strict"

soefinding.regions = pinLocations // these should already be set in ssjs


document.addEventListener("DOMContentLoaded", function () {

	const years = [...new Set(soefinding.findingJson.data.map(d => d.Year))] // array of each unique year
	const locations = [...new Set(soefinding.findingJson.data.map(d => d.Location))] // array of each unique location

	const qldSeries1 = locations.map(loc => {
		const locationData = soefinding.findingJson.data.filter(d => d.Location == loc)
		return {
			name: loc,
			data: years.map(y => {
				const item = locationData.find(ld => ld.Year == y)
				if (item && item["Heritage places open"] == "No Data – event not held")
					return 0
				else if (item)
					return item["Heritage places open"]
				else
					return null
			})
		}
	})

	const options1 = soefinding.getDefaultStackedColumnChartOptions()
	options1.xaxis.categories = years
	options1.xaxis.title.text = "Year"
	options1.yaxis.title.text = "Number of places"
	options1.tooltip.y = {
		formatter: function (val, options) {
			if (val == 0)
				return "no data — event not held"
			else
				return val.toLocaleString()
		}
	}



	soefinding.state.chart1 = {
		options: options1,
		series: qldSeries1,
		chartactive: true,
	};


	const qldSeries2 = locations.map(loc => {
		const locationData = soefinding.findingJson.data.filter(d => d.Location == loc)
		return {
			name: loc,
			data: years.map(y => {
				const item = locationData.find(ld => ld.Year == y)
				if (item && item.Visitors == "No Data – event not held")
					return 0
				else if (item)
					return item.Visitors
				else
					return null
			})
		}
	})

	const options2 = JSON.parse(JSON.stringify(options1))
	options2.yaxis.title.text = "Number of visitors"
	options2.yaxis.labels.formatter = val => `${val / 1000}k`
	options2.tooltip.y.formatter = options1.tooltip.y.formatter


	soefinding.state.chart2 = {
		options: options2,
		series: qldSeries2,
		chartactive: true,
	};

	// now we can interate qld series and pull out info for each city
	soefinding.findingContent.Queensland = { html: "" } // qld is not in chart3 and 4, but we still need to save its html

	// chart 3, places open
	qldSeries1.forEach(q => {
		soefinding.findingContent[q.name] = {
			app3: [{
				name: q.name,
				data: q.data,
				html: null
			}]
		}
		// we have to remove the null items
		soefinding.findingContent[q.name].categories = []
		const newData = [] // 
		soefinding.findingContent[q.name].app3[0].data.forEach((d, i) => {
			if (d != "") {
				if (d == "No Data – event not held")
					newData.push(0)
				else
					newData.push(d)
				soefinding.findingContent[q.name].categories.push(years[i])
			}
		})
		soefinding.findingContent[q.name].app3[0].data = newData
	})

	const options3 = JSON.parse(JSON.stringify(options1))
	options3.chart.id = "chart3"
	soefinding.state.chart3 = {
		options: options3,
		chartactive: true,
		html: null
	};
	if (soefinding.state.currentRegionName == "Queensland")
		soefinding.state.chart3.series = soefinding.findingContent.Bundaberg.app3 // set a default
	else
		soefinding.state.chart3.series = soefinding.findingContent[soefinding.state.currentRegionName].app3


	// chart 4, visitors
	qldSeries2.forEach(q => {
		soefinding.findingContent[q.name].app4 = [{
			name: q.name,
			data: q.data
		}]
		// we have to remove the null items
		soefinding.findingContent[q.name].categories = []
		const newData = [] // 
		soefinding.findingContent[q.name].app4[0].data.forEach((d, i) => {
			if (d != "") {
				if (d == "No Data – event not held")
					newData.push(0)
				else
					newData.push(d)
				soefinding.findingContent[q.name].categories.push(years[i])
			}
		})
		soefinding.findingContent[q.name].app4[0].data = newData
	})

	const options4 = JSON.parse(JSON.stringify(options2))
	options4.chart.id = "chart4"
	options4.yaxis.labels.formatter = options2.yaxis.labels.formatter
	options4.tooltip.y = options2.tooltip.y
	soefinding.state.chart4 = {
		options: options4,
		chartactive: true,
		html: null
	};
	if (soefinding.state.currentRegionName == "Queensland")
		soefinding.state.chart4.series = soefinding.findingContent.Bundaberg.app4 // set a default
	else
		soefinding.state.chart4.series = soefinding.findingContent[soefinding.state.currentRegionName].app4


	window.vueApp = Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1() { return `Heritage places open in ${this.currentRegionName}` },
			heading2() { return `People visiting heritage places in ${this.currentRegionName}` }
		},
		methods: {
			formatter1: function (val) {
				if (val == null)
					return ""
				else if (val == 0)
					return "No Data<br>event not held"
				else
					return val.toLocaleString()
			},
			formatter3: val => val == 0 ? "No Data<br>event not held" : val.toLocaleString(),
			onStackedRadioClick: function (chart) {
				chart.options.chart.type = "bar"
				chart.options.chart.stacked = true
			},
			onLineRadioClick: function (chart) {
				chart.options.chart.type = "line"
				chart.options.chart.stacked = false
				chart.options.markers = { size: 4 }
				chart.options.tooltip.shared = false
			},
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newRegionName) {
				if (newRegionName != "Queensland") {
					// update chart 3
					this.chart3.series = soefinding.findingContent[newRegionName].app3
					this.chart3.options.xaxis.categories = soefinding.findingContent[newRegionName].categories
					// but we also need this for the chart to update
					ApexCharts.exec("chart3", "updateOptions", {
						xaxis: { categories: this.chart3.options.xaxis.categories }
					})
					// update chart 4
					this.chart4.series = soefinding.findingContent[newRegionName].app4
					// this works on the table
					this.chart4.options.xaxis.categories = soefinding.findingContent[newRegionName].categories
					// but we also need this for the chart to update
					ApexCharts.exec("chart4", "updateOptions", {
						xaxis: { categories: this.chart4.options.xaxis.categories }
					})
				}
			}
		}
	}).mount("#chartContainer")


})