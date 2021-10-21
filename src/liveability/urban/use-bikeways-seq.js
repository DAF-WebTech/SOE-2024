"use strict"

document.addEventListener("DOMContentLoaded", function () {

	const years = soefinding.findingJson.meta.fields.slice(1)

	const series = years.map(y => {
		return {
			name: y, 
			data: soefinding.findingJson.data.map(d => d[y])
		}
	})


	const options = soefinding.getDefaultColumnChartOptions()
	options.xaxis.categories = soefinding.findingJson.data.map(d => d.Site)
	options.xaxis.title.text = "Location"
	options.xaxis.labels.trim = true,
	options.yaxis.title.text = "Average daily count"


	soefinding.state.chart1 = {
		options: options,
		series: series,
		chartactive: true,
	}


	new Vue({
		el: "#chartContainer",
		data: soefinding.state,
		computed: {
			heading1: () => `Daily use of bikeways ${years[0]} to ${years[years.length-1]}`
		},
		methods: {
			formatter1: val => val?.toLocaleString() ?? ""

		}
	});
})
