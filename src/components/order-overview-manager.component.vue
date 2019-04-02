<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>订单总览</h4>
      </el-col>
      <el-col :span="6">
        <!--<el-button type="primary" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加订单</el-button>-->
      </el-col>
    </el-row>
    <el-row class="search">
      <el-col :span="6">
        <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="订单号" clearable v-model="condition.orderNumber"></el-input>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="就诊人电话" clearable v-model="condition.userPhone"></el-input>
      </el-col>
      <el-col :span="3" v-if="!isHospital">
        <el-select v-model="condition.hospitalCode" filterable remote placeholder="医院名称" :remote-method="remoteHospitalMethod">
          <el-option v-for="item in hospitalOptions" :key="item.id" :label="item.text" :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <!--<el-select-->
        <!--v-model="condition.healerId"-->
        <!--filterable-->
        <!--remote-->
        <!--placeholder="医生/护士姓名"-->
        <!--:remote-method="remoteHealerMethod">-->
        <!--<el-option-->
        <!--v-for="item in healerOptions"-->
        <!--:key="item.doctorId || item.nurseId"-->
        <!--:label="item.doctorName || item.nurseName"-->
        <!--:value="item.doctorName || item.nurseName">-->
        <!--<span style="float: left">{{ item.doctorName || item.nurseName }}</span>-->
        <!--<span style="float: left; color: #8492a6; font-size: 10px; margin-left:5px;">{{ item.doctorName ? '医生' : item.nurseName ? '护士' : ''}}</span>-->
        <!--<span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>-->
        <!--</el-option>-->
        <!--</el-select>-->
        <el-input placeholder="医生/护师姓名" clearable v-model="condition.doctorName || condition.nurseName"></el-input>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.type" placeholder="订单类型" @change="remotestatusMethod">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select :disabled="!condition.type" v-model="condition.status" placeholder="订单状态">
          <el-option v-for="item in statusOptions" :key="item.code" :label="item.text" :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="success" plain @click="getInfo(1)">搜索</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTime && !condition.type && !condition.status && !condition.orderNumber && !condition.hospitalCode && !condition.nurseName && !condition.doctorName && !condition.userPhone" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class="searchs" v-if="canIVisit('operate', 'OVERVIEW_EXPORT')">
      <el-col :span="9">
        <div class="block">
          <span class="demonstration">导出区间：</span>
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTimes" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="订单号" clearable v-model="condition.orderNumbers"></el-input>
      </el-col>
      <el-col :span="2" v-if="!isHospital">
        <el-select v-model="condition.hospitalCodes" filterable remote placeholder="医院" :remote-method="remoteHospitalMethod">
          <el-option v-for="item in hospitalOptions" :key="item.id" :label="item.text" :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="condition.healerIds" filterable remote placeholder="医生/护士姓名" :remote-method="remoteHealerMethod">
          <el-option v-for="item in healerOptions" :key="item.doctorId || item.nurseId" :label="item.doctorName || item.nurseName" :value="item.doctorName || item.nurseName">
            <span style="float: left">{{ item.doctorName || item.nurseName }}</span>
            <span style="float: left; color: #8492a6; font-size: 10px; margin-left:5px;">{{ item.doctorName ? '医生' : item.nurseName ? '护士' : ''}}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="condition.statuss" placeholder="订单类型">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="primary" plain @click="exportCsvs()">导出</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTimes && !condition.statuss && !condition.orderNumbers && !condition.hospitalCodes && !condition.healerIds" @click="resetConditions()">重置</el-button>
      </el-col>
    </el-row>
    <el-table :data="orderViewList" v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" prop="orderNumber" label="订单号"></el-table-column>
      <el-table-column align="left" prop="payOrderId" label="交易流水号">
        <template slot-scope="scope">
          <span>{{scope.row.orderTypeCode==='REFUND'? scope.row.refundOrderId : scope.row.payOrderId}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="orderTypeText" label="订单类型"></el-table-column>
      <el-table-column align="left" prop="statusText" label="订单状态"></el-table-column>
      <el-table-column align="left" prop="referencedOrders" label="被参照创建订单">
        <template slot-scope="scope">
          <div v-for="item in scope.row.referencedOrders">
            <div>{{item.orderTypeText}}:<a class="color" @click="jumpRefund(item.orderNumber,item.orderTypeCode,item)">{{item.orderNumber}}</a></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="sourceOrder" label="原始订单">
        <template slot-scope="scope">
          <div v-if="scope.row.sourceOrder">{{scope.row.sourceOrder.orderTypeText}}:<a class="sourceOrderClass" @click="jump(scope.row.sourceOrder.id,scope.row.sourceOrder.orderTypeCode,scope.row.sourceOrder.orderNumber)">{{scope.row.sourceOrder.orderNumber}}</a></div>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="organizationText" label="所属医院"></el-table-column>
      <el-table-column align="left" prop="departmentText" label="所属科室"></el-table-column>
      <el-table-column align="left" label="医生/护师姓名">
        <template slot-scope="scope">
          <span>{{scope.row.doctorName||scope.row.nurseName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="patientName" label="就诊人姓名"></el-table-column>
      <el-table-column align="left" prop="purchaserUsername" label="就诊人电话"></el-table-column>
      <el-table-column align="left" prop="createdDate" label="创建时间"></el-table-column>
      <el-table-column header-align="center" align="right" prop="amount" label="金额"></el-table-column>
      <!--<el-table-column align="left" prop="payMethod" label="支付方式"></el-table-column>-->
      <el-table-column align="left" width="140px" label="操作" v-if="canIVisit('operate', 'OVERVIEW_DETAIL')">
        <template slot-scope="scope">
          <el-button size="mini" type="success" plain @click="goToDetail(scope.row.orderTypeCode, scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--layout代表组件布局，子组件名用逗号分隔
        属性： total代表总条目数
        事件： current-change用于监听页数改变，而内容也发生改变-->
    <div class="block">
      <br>
      <el-pagination background layout="prev, pager, next" :total="total" :currentPage="currentPage" @current-change="getInfo">
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
      accout: 0,
      isHospital: false,
      currentPage: 1, //默认开始页面
      total: 0, //默认数据总数
      loading: false,
      str: '',
      exprotList: [],
      condition: {
        status: '',
        orderNumber: '',
        hospitalCode: '',
        doctorName: '',
        nurseName: '',
        userPhone: '',
        startAndEndTime: '',
        type: '',
        startAndEndTimes: '',
        orderNumbers: '',
        hospitalCodes: '',
        healerIds: '',
        statuss: '',
      },
      orderViewList: [],
      addOne: false,
      delivery: {},
      hospitalOptions: [],
      statusOptions: [],
      healerOptions: [],
      sourceOrderUrl: '',
      referencedOrdersUrl: '',
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
      typeOptions: [
        { value: '', label: '全部' },
        { value: 'CONSULT', label: '网络咨询' },
        { value: 'CONSULT_FREE', label: '义诊订单' },
        { value: 'PRESCRIPTION', label: '处方订单' },
        { value: 'E_PRESCRIPTION', label: '自助电子处方订单' },
        { value: 'REFUND', label: '退款订单' }
      ]
    }
  },
  activated() {
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
          _this.header = { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } };
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
      console.log(this.condition.hospitalCode);
      this.currentPage = currentPage;
      /*加载订单数据*/
      let startAndEndTime = this.condition.startAndEndTime;
      let url = `${conf.url}/internethospital/api/orders/?page-index=${currentPage}&page-size=10`;
      if (this.condition.startAndEndTime) {
        url = `${url}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1]
      }
      if (this.condition.orderNumber) {
        url = `${url}&order-number=${this.condition.orderNumber}`
      }
      if (this.condition.hospitalCode) {
        url = `${url}&organization-code=${this.condition.hospitalCode}`
      }
      if (this.condition.doctorName || this.condition.nurseName) {
        url = `${url}&medical-staff-name=${this.condition.doctorName || this.condition.nurseName}`
      }
      if (this.condition.userPhone) {
        url = `${url}&user-phone=${this.condition.userPhone}`
      }
      if (this.condition.type) {
        url = `${url}&order-type-code=${this.condition.type}`
      }
      if (this.condition.status) {
        url = `${url}&statuses=${this.condition.status}`
      }
      /*向后台获取数据*/
      ax.get(url, this.header).then(res => {
        let content = res.data.content;
        for (let i in content) {
          /*原始订单拼接*/
          //content[i].sourceOrder = content[i].sourceOrder && content[i].sourceOrder.orderTypeText +':'+ content[i].sourceOrder.orderNumber;
          /*被参照创建订单拼接*/
          /*for (let j in content[i].referencedOrders) {
            content[i].referencedOrders = content[i].referencedOrders[j].orderTypeText + ':' + content[i].referencedOrders[j].orderNumber;
          }*/

          if (content[i].amount === null || content.amount === "") {
            content[i].amount = "无价格"
          } else {
            if (content[i].amount.toString().indexOf('.') < 0) {
              content[i].amount = content[i].amount + '.00'
            } else {
              if (content[i].amount.toString().slice(content[i].amount.toString().indexOf('.') + 1).length < 2) {
                content[i].amount = content[i].amount + '0'
              } else {
                content[i].amount = content[i].amount.toString().slice(0, content[i].amount.toString().indexOf('.') + 3)
              }
            }
            content[i].amount = '￥' + content[i].amount;
          }
        }
        this.orderViewList = content;
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
    resetCondition() {
      this.condition = {
        orderNumber: '',
        hospitalCode: '',
        healerId: '',
        status: '',
        userPhone: '',
        startAndEndTime: ''
      }
    },
    resetConditions() {
      this.condition = {
        orderNumbers: '',
        hospitalCodes: '',
        healerIds: '',
        statuss: '',
        startAndEndTimes: ''
      }
    },

    exportCsv(obj) {
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
      downloadLink.download = "订单管理.csv";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
    exportCsvs() {
      var startAndEndTime = this.condition.startAndEndTimes;
      let url = `${conf.url}/internethospital/api/orders/?page-index=1&page-size=1000`;
      if (this.condition.startAndEndTimes) {
        url = `${url}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1]
      }
      if (this.condition.orderNumbers) {
        url = `${url}&order-number=${this.condition.orderNumbers}`
      }
      if (this.condition.hospitalCodes) {
        url = `${url}&organization-code=${this.condition.hospitalCodes}`
      }
      if (this.condition.healerIds) {
        url = `${url}&medical-staff-name=${this.condition.healerIds}`
      }
      if (this.condition.statuss) {
        url = `${url}&order-type-code=${this.condition.statuss}`
      }
      ax.get(url, this.header).then(res => {
        let content = res.data.content;
        // let strs = '';
        for (let i in content) {
          let str = '';
          content[i].sourceOrder = content[i].sourceOrder && content[i].sourceOrder.orderTypeText + ':' + content[i].sourceOrder.orderNumber;

          // for(let j in content[i].sourceOrder){
          //   strs +=  content[i].sourceOrder[j] && content[i].sourceOrder[j].orderTypeText + ':' + content[i].sourceOrder[j].orderNumber + "|";
          //   // content[i].referencedOrders = content[i].referencedOrders[j].orderTypeText + ':' + content[i].referencedOrders[j].orderNumber;
          //   content[i].sourceOrder[j] = strs;
          // }

          //拼接参照订单
          for (let j in content[i].referencedOrders) {
            str += content[i].referencedOrders[j].orderTypeText + ':' + content[i].referencedOrders[j].orderNumber + '|';
            // str +=  content[i].referencedOrders[j] && content[i].referencedOrders[j].orderTypeText + ':' + content[i].referencedOrders[j].orderNumber + "|";
            // content[i].referencedOrders = content[i].referencedOrders[j].orderTypeText + ':' + content[i].referencedOrders[j].orderNumbe
          }
          console.log(content[i])
          console.log(str)
          content[i].referencedOrders = str;
          if (content[i].amount == null || content.amount == "") {
            content[i].amount = "无价格"
          }
          content[i].amount = '￥' + content[i].amount;
          content[i].orderNumber = content[i].orderNumber + "\t";
          if (content[i].payOrderId) {
            content[i].payOrderId = content[i].payOrderId + "\t";
          }
        }
        let contentData = content;
        this.exportCsv({
          title: ["订单号", "交易流水号", "订单类型", "订单状态", "被参照创建订单", "原始订单", "所属医院", "所属科室", "医生/护士姓名", "就诊人姓名", "就诊人电话", "创建时间", "金额"],
          titleForKey: ["orderNumber", "payOrderId", "orderTypeText", "statusText", "referencedOrders", "sourceOrder", "organizationText", "departmentText", "doctorName", "patientName", "purchaserUsername", "createdDate", "amount"],
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

    remotestatusMethod(query) {
      if (query != "INSPECTION" || "E_PRESCRIPTION") {
        query = query + "_STATUS";
        console.log("condition.type*******", query);
        const url = `${conf.url}/internethospital/api/status-profiles/${query}`;
        ax.get(url, this.header).then(res => {
          this.statusOptions = res.data.details;
          // this.condition.status = '';
          console.log("statusOptions#########", this.statusOptions);
        })
      }

      // if (condition.type){
      //   const url = `${conf.url}/internethospital/api/status-profiles/${condition.type}`;
      //   ax.get(url,this.header).then(res =>{
      //     this.statusOptions = res.data.content;
      //   })
      // }



    },
    remoteHospitalMethod(query) {
      if (query) {
        const url = `${conf.url}/internethospital/api/organizations?page-index=1&page-size=1000&text=${query}&type=HOSPITAL`;
        ax.get(url, this.header).then(res => {
          this.hospitalOptions = res.data.content;
        })
      }
    },
    remoteHealerMethod(query) {
      if (query) {
        const urlDoctor = `${conf.url}/internethospital/api/doctors?page-index=1&page-size=1000&name=${query}&sort-method=CONSULTATION_QUANTITY`;
        ax.get(urlDoctor).then(res => {
          const urlNurse = `${conf.url}/internethospital/api/nurses?page-index=1&page-size=1000&name=${query}&sort-method=CONSULTATION_QUANTITY`;
          ax.get(urlNurse).then(resp => {
            this.healerOptions = resp.data.content.concat(res.data.content);
          })
        })
      }
    },
    goToDetail(code, row) {
      sessionStorage.setItem('goToDetail', '1')
      if (code == 'PRESCRIPTION' || code == 'E_PRESCRIPTION') { //处方订单
        this.$router.push({
          path: '/presciption-order-manager/detail',
          query: {
            type: 'check',
            headId: row.id,
            statusText: row.statusText,
            newAmount: row.amount,
            orderTypeText: row.orderTypeText,
            payOrderId: row.payOrderId
          }
        });
      } else if (code == 'REFUND') { //退款订单
        this.$router.push({
          path: '/refund-order-manager/detail',
          query: {
            type: 'check',
            orderNumber: row.orderNumber
          }
        });
      } else {
        this.$router.push({
          path: '/order-manager/detail',
          query: {
            id: row.id,
            healerId: row.doctorId || row.nurseId,
            statusText: row.statusText,
            newAmount: row.amount,
            orderTypeText: row.orderTypeText,
            payOrderId: row.payOrderId
          }
        });
      }
    },
    jumpRefund(orderNumber, orderTypeCode, item) { //点击跳转页面
      console.log(item)
      if (orderTypeCode == 'PRESCRIPTION' || orderTypeCode == 'E_PRESCRIPTION') { //处方订单
        this.$router.push({
          path: '/presciption-order-manager/detail',
          query: {
            type: 'check',
            headId: item.id,
          }
        });
      } else if (orderTypeCode == 'REFUND') { //退款订单
        this.$router.push({
          path: '/refund-order-manager/detail',
          query: {
            type: 'check',
            orderNumber: orderNumber
          }
        });
      } else {
        this.$router.push({
          path: '/order-manager/detail',
          query: {
            id: row.id,
            healerId: row.doctorId || row.nurseId,
            statusText: row.statusText,
            newAmount: row.amount,
            orderTypeText: row.orderTypeText,
            payOrderId: row.payOrderId
          }
        });
      }
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
            type: 'check',
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

.el-row.searchs>.el-col {
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

.sourceOrderClass {
  color: #409EFF;
  cursor: pointer;
  text-decoration: underline;
}

</style>
