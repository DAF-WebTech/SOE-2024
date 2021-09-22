"use strict"

const originalNumberToLocaleString = Number.prototype.toLocaleString;
Number.prototype.toLocaleString = function (opts) {
	let result = originalNumberToLocaleString.call(this, undefined, opts)
	result = result.replace("-", "−") // unicode minus sign
	return result
}


document.addEventListener("DOMContentLoaded", function () {

	const keys = soefinding.findingJson.meta.fields.slice(1)

    soefinding.findingContent.Queensland = {app1: [{name: "Change", data: keys.map(k => 0)}]}

	soefinding.findingJson.data.forEach(d => {
		soefinding.findingContent[d.Region] = {app1: [ { name: "Change", data: keys.map((k, i) => {
            //first a side effect, sum up for qld
            soefinding.findingContent.Queensland.app1[0].data[i] += d[k]
			return d[k]
			})}]
		}
	})

	const options1 = soefinding.getDefaultColumnChartOptions();
	options1.xaxis.categories = keys
	keys[7] = ["Water", "Wetlands"]
	options1.xaxis.title.text = "Land use classification"
	options1.yaxis.title.text = "Hectares"
	options1.yaxis.labels.formatter = val => val.toLocaleString()

	soefinding.state.chart1 = {
		options: options1,
		series: soefinding.findingContent[soefinding.state.currentRegionName].app1,
		chartactive: true,
	};

	// these were given to me manually, are not in the data file
	const baseYear = [159430.1909, 60492.80844, 1284568.803, 23188.99982, 15831.8042, 8126.537534, 76852.24199, 69056.69311, 32931.02996]
	const series2 = JSON.parse(JSON.stringify(soefinding.findingContent.Queensland.app1))
	series2[0].data = series2[0].data.map((d, i) => d / baseYear[i] * 100.0)
	series2[0].name = "Percent change"

	const options2 = JSON.parse(JSON.stringify(options1))
	options1.yaxis.title.text = "Percentage change in land classifictation"

	soefinding.state.chart2 = {
		options: options2,
		series: series2,
		chartactive: true,
	};


	new Vue({
		el: "#chartContainer",
		data: soefinding.state,
		computed: {
			heading1: () => `Change in available soil and land resources in ${soefinding.state.currentRegionName}`
		},
		methods: {
			formatter1: val => val.toLocaleString({minimumFractionDigits: 2})
		}
	});


	window.soefinding.onRegionChange = function () {
		// set the data series in each of the vue apps, for the current region
		soefinding.state.chart1.series =
			this.findingContent[this.state.currentRegionName].app1;

		soefinding.loadFindingHtml();
	}


})