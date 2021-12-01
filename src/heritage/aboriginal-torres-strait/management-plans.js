"use strict"

document.addEventListener("DOMContentLoaded", function () {

	const years = soefinding.findingJson.meta.fields.slice(1)

	soefinding.findingContent.Queensland = { series: [] }
	soefinding.findingJson.data.forEach(d => {
		soefinding.findingContent[d.Region] = { 
			series: [{
				name: "Plans",
				data: years.map(y => d[y])
			}]
		}

		soefinding.findingContent.Queensland.series.push({
			name: d.Region,
			data: years.map(y => d[y])
		})
	})


	const options1 = soefinding.getDefaultStackedColumnChartOptions()
	options1.xaxis.title.text = "Year"
	options1.xaxis.categories = years
	options1.yaxis.title.text = "Number of plans"


	soefinding.state.chart1 = {
		series: soefinding.findingContent[soefinding.state.currentRegionName].series,
		options: options1,
		chartactive: true,
	}


	new Vue({
		el: "#chartContainer",
		data: soefinding.state,
		computed: {
			heading1: function () {
				if (this.currentRegionName == "Queensland")
					return "Number of management plans registered, by cultural heritage region"
				else
					return `Number of management plans registered in ${this.currentRegionName} cultural heritage region`
			}
		},
		methods: {
			formatter1: val => val.toLocaleString()
		}
	})


	window.soefinding.onRegionChange = function () {
		soefinding.state.chart1.series = soefinding.findingContent[soefinding.state.currentRegionName].series

		soefinding.loadFindingHtml()
	}

})