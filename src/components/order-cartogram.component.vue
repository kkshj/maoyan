<template>
  <div>
    <el-row class="export-sheet" v-if="canIVisit('operate', 'DATA_STATISTICS_EXPORT')">
      <el-col :span="8">
        <el-date-picker value-format="yyyy-MM-dd" v-model="sheetConditions.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
      </el-col>
      <el-col :span="6">
        <el-select v-model="sheetConditions.hospitalId" filterable remote placeholder="医院名称" :remote-method="remoteHospitalMethod">
          <el-option v-for="item in hospitalOptions" :key="item.id" :label="item.text" :value="item.id">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-button type="success" plain @click="exportSheet()">导出</el-button>
      </el-col>
    </el-row>
    <el-row class="header" v-loading="loading">
      <el-col :span="11">
        <div class="topDiv"><h3 style="margin-top: 20px;margin-left: 35px">待处理事务</h3>
        </div>
        <div class="downDiv">
          <br>
          <span>待接诊（{{cartogram.waitingOrder}}）</span>
          <span>已接诊（{{cartogram.receivedOrder}}）</span>
          <span>已超时（{{cartogram.overTimeOrder}}）</span>
          <span>待签章（{{cartogram.waitingSignature}}）</span>
          <br>
          <br>
          <span>待审方（{{cartogram.waitingAudit}}）</span>
          <span>退款订单（{{cartogram.refundOrder}}）</span>
        </div>
      </el-col>
      <el-col :span="1">
      </el-col>
      <el-col :span="11">
        <div class="mainInformationDiv">
          <div class="mainInformationLeftDiv"></div>
          <div class="mainInformationRightDiv">
            <br>
            <span>入驻医生人数：{{cartogram.doctorNum}}</span><br><br><br>
            <span>问诊订单总量：{{cartogram.consultNum}}</span><br><br><br>
            <span>订单总收益：{{cartogram.orderTotalRevenue===0 ? '无收益' : '￥'+cartogram.orderTotalRevenue}}</span><br>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="center"></el-row>
    <el-row class="search" v-loading="loading">
      <!--<el-col :span="11" >
          <div class="topDiv">
            <div class="topLeftDiv"><h4 style="margin-top: 10px;margin-left: 25px">今日人数统计</h4></div>
            <div class="topRightDiv">
              <el-button type="primary" plain round size="mini">今日</el-button>
              <el-button type="primary" plain round size="mini">本周</el-button>
              <el-button type="primary" plain round size="mini">本月</el-button>
            </div>
          </div>
          <div class="downDiv">
            <div class="downLowDiv">
              <br>
              <span class="fontClass">100</span>
              <br><br>
              <span>今日访问人数</span>
            </div>
            <div class="downLowDiv">
              <br>
              <span class="fontClass">180</span>
              <br><br>
              <span>昨日访问人数</span>
            </div>
            <div class="downLowDiv">
              <br>
              <span class="fontClass">-80%</span>
              <br><br>
              <span>环比增速</span>
            </div>
          </div>
        </el-col>
        <el-col :span="2">
        </el-col>-->
      <el-col :span="24">
        <div class="rightAddUserDiv">
          <div class="topDiv">
            <div class="topLeftDiv"><h3 style="margin-top: 10px;margin-left: 25px">新增用户注册统计</h3>
            </div>
            <div class="topRightDiv">
              <el-button type="primary" plain round size="mini" @click="registration('DAY')">今日</el-button>
              <el-button type="primary" plain round size="mini" @click="registration('WEEK')">本周</el-button>
              <el-button type="primary" plain round size="mini" @click="registration('MONTH')">本月</el-button>
            </div>
          </div>
          <div class="downDiv">
            <div class="downLowDiv">
              <br>
              <span class="fontClass">{{registrationInfo.registrationDayStatistics}}</span>
              <br><br>
              <span v-if="this.stateType === 'DAY'">今日新增注册人数</span>
              <span v-if="this.stateType === 'WEEK'">本周新增注册人数</span>
              <span v-if="this.stateType === 'MONTH'">本月新增注册人数</span>
            </div>
            <div class="downLowDiv">
              <br>
              <span class="fontClass">{{registrationInfo.beforeDayRegistrationStatistics}}</span>
              <br><br>
              <span v-if="this.stateType === 'DAY'">昨日新增注册人数</span>
              <span v-if="this.stateType === 'WEEK'">上周新增注册人数</span>
              <span v-if="this.stateType === 'MONTH'">上月新增注册人数</span>
            </div>
            <div class="downLowDiv">
              <br>
              <span class="fontClass">{{registrationInfo.relativeDay}}</span>
              <br><br>
              <span>环比增速</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="centerDown"></el-row>
    <el-row class="cartogramDiv" v-loading="cartogramLoading">
      <el-col :span="24">
        <el-row class="centerDown"></el-row>
        <div class="cartogramTopDiv">
          <div class="cartogramTopLeftDiv">
            <div class="cartogramSpanDiv"><span>今日订单总数：<br>{{cartogram.todayOrderNum===0? '无订单' : cartogram.todayOrderNum}}</span></div>
            <div class="cartogramSpanDiv"><span>昨日订单总数：<br>{{cartogram.yesterdayOrderNum===0 ? '无订单' :cartogram.yesterdayOrderNum}}</span></div>
            <div class="cartogramSpanDiv"><span>今日订单总收益：<br>{{cartogram.todayOrderTotalRevenue===0 ? '无收益' : cartogram.todayOrderTotalRevenue+'元'}}</span></div>
            <div class="cartogramSpanDiv"><span>昨日订单总收益：<br>{{cartogram.yesterdayOrderTotalRevenue===0 ? '无收益' : cartogram.yesterdayOrderTotalRevenue+'元'}}</span></div>
          </div>
          <div class="cartogramTopRightDiv">
            <div class="cartogramTopRightLeftDiv">
              <!--时间插件-->
              <div class="block">
                <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
              </div>
            </div>
            <div class="cartogramTopRightRightDiv">
              <el-button type="primary" plain @click="getCartogramInfo(condition.startAndEndTime)">确定</el-button>
            </div>
          </div>
        </div>
        <div class="cartogramTopDiv"></div>
        <div class="cartogramCenterDiv" id="cartogramCenterDiv"></div>
        <el-row class="centerDown">
          <span>订单总数：{{cartogramList.orderTotalNum===0 ? '无订单' : cartogramList.orderTotalNum}}</span>&nbsp;&nbsp;
          <span>问诊订单：{{cartogramList.orderConsultTotalNum===0 ? '无订单' : cartogramList.orderConsultTotalNum}}</span>&nbsp;&nbsp;
          <span>义诊订单：{{cartogramList.orderConsultFreeTotalNum===0 ? '无订单' : cartogramList.orderConsultFreeTotalNum}}</span>&nbsp;&nbsp;
          <span>药品订单：{{cartogramList.orderDrugsTotalNum===0 ? '无订单' : cartogramList.orderDrugsTotalNum}}</span>
        </el-row>
        <el-row class="centerDown"></el-row>
        <div class="cartogramCenterDiv" id="cartogramDownDiv"></div>
        <el-row class="centerDown">
          <span>订单总收益：{{cartogramList.orderTotalRevenue===0 ? '无收益' : cartogramList.orderTotalRevenue+'元'}}</span>&nbsp;&nbsp;
          <span>问诊订单收益：{{cartogramList.orderConsultTotalRevenue===0 ? '无收益' : cartogramList.orderConsultTotalRevenue+'元'}}</span>&nbsp;&nbsp;
          <span>药品订单收益：{{cartogramList.orderDrugsTotalRevenue===0 ? '无收益' : cartogramList.orderDrugsTotalRevenue+'元'}}</span>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "doctor-manager",
  data() {
    return {
    accout: 0,
      jurisdiction: false,
      loading: false,
      sheetConditions: {
        startAndEndTime: '',
        hospitalId: ''
      },
      hospitalOptions: [],
      condition: {
        startAndEndTime: '',
      },
      cartogram: {},
      cartogramList: {},
      fullscreenLoading: false,
      cartogramLoading: false,
      registrationInfo: {},
      stateType: '',
      
      token: ""
    }
  },
  activated() {
    this.loading = true;
    this.cartogramLoading = true;
    this.token = localStorage.getItem("token");
    console.log(this.token)
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.getInfo(); //页面默认加载首页
    this.condition = {} //切换菜单栏，搜索设置为空
  },
  methods: {
    canIVisit(type, functions) {
      const roles = JSON.parse(localStorage.getItem('userInfo')).roles;
      if (roles.length === 1) {
        const role = roles[0];
        return rules.canIVisit(role, type, functions)
      }
      if (roles.length > 1) {
        let roleBol = false;
        for (let i in roles) {
          const role = roles[i];
          roleBol = roleBol || rules.canIVisit(role, type, functions);
        }
        return roleBol;
      }
    },
    getInfo() {
      /*加载数据*/
      var _this = this
      const url = `${conf.url}/internethospital/api/orderStatics/statistical-information`;
      ax.get(url, this.header).then(res => {
        this.cartogram = res.data;
      }).catch(err => {
        if (!this.jurisdiction) {
          this.jurisdiction = true
          this.refreshTokened(err)
        }
      })

      this.registration('DAY'); //默认加载天数
      /*获取图形接口数据*/
      let cartogramUrl = `${conf.url}/internethospital/api/orderStatics/cartogram-information`;
      ax.get(cartogramUrl, this.header).then(res => {
        this.cartogramList = res.data;
        let orderNumContent = res.data.orderNumList; //总订单集合
        let orderConsultNumContent = res.data.orderConsultList; //网络问诊订单集合
        let orderConsultFreeNumContent = res.data.orderConsultFreeList; //义诊订单集合
        let orderDrugsNumContent = res.data.orderDrugsList; //药品订单集合
        let orderNumListData = []; //订单总量
        let orderRevenueData = []; //订单总收益
        let timeDayData = []; //时间
        let orderConsultNumListData = []; //问诊订单总量
        let orderConsultRevenueData = []; //问诊订单总收益
        let orderConsultFreeNumListData = []; //义诊订单总量
        let orderDrugsNumListData = []; //药品订单总量
        let orderDrugsRevenueData = []; //药品订单总收益
        for (let i in orderNumContent) {
          orderNumListData.push(orderNumContent[i].orderNum);
          timeDayData.push(orderNumContent[i].everyday.substring(5, 10));
          orderRevenueData.push(orderNumContent[i].orderRevenue);
        }
        for (let i in orderConsultNumContent) {
          orderConsultNumListData.push(orderConsultNumContent[i].orderConsultNum);
          orderConsultRevenueData.push(orderConsultNumContent[i].orderConsultRevenue);
        }
        for (let i in orderConsultFreeNumContent) {
          orderConsultFreeNumListData.push(orderConsultFreeNumContent[i].orderConsultFreeNum);
        }
        for (let i in orderDrugsNumContent) {
          orderDrugsNumListData.push(orderDrugsNumContent[i].orderDrugsNum);
          orderDrugsRevenueData.push(orderDrugsNumContent[i].orderDrugsRevenue);
        }
        let chart = this.$echarts.init(document.getElementById('cartogramCenterDiv'));
        let option = {
          title: {
            text: '订单量统计'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['订单总量', '问诊订单量', '药品订单量', '义诊订单量']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeDayData
          },
          yAxis: {
            type: 'value'
          },
          series: [{
              name: '订单总量',
              type: 'line',
              stack: '总量',
              data: orderNumListData
            },
            {
              name: '问诊订单量',
              type: 'line',
              stack: '总量',
              data: orderConsultNumListData
            },
            {
              name: '义诊订单量',
              type: 'line',
              stack: '总量',
              data: orderConsultFreeNumListData
            },
            {
              name: '药品订单量',
              type: 'line',
              stack: '总量',
              data: orderDrugsNumListData
            }
          ]
        };
        chart.setOption(option) //订单收益图形
        let downChart = this.$echarts.init(document.getElementById('cartogramDownDiv'));
        let downOption = {
          title: {
            text: '订单收益统计'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['订单总收益', '问诊订单收益', '药品订单收益']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeDayData
          },
          yAxis: {
            type: 'value'
          },
          series: [{
              name: '订单总收益',
              type: 'line',
              stack: '总量',
              data: orderRevenueData
            },
            {
              name: '问诊订单收益',
              type: 'line',
              stack: '总量',
              data: orderConsultRevenueData
            },
            {
              name: '药品订单收益',
              type: 'line',
              stack: '总量',
              data: orderDrugsRevenueData
            }
          ]
        };
        downChart.setOption(downOption) //订单量图形
        this.loading = false;
        this.cartogramLoading = false;
      }).catch(err => {
        if (!this.jurisdiction) {
          this.jurisdiction = true
          this.refreshTokened(err)
        }
      })
    },
    refreshTokened(err) {
      let _this = this
      if (err.response.status === 401) {
        if (_this.accout > 4) {
          this.$message({
            message: '没有权限',
            type: 'warning'
          });
          return;
        }
        _this.accout += 1
        ax.refreshToken().then(res => {
          localStorage.setItem('token', res.data.access_token);
          this.header = { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } };
          _this.getInfo()
          this.jurisdiction = false
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },
    getCartogramInfo(startAndEndTime) {
      this.cartogramLoading = true;
      /*获取图形接口数据*/
      let cartogramUrl = `${conf.url}/internethospital/api/orderStatics/cartogram-information`;
      if (this.condition.startAndEndTime) {
        cartogramUrl = `${cartogramUrl}?start-date=` + startAndEndTime[0] + ` 00:00:00&end-date=` + startAndEndTime[1] + ` 00:00:00`
      }
      ax.get(cartogramUrl, this.header).then(res => {
        this.cartogramList = res.data;
        let orderNumContent = res.data.orderNumList; //总订单集合
        let orderConsultNumContent = res.data.orderConsultList; //网络问诊订单集合
        let orderConsultFreeNumContent = res.data.orderConsultFreeList; //义诊订单集合
        let orderDrugsNumContent = res.data.orderDrugsList; //药品订单集合
        let orderNumListData = []; //订单总量
        let orderRevenueData = []; //订单总收益
        let timeDayData = []; //时间
        let orderConsultNumListData = []; //问诊订单总量
        let orderConsultRevenueData = []; //问诊订单总收益
        let orderConsultFreeNumListData = []; //义诊订单总量
        let orderDrugsNumListData = []; //药品订单总量
        let orderDrugsRevenueData = []; //药品订单总收益
        for (let i in orderNumContent) {
          orderNumListData.push(orderNumContent[i].orderNum);
          timeDayData.push(orderNumContent[i].everyday.substring(5, 10));
          orderRevenueData.push(orderNumContent[i].orderRevenue);
        }
        for (let i in orderConsultNumContent) {
          orderConsultNumListData.push(orderConsultNumContent[i].orderConsultNum);
          orderConsultRevenueData.push(orderConsultNumContent[i].orderConsultRevenue);
        }
        for (let i in orderConsultFreeNumContent) {
          orderConsultFreeNumListData.push(orderConsultFreeNumContent[i].orderConsultFreeNum);
        }
        for (let i in orderDrugsNumContent) {
          orderDrugsNumListData.push(orderDrugsNumContent[i].orderDrugsNum);
          orderDrugsRevenueData.push(orderDrugsNumContent[i].orderDrugsRevenue);
        }
        let chart = this.$echarts.init(document.getElementById('cartogramCenterDiv'));
        let option = {
          title: {
            text: '订单量统计'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['订单总量', '问诊订单量', '药品订单量', '义诊订单量']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeDayData
          },
          yAxis: {
            type: 'value'
          },
          series: [{
              name: '订单总量',
              type: 'line',
              stack: '总量',
              data: orderNumListData
            },
            {
              name: '问诊订单量',
              type: 'line',
              stack: '总量',
              data: orderConsultNumListData
            },
            {
              name: '义诊订单量',
              type: 'line',
              stack: '总量',
              data: orderConsultFreeNumListData
            },
            {
              name: '药品订单量',
              type: 'line',
              stack: '总量',
              data: orderDrugsNumListData
            }
          ]
        };
        chart.setOption(option) //订单收益图形
        let downChart = this.$echarts.init(document.getElementById('cartogramDownDiv'));
        let downOption = {
          title: {
            text: '订单收益统计'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: ['订单总收益', '问诊订单收益', '药品订单收益']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: timeDayData
          },
          yAxis: {
            type: 'value'
          },
          series: [{
              name: '订单总收益',
              type: 'line',
              stack: '总量',
              data: orderRevenueData
            },
            {
              name: '问诊订单收益',
              type: 'line',
              stack: '总量',
              data: orderConsultRevenueData
            },
            {
              name: '药品订单收益',
              type: 'line',
              stack: '总量',
              data: orderDrugsRevenueData
            }
          ]
        };
        downChart.setOption(downOption) //订单量图形
        this.loading = false;
        this.cartogramLoading = false;
      }).catch(err => {
        if (!this.jurisdiction) {
          this.jurisdiction = true
          this.refreshTokened(err)
        }
      })
    },
    remoteHospitalMethod(query) {
      if (query) {
        const url = `${conf.url}/internethospital/api/organizations?page-index=1&page-size=1000&text=${query}&type=HOSPITAL`;
        ax.get(url, this.header).then(res => {
          this.hospitalOptions = res.data.content;
        }).catch(err => {
          this.refreshTokened(err)
        })
      }
    },
    exportSheet() {
      console.log(this.sheetConditions)
      let url = `${conf.url}/internethospital/api/orderStatics/operation-report?organization-id=${this.sheetConditions.hospitalId}&start-date=${this.sheetConditions.startAndEndTime[0]} 00:00:00&end-date=${this.sheetConditions.startAndEndTime[1]} 23:59:59`;
      let form = document.createElement('FORM');
      form.method = 'POST';
      form.action = url;
      document.body.appendChild(form);
      form.submit();
      form.onsubmit = e => {
        console.log(1);
        console.log(e)
      }
      // ax.get(url, this.header).then(res =>{
      //   console.log(res);
      // })
    },
    registration(state) {
      this.stateType = state;
      console.log(state)
      let url = `${conf.url}/internethospital/api/orderStatics/registration-information?type=` + state;
      ax.get(url, this.header).then(res => {
        let relativeDay = res.data.relativeDay;
        if (relativeDay.toString().indexOf('.') >= 0) {
          /*如果小数点的下标为2且包含0和负号的，那么必为位-0.** */
          if (relativeDay.toString().indexOf('.') == 2 && relativeDay.toString().indexOf('-') >= 0 && relativeDay.toString().slice(0, relativeDay.toString().indexOf('.')).indexOf('0')) { //例如-0.72
            res.data.relativeDay = relativeDay.toString().slice(0, relativeDay.toString().indexOf('.') + 3).replace('0', '').replace('.', '') + '%'
          }
          /*不存在负号，有小数点,且第一位数不为0*/
          if (relativeDay.toString().indexOf('-') < 0 && relativeDay.toString().indexOf('0') != 0) {
            res.data.relativeDay = relativeDay.toString().slice(0, relativeDay.toString().indexOf('.') + 3).replace('.', '') + '%'
          }
          /*如果第一位为0，且有小数点*/
          if (relativeDay.toString().indexOf('0') == 0) {
            res.data.relativeDay = relativeDay.toString().slice(0, relativeDay.toString().indexOf('.') + 3).replace('0', '').replace('.', '') + '%'
          }
        } else if (relativeDay == 0) {
          res.data.relativeDay = '— —';
        } else { //整数
          res.data.relativeDay = relativeDay.toString() + '00%'
        }
        this.registrationInfo = res.data;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err)
      })
    }
  }
}

</script>
<style scoped>
.export-sheet {
  height: 100px;
}

.el-row.header {
  height: 200px;
  align: left;
  -moz-box-shadow: 0 0 10px gray;
  -webkit-box-shadow: 0 0 10px gray;
  box-shadow: 0 0 10px gray;
}

.el-row.header>.el-col {
  border: 0px solid black;

}

.el-row.header>.el-col:first-child {
  text-align: left;
  height: 200px;

}

.el-row.header>.el-col:last-child {
  text-align: center;
  height: 200px;
}

.el-row.search {
  height: 200px;
  align: left;
  border: 0px solid black;
  -moz-box-shadow: 0 0 10px gray;
  -webkit-box-shadow: 0 0 10px gray;
  box-shadow: 0 0 10px gray;
}

.el-row.center {
  height: 50px;
  align: left;
  border: 0px solid black;
}

.el-row.centerDown {
  height: 50px;
  align: left;
  border: 0px solid black;
}

.el-row.cartogramDiv {
  height: 1320px;
  align: left;
  border: 0px solid black;
  -moz-box-shadow: 0 0 10px gray;
  -webkit-box-shadow: 0 0 10px gray;
  box-shadow: 0 0 10px gray;
}

.el-row.cartogramDiv>.el-col>.cartogramTopDiv {
  height: 50px;
  width: 100%;
  border: 0px solid black;
}

.el-row.search button {
  float: left;
  margin-top: 10px;
}

.el-row.search>.el-col {
  padding: 0 10px;
  text-align: left;
}

.el-row.search>.el-col:first-child {
  text-align: left;
  height: 200px;
  border: 0px solid black;
}

.el-row.search>.el-col:last-child {
  text-align: center;
  height: 200px;
}

.el-form {
  width: 100%;
  margin: 0 auto;
}

.el-select {
  width: 100%;
}

.el-dialog .el-form-item {
  text-align: left;
}

.topDiv {
  height: 50px;
  border: 0px solid black;
  margin-top: 15px;
}

.downDiv {
  height: 146px;
  border: 0px solid black;

}

.downDiv span {
  margin-left: 40px;
}

.topLeftDiv {
  text-align: left;
  width: 60%;
  height: 50px;
  border: 0px solid black;
  float: left;
}

.topRightDiv {
  width: 39%;
  height: 50px;
  border: 0px solid black;
  float: left;
}

.downLowDiv {
  text-align: left;
  width: 33%;
  border: 0px solid black;
  float: left;
  height: 146px;
}

.fontClass {
  font-weight: bold;
  font-size: 24px;
  color: orange;
}

.rightAddUserDiv {
  border: 0px solid black;
  width: 100%;

}

.cartogramTopLeftDiv {
  width: 55%;
  height: 50px;
  border: 0px solid black;
  float: left;
}

.cartogramTopRightDiv {
  width: 44%;
  height: 50px;
  border: 0px solid black;
  float: left;
}

.cartogramSpanDiv {
  float: left;
  border: 0px solid black;
  height: 50px;
  width: 24.7%;
}

.cartogramTopRightLeftDiv {
  border: 0px solid black;
  height: 50px;
  width: 79%;
  float: left;
  text-align: right;
}

.cartogramTopRightRightDiv {
  border: 0px solid black;
  height: 50px;
  width: 20%;
  float: left;
}

.cartogramCenterDiv {
  height: 500px;
  width: 96%;
  border: 0px solid black;
  margin-left: 30px;
}

.mainInformationDiv {
  border: 0px solid black;
  width: 100%;
  height: 200px;
  margin-top: 20px;
}

.mainInformationLeftDiv {
  border: 0px solid black;
  width: 30%;
  height: 200px;
  float: left;
}

.mainInformationRightDiv {
  border: 0px solid black;
  width: 69%;
  height: 200px;
  float: left;
  text-align: left;
}

</style>
