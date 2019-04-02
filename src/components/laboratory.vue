<template>
  <div id="main" style="width: 600px;height:400px;"></div>
</template>

<script>
    export default {
      name: "laboratory",
      activated(){
        let chart = this.$echarts.init(document.getElementById('main'));
        let option = {
          title: {
            text: 'ECharts 入门示例'
          },
          tooltip: {},
          legend: {
            data:['销量','销量2']
          },
          xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
          },
          yAxis: {},
          series: [{
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          },{
          name: '销量2',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
        }]
        };
        chart.setOption(option)
      }
    }
</script>

<style scoped>
</style>
