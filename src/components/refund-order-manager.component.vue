<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>退款订单管理</h4>
      </el-col>
      <el-col :span="6">
        <!--<el-button type="primary" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加订单</el-button>-->
      </el-col>
    </el-row>
    <el-row class="search">
      <el-col :span="7.5">
        <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="就诊人电话" clearable v-model="condition.userPhone"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="医疗人员名称" clearable v-model="condition.healerId"></el-input>
      </el-col>
      <el-col :span="3" v-if="!isHospital">
        <el-select v-model="condition.hospitalCode" filterable remote placeholder="医院名称" :remote-method="remoteHospitalMethod">
          <el-option v-for="item in hospitalOptions" :key="item.code" :label="item.text" :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <!--<el-col :span="4">
        <el-select
          v-model="condition.departmentId"
          filterable
          remote
          placeholder="所属科室"
          :remote-method="remoteDepartmentMethod">
          <el-option
            v-for="item in departmentOptions"
            :key="item.id"
            :label="item.text"
            :value="item.id">
            <span style="float: left">{{ item.text }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>
          </el-option>
        </el-select>
      </el-col>-->
      <el-col :span="3">
        <el-select v-model="condition.status" placeholder="退款类型">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="success" plain @click="getInfo(1)">搜索</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTime && !condition.departmentId && !condition.hospitalCode && !condition.healerId && !condition.status && !condition.userPhone" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class="search" v-if="canIVisit('operate', 'REFUND_EXPORT')">
      <el-col :span="9.5">
        <div class="block">
          <span class="demonstration">导出区间：</span>
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTimes" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="就诊人电话" clearable v-model="condition.userPhones"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="医疗人员名称" clearable v-model="condition.healerIds"></el-input>
      </el-col>
      <el-col :span="3" v-if="!isHospital">
        <el-select v-model="condition.hospitalCodes" filterable remote placeholder="医院名称" :remote-method="remoteHospitalMethods">
          <el-option v-for="item in hospitalOptionss" :key="item.code" :label="item.text" :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.statuss" placeholder="退款类型">
          <el-option v-for="item in statusOptionss" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain @click="exportCsvs()">导出</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTimes && !condition.departmentIds && !condition.hospitalCodes && !condition.healerIds && !condition.statuss && !condition.userPhones" @click="resetConditions()">重置</el-button>
      </el-col>
    </el-row>
    <el-table :data="refundlist" v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" prop="orderNumber" label="订单号"></el-table-column>
      <el-table-column align="left" prop="sourceOrder" label="原始订单号">
        <template slot-scope="scope">
          <div>{{scope.row.sourceOrder.orderTypeText}}：<a class="color" @click="jump(scope.row.sourceOrder.id,scope.row.sourceOrder.orderTypeCode,scope.row.sourceOrder.orderNumber)">{{scope.row.sourceOrder.orderNumber}}</a></div>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="refundOrderId" label="交易流水号"></el-table-column>
      <el-table-column align="left" prop="fullAmountRefund" label="退款类型">
        <template slot-scope="scope">
          <span>{{scope.row.fullAmountRefund===true? '全额退款' : '部分退款'}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="organizationText" label="所属医院"></el-table-column>
      <el-table-column align="left" prop="departmentText" label="所属科室"></el-table-column>
      <el-table-column align="left" prop="statusText" label="订单状态"></el-table-column>
      <el-table-column align="left" prop="doctorName" label="医生/护师姓名">
        <template slot-scope="scope">
          <span>{{scope.row.doctorName || scope.row.nurseName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="patientName" label="就诊人姓名"></el-table-column>
      <el-table-column align="left" prop="purchaserUsername" label="就诊人电话"></el-table-column>
      <el-table-column align="left" prop="createdDate" label="创建时间"></el-table-column>
      <el-table-column header-align="left" align="right" label="金额">
        <template slot-scope="scope">
          <span>￥{{scope.row.amount}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" width="140px" prop="amount" label="操作" v-if="canIVisit('operate', 'REFUND_READ')">
        <template slot-scope="scope">
          <el-button size="mini" type="success" plain @click="goToDetail('check', scope.row.orderNumber)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--layout代表组件布局，子组件名用逗号分隔
        属性： total代表总条目数
        事件： current-change用于监听页数改变，而内容也发生改变-->
    <div class="block">
      <br>
      <el-pagination background layout="prev, pager, next" :total="total" :currentPage='currentPage' @current-change="getInfo">
      </el-pagination>
    </div>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "order-manager",
  data() {
    return {
      accout:0,
      currentPage: 1, //默认开始页面
      total: 0, //默认数据总数
      loading: false,
      condition: {
        startAndEndTime: '',
        hospitalCode: '',
        doctorName: '',
        nurseName: '',
        status: '',
        userPhone: '',

        startAndEndTimes: '',
        userPhones: '',
        healerIds: '',
        hospitalCodes: '',
        statuss: '',
      },
      refundlist: [],
      addOne: false,
      delivery: {},
      hospitalOptions: [],
      hospitalOptionss: [],
      departmentOptions: [],
      healerOptions: [],
      statusOptions: [
        { value: 'true', label: '全额退款' },
        { value: 'false', label: '部分退款' }

      ],
      statusOptionss: [
        { value: 'true', label: '全额退款' },
        { value: 'false', label: '部分退款' }

      ],
      /*时间选择器*/
      pickerOptions2: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  activated(){
const organizationsCode = localStorage.getItem('organizationsCode');
    if (organizationsCode) {
      this.isHospital = true;
      this.condition.hospitalCode = organizationsCode;
    }
    this.loading = true;
    const token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.getInfo(this.currentPage);    
  },
  methods: {
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
          _thisthis.header = { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } };
          _this.getInfo(_this.currentPage)
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },
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
    getInfo(currentPage) {
      this.currentPage = currentPage;
      /*加载订单数据*/
      var startAndEndTime = this.condition.startAndEndTime;
      let url = `${conf.url}/internethospital/api/orders/refund?page-index=${currentPage}&page-size=10`;
      if (this.condition.startAndEndTime) {
        url = `${url}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1];
      }
      if (this.condition.hospitalCode) {
        url = `${url}&organization-code=${this.condition.hospitalCode}`
      }
      if (this.condition.departmentId) {
        url = `${url}&department-id=${this.condition.departmentId}`;
      }
      if (this.condition.healerId) {
        url = `${url}&medical-staff-name=${this.condition.healerId}`
      }
      if (this.condition.status) {
        url = `${url}&full-amount-refund=${this.condition.status}`
      }
      if (this.condition.userPhone) {
        url = `${url}&user-phone=${this.condition.userPhone}`
      }
      /*向后台获取数据*/
      ax.get(url, this.header).then(res => {
        for (let i in res.data.content) {
          /*原始订单拼接*/
          //res.data.content[i].sourceOrder = res.data.content[i].sourceOrder && res.data.content[i].sourceOrder.orderTypeText +':'+ res.data.content[i].sourceOrder.orderNumber;
          if (res.data.content[i].createdDate.indexOf("T")) {
            res.data.content[i].createdDate = res.data.content[i].createdDate.replace('T', ' ');
          }
          if (res.data.content[i].amount.toString().indexOf('.') < 0) {
            res.data.content[i].amount = res.data.content[i].amount + '.00'
          } else {
            if (res.data.content[i].amount.toString().slice(res.data.content[i].amount.toString().indexOf('.') + 1).length < 2) {
              res.data.content[i].amount = res.data.content[i].amount + '0'
            } else {
              res.data.content[i].amount = res.data.content[i].amount.toString().slice(0, res.data.content[i].amount.toString().indexOf('.') + 3)
            }
          }
        }
        this.refundlist = res.data.content;
        this.total = res.data.totalElements; /*设置总条数*/
        this.loading = false;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    exportCsv(obj) {
      console.log('obj================', obj);
      //title ["","",""]
      var title = obj.title;
      //titleForKey ["","",""]
      var titleForKey = obj.titleForKey;
      var data = obj.data;
      var str = [];
      str.push(obj.title.join(",") + "\n");
      for (var i = 0; i < data.length; i++) {
        var temp = [];
        for (var j = 0; j < titleForKey.length; j++) {
          temp.push(data[i][titleForKey[j]]);
        }
        str.push(temp.join(",") + "\n");
      }
      var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(str.join(""));
      var downloadLink = document.createElement("a");
      downloadLink.href = uri;
      downloadLink.download = "退款订单.csv";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
    exportCsvs() {
      var startAndEndTime = this.condition.startAndEndTimes;
      let url = `${conf.url}/internethospital/api/orders/refund?page-index=1&page-size=1000`;
      if (this.condition.startAndEndTimes) {
        url = `${url}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1]
      }
      if (this.condition.userPhones) {
        url = `${url}&user-phone=${this.condition.userPhones}`
      }
      if (this.condition.hospitalCodes) {
        url = `${url}&organization-code=${this.condition.hospitalCodes}`
      }
      if (this.condition.healerIds) {
        url = `${url}&medical-staff-name=${this.condition.healerIds}`
      }
      if (this.condition.statuss) {
        url = `${url}&full-amount-refund=${this.condition.statuss}`
      }
      ax.get(url, this.header).then(res => {
        for (let i in res.data.content) {
          if (res.data.content[i].amount.toString().indexOf('.') < 0) {
            res.data.content[i].amount = res.data.content[i].amount + '.00'
          } else {
            if (res.data.content[i].amount.toString().slice(res.data.content[i].amount.toString().indexOf('.') + 1).length < 2) {
              res.data.content[i].amount = res.data.content[i].amount + '0'
            } else {
              res.data.content[i].amount = res.data.content[i].amount.toString().slice(0, res.data.content[i].amount.toString().indexOf('.') + 3)
            }
          }
        }
        let content = res.data.content;
        for (let i in content) {
          content[i].sourceOrder = content[i].sourceOrder && content[i].sourceOrder.orderTypeText + ':' + content[i].sourceOrder.orderNumber;
          for (let j in content[i].referencedOrders) {
            content[i].referencedOrders = content[i].referencedOrders[j].orderTypeText + ':' + content[i].referencedOrders[j].orderNumber;
          }

          if (content[i].amount == null || content.amount == "") {
            content[i].amount = "无价格"
          }
          content[i].amount = '￥' + content[i].amount;
          if (content[i].fullAmountRefund == true) {
            content[i].fullAmountRefund = "全额退款"
          } else {
            content[i].fullAmountRefund = "部分退款"
          }
          content[i].orderNumber = content[i].orderNumber + "\t";
          if (content[i].refundOrderId) {
            content[i].refundOrderId = content[i].refundOrderId + "\t";
          }
        }
        let contentData = content;
        this.exportCsv({
          title: ["订单号", "原始订单号", "交易流水号", "退款类型", "医院名称", "科室", "订单状态", "医生/护士姓名", "就诊人姓名", "就诊人电话", "创建时间", "金额"],
          titleForKey: ["orderNumber", "sourceOrder", "refundOrderId", "fullAmountRefund", "organizationText", "departmentText", "statusText", "doctorName", "patientName", "purchaserUsername", "createdDate", "amount"],
          data: contentData,
        })
        this.loading = false;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    resetCondition() {
      this.condition = {
        startAndEndTime: '',
        hospitalCode: '',
        healerId: '',
        status: '',
        userPhone: ''
      }
    },
    resetConditions() {
      this.condition = {
        startAndEndTimes: '',
        hospitalCodes: '',
        healerIds: '',
        statuss: '',
        userPhones: ''
      }
    },
    remoteHospitalMethod(query) {
      if (query) {
        const url = `${conf.url}/internethospital/api/organizations?page-index=1&page-size=1000&text=${query}&type=HOSPITAL`;
        ax.get(url, this.header).then(res => {
          this.hospitalOptions = res.data.content;
        }).catch(err=>{
          this.refreshTokened(err)
        })
      }
    },
    remoteHospitalMethods(query) {
      if (query) {
        const url = `${conf.url}/internethospital/api/organizations?page-index=1&page-size=1000&text=${query}&type=HOSPITAL`;
        ax.get(url, this.header).then(res => {
          this.hospitalOptionss = res.data.content;
        }).catch(err=>{
          this.refreshTokened(err)
        })
      }
    },
    remoteHealerMethod(query) { /*医生模糊查询*/
      if (query) {
        let url = `${conf.url}/internethospital/api/doctors?page-index=1&page-size=1000&name=${query}&sort-method=CONSULTATION_QUANTITY`;
        if (this.condition.hospitalCode) {
          url = `${url}&organization-code=${this.condition.hospitalCode}`;
        }
        if (this.condition.departmentId) {
          url = `${url}&department-id=${this.condition.departmentId}`;
        }
        ax.get(url, this.header).then(res => {
          this.healerOptions = res.data.content;
        }).catch(err=>{
          this.refreshTokened(err)
        })
      }
    },
    remoteDepartmentMethod(query) {
      if (query) {
        let url = `${conf.url}/internethospital/api/departments?page-index=1&page-size=100&text=${query}&type=HOSPITAL_DEPARTMENT`;
        if (this.condition.hospitalCode) {
          url = `${url}&organization-code=${this.condition.hospitalCode}`;
        }
        ax.get(url, this.header).then(res => {
          this.departmentOptions = res.data.content;
        }).catch(err=>{
          this.refreshTokened(err)
        })
      }
    },
    goToDetail(type, orderNumber) {
      sessionStorage.setItem('goToDetail', '1')
      this.$router.push({
        path: '/refund-order-manager/detail',
        query: {
          type: type,
          orderNumber: orderNumber
        }
      });
    },
    jump(headId, typeCode, orderNumber) {
      if (typeCode == 'PRESCRIPTION') { //处方订单
        this.$router.push({
          path: '/presciption-order-manager/detail',
          query: {
            type: 'refund',
            headId: headId,
          }
        });
      } else if (typeCode == 'REFUND') { //退款订单
        this.$router.push({
          path: '/refund-order-manager/detail',
          query: {
            orderNumber: orderNumber
          }
        });
      } else {
        this.$router.push({
          path: '/order-manager/detail',
          query: {
            id: headId,
            type: 'refund',
          }
        });
      }
    }
  }
}

</script>
<style scoped>
.el-row.header {
  height: 50px;
  line-height: 50px;
  border-bottom: solid 1px #409EFF;
}

.el-row.header>.el-col:first-child {
  text-align: left;
}

.el-row.header>.el-col:last-child {
  text-align: right;
}

.el-row.search {
  height: 50px;
  line-height: 50px;
}

.el-row.search>.el-col {
  padding: 0 10px;
  text-align: left;
}

.el-form {
  width: 70%;
  margin: 0 auto;
}

.el-select {
  width: 100%;
}

.el-dialog .el-form-item {
  text-align: left;
}

.color {
  color: #409EFF;
  cursor: pointer;
  text-decoration: underline;
}

</style>
