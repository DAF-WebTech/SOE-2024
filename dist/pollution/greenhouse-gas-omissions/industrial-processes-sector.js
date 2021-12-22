"use strict";document.addEventListener("DOMContentLoaded",function(){const yearKeys=soefinding.findingJson.meta.fields.slice(2);const latestYear=yearKeys[yearKeys.length-1];const allStates=soefinding.findingJson.data.filter(d=>d.Category=="All");allStates.sort(function(a,b){return b[latestYear]-a[latestYear]});const allStatesSeries=allStates.map(d=>d[latestYear]);const options1=soefinding.getDefaultPieChartOptions();options1.labels=allStates.map(d=>d.State);options1.tooltip={y:{formatter:(val,options)=>{const percent=options.globals.seriesPercent[options.seriesIndex][0];return`${val.toLocaleString()} (${percent.toFixed(1)}%)`}}};options1.xaxis.categories=["Sector","Emissions<br>(million tonnes)"];soefinding.state.chart1={options:options1,series:allStatesSeries,chartactive:true};const qldItems=soefinding.findingJson.data.filter(d=>d.State=="Queensland"&&d.Category!="All");qldItems.sort(function(a,b){return b[latestYear]-a[latestYear]});const qldSeries=qldItems.filter(d=>d[latestYear]!="Data is confidential").map(d=>d[latestYear]);const options2=JSON.parse(JSON.stringify(options1));options2.labels=qldItems.filter(d=>d[latestYear]!="Data is confidential").map(d=>d.Category);soefinding.state.chart2={options:options2,series:qldSeries,chartactive:true};const qldTrendSeries=qldItems.map(d=>{return{name:d.Category,data:yearKeys.map(y=>d[y]=="Data is confidential"?null:d[y])}});qldTrendSeries.sort(function(a,b){if(a.data.at(-1)==null||b.data.at(-1)==null)return b.data[6]-a.data[6];else return b.data.at(-1)-a.data.at(-1)});const options3=soefinding.getDefaultAreaChartOptions();options3.stroke={width:1};options3.xaxis.categories=yearKeys;options3.xaxis.title.text="Year";options3.yaxis.title.text="Tonnes";options3.yaxis.labels.formatter=val=>`${val.toLocaleString(void 0,{maximumFractionDigits:2})}M`;options3.tooltip.y={formatter:val=>`${(val*1e6).toLocaleString()}`};soefinding.state.chart3={options:options3,series:qldTrendSeries,chartactive:true};const qldTotalItem=soefinding.findingJson.data.find(d=>d.State=="Queensland"&&d.Category=="All");const qldTotalSeries=yearKeys.map(y=>qldTotalItem[y]);const options4={xaxis:{categories:["Year","Emissions<br>(million tonnes)"]},labels:yearKeys};soefinding.state.chart4={options:options4,series:qldTotalSeries};new Vue({el:"#chartContainer",data:soefinding.state,computed:{heading1:()=>`Proportion of industrial processes emissions by state, ${latestYear}`,heading2:()=>`Proportion of Queensland\u2019s industrial processes emissions by category, ${latestYear}`,heading3:()=>"Trends in Queensland\u2019s industrial processes emissions, by category",heading4:()=>"Queensland\u2019s total industrial processes emissions"},methods:{formatter1:val=>val?.toLocaleString(void 0,{minimumFractionDigits:3,maximumFractionDigits:3})??"confidential"}})});
//# sourceMappingURL=industrial-processes-sector.js.map