"use strict"

document.addEventListener("DOMContentLoaded", function () {

	// first group our data by region
	const regions = new Map()

	soefinding.findingJson.data.forEach(d => {
		if (!regions.has(d["Water quality report card"]))
			regions.set(d["Water quality report card"], [])

		regions.get(d["Water quality report card"]).push(d)
	})

	for (const [region, data] of regions) {

		if (region == "Reef Water Quality report card") {
			soefinding.findingContent[region] = {
				series: {
					headings: ["Year", "Progress toward the 2025 land management target", "Per cent (%) of land in priority areas managed using best management practice systems for water quality outcomes (soil, nutrient and pesticides)"],
					data: data.map(d => {
						return [
							d.Year,
							d["Identified pressure"],
							d["Per cent of land in priority areas managed using best management practice systems for water quality outcomes (soil, nutrient and pesticides)"]
						]
					})
				}
			}
		}
		else {
			soefinding.findingContent[region] = {
				series: {
					headings: ["Year", "Identified pressure", "Risk level", "Threat level"],
					data: data.map(d => [d.Year, d["Identified pressure"], d["Risk level"], d["Threat level"]])
				}
			}
		}
	}

	const noData = ["Queensland", "Healthy Land and Water South East Queensland report card",
		"Fitzroy Basin report card", "Gladstone Harbour report card", "Mackay–Whitsunday–Isaac report card",
		"Wet Tropics Waterways report card", "Townsville Dry Tropics report card"]

	noData.forEach(nd => soefinding.findingContent[nd] = { series: { data: null } })

	soefinding.state.series = soefinding.findingContent[soefinding.state.currentRegionName].series


	window.vueApp = Vue.createApp({
		components: myComponents,
		data() {
			return soefinding.state
		},
		computed: {
			heading1() {
				return `Pressures identified in ${this.currentRegionName}`
			}
		},
		methods: {
			formatter1: val => val ?? "",
			updateRegion(newRegionName) {
				this.currentRegionName = newRegionName
			}
		},
		watch: {
			currentRegionName(newRegionName) {
				this.series = soefinding.findingContent[newRegionName].series
			}
		}
	}).mount("#chartContainer")

})
