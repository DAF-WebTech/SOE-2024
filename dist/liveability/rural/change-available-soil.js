"use strict";var originalNumberToLocaleString=Number.prototype.toLocaleString;Number.prototype.toLocaleString=function(opts){let result=originalNumberToLocaleString.call(this,void 0,opts);result=result.replace("-","\u2212");return result};document.addEventListener("DOMContentLoaded",function(){const keys=soefinding.findingJson.meta.fields.slice(1);soefinding.findingContent.Queensland={app1:[{name:"Change (ha)",data:keys.map(k=>0)}]};soefinding.findingJson.data.forEach(d=>{soefinding.findingContent[d.Region]={app1:[{name:"Change (ha)",data:keys.map((k,i)=>{soefinding.findingContent.Queensland.app1[0].data[i]+=d[k];return d[k]})}]}});const options1=soefinding.getDefaultColumnChartOptions();options1.xaxis.categories=keys;keys[7]=["Water","Wetlands"];options1.xaxis.title.text="Land use classification";options1.yaxis.title.text="Hectares";options1.yaxis.labels.formatter=val=>val.toLocaleString();soefinding.state.chart1={options:options1,series:soefinding.findingContent[soefinding.state.currentRegionName].app1,chartactive:true};const baseYear=[159430.1909,60492.80844,1284568803e-3,23188.99982,15831.8042,8126.537534,76852.24199,69056.69311,32931.02996];const series2=JSON.parse(JSON.stringify(soefinding.findingContent.Queensland.app1));series2[0].data=series2[0].data.map((d,i)=>d/baseYear[i]*100);series2[0].name="Percent change";const options2=JSON.parse(JSON.stringify(options1));options2.yaxis.title.text="Percentage change in land classification";options2.yaxis.labels.formatter=val=>val.toLocaleString();soefinding.state.chart2={options:options2,series:series2,chartactive:true};new Vue({el:"#chartContainer",data:soefinding.state,computed:{heading1:()=>`Change in available soil and land resources in ${soefinding.state.currentRegionName}`,heading2:()=>"Percentage change in area between 1999 and 2019"},methods:{formatter1:val=>val==0?0:val.toLocaleString({minimumFractionDigits:2,maximumFractionDigits:2})}});window.soefinding.onRegionChange=function(){soefinding.state.chart1.series=this.findingContent[this.state.currentRegionName].app1;soefinding.loadFindingHtml()}});
//# sourceMappingURL=change-available-soil.js.map