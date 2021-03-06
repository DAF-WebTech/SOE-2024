"use strict"

document.addEventListener("DOMContentLoaded", function () {

	soefinding.yearKeys = soefinding.findingJson.meta.fields

	// chart 1. carbon monoxide
	const coSeries = soefinding.findingJson.data.map(d => {
		return {
			name: "Kilometres",
			data: soefinding.yearKeys.map(y => d[y])
		}
	})

	// create the vue instance for first chart, our column chart
	const options1 = soefinding.getDefaultLineChartOptions()
	options1.xaxis.categories = soefinding.yearKeys
	options1.xaxis.title.text = "Year"
	options1.yaxis.title.text = "Kilometres travelled (billions)"
	options1.tooltip.y = {
		formatter: val => (val * 1000000000).toLocaleString()
	}
	options1.yaxis.labels.formatter = function (val) {
		return val
	}

	soefinding.state.chart1 = {
		options: options1,
		series: coSeries,
		chartactive: true,
	};

	Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1: function () { return `Trend in vehicle kilometres travelled (VKT)` },

		},
		methods: {
			formatter1: function (val) { return val?.toLocaleString(undefined, { minimumFractionDigits: 3 }) ?? "" }
		}
	}).mount("#chartContainer")
})
