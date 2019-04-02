<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>处方订单管理</h4>
      </el-col>
      <el-col :span="6">
        <!--<el-button type="primary" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加订单</el-button>-->
      </el-col>
    </el-row>
    <el-row class="search">
      <el-col :span="7.5">
        <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
        </el-date-picker>
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
        <el-select v-model="condition.departmentId" filterable remote placeholder="科室名称" :remote-method="remoteDepartmentMethod">
          <el-option v-for="item in departmentOptions" :key="item.id" :label="item.text" :value="item.id" v-if="item.parentId">
            <span style="float: left">{{ item.text }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-select v-model="condition.healerId" filterable remote placeholder="医生/护师姓名" :remote-method="remoteHealerMethod">
          <el-option v-for="item in healerOptions" :key="item.doctorId" :label="item.doctorName" :value="item.doctorId">
            <span style="float: left">{{ item.doctorName}}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.status" placeholder="订单状态">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="success" plain @click="getInfo(1)">搜索</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTime&&!condition.departmentId&&!condition.hospitalCode && !condition.healerId && !condition.status && !condition.userPhone" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class="search" v-if="canIVisit('operate', 'PRESCRIPTION_EXPORT')">
      <el-col :span="9.5">
        <div class="block">
          <span class="demonstration">导出处方订单详情报表：</span>
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.exportStartAndEndTimes" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.hospitalCodess" filterable remote placeholder="医院" :remote-method="remoteHospitalMethodss">
          <el-option v-for="item in exHospitalOptionss" :key="item.id" :label="item.text" :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain @click="exportCsvss()">导出详情</el-button>
        <el-button type="danger" plain :disabled="!condition.exportStartAndEndTimes && !condition.hospitalCodess" @click="resetConditions()">重置</el-button>
      </el-col>
    </el-row>
    <el-table :data="prescriptionlist" v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" prop="orderHeaderNumber" label="订单号"></el-table-column>
      <el-table-column align="left" prop="payOrderId" label="交易流水号"></el-table-column>
      <el-table-column align="left" prop="organizationText" label="所属医院"></el-table-column>
      <el-table-column align="left" prop="departmentText" label="所属科室"></el-table-column>
      <el-table-column align="left" prop="pharmacyName" label="推送药房"></el-table-column>
      <el-table-column align="left" prop="doctorName" label="医生/护师姓名"></el-table-column>
      <el-table-column align="left" prop="patientName" label="就诊人姓名"></el-table-column>
      <el-table-column align="left" prop="patientUsername" label="就诊人电话"></el-table-column>
      <el-table-column align="left" prop="patientAge" label="就诊人年龄"></el-table-column>
      <!--<el-table-column align="left" prop="patientGender" label="患者性别">
        <template slot-scope="scope">
          <span>{{scope.row.patientGender==='MAN' ? '男' : '女'}}</span>
        </template>
      </el-table-column>-->
      <el-table-column align="left" prop="createdDate" label="开方时间"></el-table-column>
      <!--<el-table-column align="left" :show-overflow-tooltip="true" prop="diagnosis" label="诊断"></el-table-column>
      <el-table-column align="left" :show-overflow-tooltip="true" prop="comment" label="备注"></el-table-column>-->
      <el-table-column header-align="left" align="right" label="处方总金额">
        <template slot-scope="scope">
          <span>￥{{scope.row.amount}}</span>
        </template>
      </el-table-column>
      <el-table-column header-align="left" align="center" prop="statusText" label="订单状态"></el-table-column>
      <!--<el-table-column align="left" prop="completed" label="是否结束"></el-table-column>-->
      <el-table-column align="left" width="380px" label="操作" v-if="canIVisit('operate', 'PRESCRIPTION_CONFIRM') || canIVisit('operate', 'PRESCRIPTION_DELETE') || canIVisit('operate', 'PRESCRIPTION_READ')">
        <template slot-scope="scope">
          <el-button size="mini" v-if="canIVisit('operate', 'PRESCRIPTION_CONFIRM')" type="success" :disabled="!(scope.row.statusCode === 'SIGNED' && scope.row.orderTypeCode === 'STANDARD_PRESCRIPTION')" plain @click="confirmPrescription(scope.row.orderHeaderId)">审核处方</el-button>
          <el-button size="mini" v-if="canIVisit('operate', 'PRESCRIPTION_DELETE')" type="danger" :disabled="!(scope.row.statusCode === 'SIGNED' || scope.row.statusCode === 'CREATED' || scope.row.statusCode === 'REJECTED')" plain @click="deleteRow(scope.row.orderHeaderId)">删除</el-button>
          <el-button size="mini" v-if="canIVisit('operate', 'PRESCRIPTION_READ')" type="success" plain @click="goToDetail('check', scope.row)">查看详情</el-button>
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
      isHospital: false,
      currentPage: 1, //默认开始页面
      total: 0, //默认数据总数
      loading: false,
      condition: {
        hospitalCode: '',
        healerId: '',
        status: '',
        userPhone: '',
        startAndEndTime: '',
        departmentId: '',

        startAndEndTimes: '',
        userPhones: '',
        departmentIds: '',
        hospitalCodes: '',
        healerIds: '',
        statuss: '',

        hospitalCodess: '',
        exportStartAndEndTimes: '',
      },
      prescriptionlist: [],
      addOne: false,
      delivery: {},
      hospitalOptions: [],
      hospitalOptionss: [],
      departmentOptions: [],
      departmentOptionss: [],
      exHospitalOptionss: [],
      healerOptions: [],
      healerOptionss: [],
      statusOptions: [
        { value: 'CREATED', label: '已创建' },
        { value: 'SIGNED', label: '已签章' },
        { value: 'AUDITED', label: '已审方' },
        { value: 'PAYED', label: '已支付' },
        { value: 'SHIPPED', label: '已配送' },
        { value: 'REFUNDED', label: '已退款' },
        { value: 'EXPIRED', label: '已过期' },
      ],
      statusOptionss: [
        { value: 'CREATED', label: '已创建' },
        { value: 'SIGNED', label: '已签章' },
        { value: 'AUDITED', label: '已审方' },
        { value: 'PAYED', label: '已支付' },
        { value: 'SHIPPED', label: '已配送' },
        { value: 'REFUNDED', label: '已退款' },
        { value: 'EXPIRED', label: '已过期' },
      ],
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
      this.currentPage = currentPage;
      /*加载订单数据*/
      let url = `${conf.url}/internethospital/api/orders/prescriptions?page-index=${currentPage}&page-size=10`;
      if (this.condition.startAndEndTime) {
        var startAndEndTime = this.condition.startAndEndTime;
        url = `${url}&start-date=` + startAndEndTime[0] + ' 00:00:00' + `&end-date=` + startAndEndTime[1] + ' 23:59:59';
      }
      if (this.condition.hospitalCode) {
        url = `${url}&organization-code=${this.condition.hospitalCode}`
      }
      if (this.condition.departmentId) {
        url = `${url}&department-id=${this.condition.departmentId}`;
      }
      if (this.condition.healerId) {
        if (this.healerOptions.find(h => h.doctorId === this.condition.healerId)) {
          url = `${url}&doctor-id=${this.condition.healerId}`
        }
      }
      if (this.condition.status) {
        url = `${url}&status=${this.condition.status}`;
        if (this.condition.status === 'PAYED') {
          url = `${url}&status=PUSH_FAILED&status=PUSH_SUCCEED`;
        }
      }
      if (this.condition.userPhone) {
        url = `${url}&user-phone=${this.condition.userPhone}`
      }
      /*向后台获取数据*/
      ax.get(url, this.header).then(res => {
        for (let i in res.data.content) {
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
        this.prescriptionlist = res.data.content;
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
      downloadLink.download = "处方订单.csv";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
    exportCsvs() {
      var startAndEndTime = this.condition.startAndEndTimes;
      let url = `${conf.url}/internethospital/api/orders/prescriptions?page-index=1&page-size=1000`;
      if (this.condition.startAndEndTimes) {
        url = `${url}&start-date=` + startAndEndTime[0] + ' 00:00:00' + `&end-date=` + startAndEndTime[1] + ' 23:59:59';
      }
      if (this.condition.hospitalCodes) {
        url = `${url}&organization-code=${this.condition.hospitalCodes}`
      }
      if (this.condition.userPhones) {
        url = `${url}&user-phone=${this.condition.userPhones}`
      }
      if (this.condition.departmentIds) {
        url = `${url}&department-id=${this.condition.departmentIds}`;
      }
      if (this.condition.healerIds) {
        if (this.healerOptionss.find(h => h.doctorId === this.condition.healerIds)) {
          url = `${url}&doctor-id=${this.condition.healerIds}`
        }
      }
      if (this.condition.statuss) {
        url = `${url}&status=${this.condition.statuss}`
      }
      ax.get(url, this.header).then(res => {
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
          content[i].orderHeaderNumber = content[i].orderHeaderNumber + "\t";
          if (content[i].payOrderId) {
            content[i].payOrderId = content[i].payOrderId + "\t";
          }
        }
        let contentData = content;
        this.exportCsv({
          title: ["订单号", "交易流水号", "医院名称", "科室", "医生/护士姓名", "患者姓名", "患者电话", "患者年龄", "开方时间", "诊断", "处方总金额", "状态文本"],
          titleForKey: ["orderHeaderNumber", "payOrderId", "organizationText", "departmentText", "doctorName", "patientName", "patientUsername", "patientAge", "createdDate", "diagnosis", "amount", "statusText"],
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
    exportCsvss() {
      var startAndEndTime = this.condition.exportStartAndEndTimes;
      let url = `${conf.url}/internethospital/api/orders/prescriptions/details-report?`;
      if (this.condition.exportStartAndEndTimes) {
        url = `${url}&start-date=` + startAndEndTime[0] + ' 00:00:00' + `&end-date=` + startAndEndTime[1] + ' 23:59:59';
      }
      if (this.condition.hospitalCodess) {
        url = `${url}&organization-code=${this.condition.hospitalCodess}`
      }
      console.log(this.sheetConditions)
      let form = document.createElement('FORM');
      form.method = 'POST';
      form.action = url;
      document.body.appendChild(form);
      form.submit();
      form.onsubmit = e => {
        console.log(1);
        console.log(e)
      }
    },
    resetCondition() {
      this.condition = {
        startAndEndTime: '',
        hospitalCode: '',
        healerId: '',
        departmentIds: '',
        status: '',
        userPhone: ''
      }
    },
    resetConditions() {
      this.condition = {
        startAndEndTimes: '',
        hospitalCodes: '',
        healerIds: '',
        departmentIds: '',
        statuss: '',
        userPhones: '',
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
    remoteHospitalMethodss(query) {
      if (query) {
        const url = `${conf.url}/internethospital/api/organizations?page-index=1&page-size=1000&text=${query}&type=HOSPITAL`;
        ax.get(url, this.header).then(res => {
          this.exHospitalOptionss = res.data.content;
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
    remoteHealerMethods(query) { /*导出医生模糊查询*/
      if (query) {
        let url = `${conf.url}/internethospital/api/doctors?page-index=1&page-size=1000&name=${query}&sort-method=CONSULTATION_QUANTITY`;
        if (this.condition.hospitalCodes) {
          url = `${url}&organization-id=${this.condition.hospitalCodes}`;
        }
        if (this.condition.departmentIds) {
          url = `${url}&department-id=${this.condition.departmentIds}`;
        }
        ax.get(url, this.header).then(res => {
          this.healerOptionss = res.data.content;
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
        }).catch(errr=>{
          this.refreshTokened(err)
        })
      }
    },
    remoteDepartmentMethods(query) {
      if (query) {
        let url = `${conf.url}/internethospital/api/departments?page-index=1&page-size=100&text=${query}&type=HOSPITAL_DEPARTMENT`;
        if (this.condition.hospitalCodes) {
          url = `${url}&organization-code=${this.condition.hospitalCodes}`;
        }
        ax.get(url, this.header).then(res => {
          this.departmentOptionss = res.data.content;
        }).catch(err=>{
          this.refreshTokened(err)
        })
      }
    },
    deleteRow(orderHeaderId) {

      this.$confirm('删除当前订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const url = `${conf.url}/internethospital/api/orders/prescriptions/${orderHeaderId}`;
        ax.delete(url, this.header).then(res => {
          this.getInfo(this.currentPage)
        }).catch(err => {
          this.refreshTokened(err)
          console.log(err)
          this.$message({
            message:err.response.data.message,
            type: 'warning'
          });
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '操作取消'
        });
      })
    },
    confirmPrescription(orderHeaderId) {
      let user = JSON.parse(localStorage.getItem('userInfo'));
      console.log(user)
      if (user.roles.find(r => r === 'pharmacist' || r === 'admin')) {
        this.$confirm('是否确认审核通过处方？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          const url = `${conf.url}/internethospital/api/orders/${orderHeaderId}/statuses/CONFIRMED`;
          ax.post(url, {}).then(res => {
            this.$message({
              type: 'success',
              message: '审核已通过'
            });
            this.getInfo(this.currentPage);
          }).catch(err => {
            this.refreshTokened(err)
            console.log(err);
            this.$message({
              type: 'warning',
              message: err.response.data.message || err.response.data
            });
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });
        });
      } else {
        this.$message({
          type: 'info',
          message: '无操作权限'
        });
      }
    },
    goToDetail(type, row) {
      sessionStorage.setItem('goToDetail', '1')
      this.$router.push({
        path: '/presciption-order-manager/detail',
        query: {
          type: type,
          headId: row.orderHeaderId,
          statusText: row.statusText,
          newAmount: row.amount,
          orderTypeText: row.orderTypeText,
          payOrderId: row.payOrderId
        }
      });
    },
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

</style>
