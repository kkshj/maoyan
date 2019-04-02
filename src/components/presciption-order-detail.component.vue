<template>
  <div>
    <el-row class="header">
      <el-col :span="12"><h4>处方订单信息</h4>
      </el-col>
      <el-col :span="12">
        <el-button type="danger" plain icon="el-icon-back" @click="cancel">返回</el-button>
      </el-col>
    </el-row>
    <el-form ref="prescription" :model="prescription" label-width="140px" :rules="rules" style="width: 70%; margin: 20px auto;">
      <el-form-item label="订单号" prop="orderHeaderNumber">
        <span>{{prescription.orderHeaderNumber}}</span>
      </el-form-item>
      <el-form-item label="交易流水号" prop="orderHeaderNumber">
        <span>{{prescription.payOrderId}}</span>
      </el-form-item>
      <el-form-item label="配送地址" prop="shippingAddress">
        <span v-if="prescription.logistics">{{prescription.logistics.shippingAddress}}</span>
      </el-form-item>
      <el-form-item label="快递公司" prop="expressCompany">
        <span v-if="prescription.logistics">{{prescription.logistics.expressCompany}}</span>
      </el-form-item>
      <el-form-item label="快递单号" prop="expressNumber">
        <span v-if="prescription.logistics">{{prescription.logistics.expressNumber}}</span>
      </el-form-item>
      <el-form-item label="联系人" prop="contactPerson">
        <span v-if="prescription.logistics">{{prescription.logistics.contactPerson}}</span>
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <span v-if="prescription.logistics">{{prescription.logistics.contactPhone}}</span>
      </el-form-item>
      <el-form-item label="推送药房" prop="departmentText">
        <span>{{prescription.pharmacyName}}</span>
      </el-form-item>
      <el-form-item label="所属医院" prop="organizationText">
        <span>{{prescription.organizationText}}</span>
      </el-form-item>
      <el-form-item label="所属科室" prop="departmentText">
        <span>{{prescription.departmentText}}</span>
      </el-form-item>
      <el-form-item label="医生姓名" prop="doctorName">
        <span>{{prescription.doctorName}}</span>
      </el-form-item>
      <el-form-item label="患者姓名" prop="patientName">
        <span>{{prescription.patientName}}</span>
      </el-form-item>
      <el-form-item label="患者电话" prop="patientName">
        <span>{{prescription.patientUsername}}</span>
      </el-form-item>
      <el-form-item label="患者性别" prop="patientGender">
        <span>{{prescription.patientGender === 'LADY' ?  '女' : '男'}}</span>
      </el-form-item>
      <el-form-item label="患者年龄" prop="patientAge">
        <span>{{prescription.patientAge}} 岁</span>
      </el-form-item>
      <el-form-item label="处方总金额" prop="amount">
        <span>￥{{Math.formatFloat(prescription.amount - prescription.freight, 2)}}</span>
      </el-form-item>
      <el-form-item label="配送费" prop="amount">
        <span>￥{{prescription.freight || 0}}</span>
      </el-form-item>
      <el-form-item label="订单状态" prop="statusText">
        <span>{{prescription.statusText}}</span>
      </el-form-item>
      <el-form-item label="开方时间" prop="createdDate">
        <span>{{prescription.createdDate}}</span>
      </el-form-item>
      <el-form-item label="过期时间" prop="expireDate">
        <span>{{prescription.expireDate}}</span>
      </el-form-item>
      <el-form-item label="诊断" prop="diagnosis">
        <span>{{prescription.diagnosis}}</span>
      </el-form-item>
      <el-form-item label="备注" prop="comment">
        <span>{{prescription.comment}}</span>
      </el-form-item>
    </el-form>
    <h4>药品详情</h4>
    <br>
    <el-table :data="prescriptionItems" style="width: 100%">
      <el-table-column align="left" label="药品名" prop="medicineName"></el-table-column>
      <el-table-column align="left" label="药品厂家" prop="medicineManufacturer"></el-table-column>
      <el-table-column align="left" label="药品规格" prop="standard"></el-table-column>
      <el-table-column align="left" label="用法用量" prop="comment">
        <template slot-scope="scope">
          <span>{{scope.row.usageText}} {{scope.row.frequencyText}} 一次{{scope.row.takeQuantity}}{{scope.row.dosageUnitText}} {{scope.row.durationDays}}日</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="配送数量">
        <template slot-scope="scope">
          <span>{{scope.row.shippingQuantity}}{{scope.row.shippingUnitText}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="金额" prop="amount">
        <template slot-scope="scope">
          <span>￥{{scope.row.amount}}</span>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <br>
    <!--退款成功和已退款的不显示退款按钮-->
    <el-button type="primary" v-if="canIVisit('operate', 'PRESCRIPTION_REFUND')" @click="changeOne()" :disabled="payOrderId==null">退款</el-button>
    <el-dialog title="退款信息" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <!--<el-form-item label="剩余可退款金额：" :label-width="formLabelWidth">
          <span>{{form.allAmount}}</span>
        </el-form-item>-->
        <el-form-item label="全额退款" :label-width="formLabelWidth">
          <el-select @change="chooseCode(form.fullAmount)" v-model="form.fullAmount" placeholder="请选择">
            <el-option selected v-for="item in fullAmountOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="退款金额" :label-width="formLabelWidth">
          <el-input type="number" :disabled="form.priceDisabled" v-model="form.amount" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="退款原因" :label-width="formLabelWidth">
          <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 4}" placeholder="请输入退款原因" v-model="form.reason">
          </el-input>
        </el-form-item>
      </el-form>
      <div>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="form.allAmount==='无价格'" @click="sureRefund" v-loading.fullscreen.lock="fullscreenLoading">确认退款</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
Math.formatFloat = function(f, digit) {
  var m = Math.pow(10, digit);
  return Math.round(f * m, 10) / m;
}
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "prescription-detail",
  data() {
    return {
    accout:0,
      type: '',
      payOrderId: '',
      header: '',
      statusText: '',
      prescription: {},
      prescriptionItems: [],
      dialogFormVisible: false,
      orderTypeText: '',
      form: {
        allAmount: '',
        amount: '',
        fullAmount: '', //默认值为全额
        reason: '',
        priceDisabled: false
      },
      fullAmountOptions: [{
        value: 'fullAmount',
        label: '全额退款'
      }, {
        value: 'Amount',
        label: '部分退款'
      }],
      formLabelWidth: '140px',
      rules: {},
      fullscreenLoading: false
    }
  },
  activated() {
    const token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.statusText = this.$route.query.statusText;
    this.type = this.$route.query.type;
    this.payOrderId = this.$route.query.payOrderId;
    this.form.allAmount = this.$route.query.newAmount;
    this.orderTypeText = this.$route.query.orderTypeText;
    this.form.fullAmount = 'fullAmount', //默认值为全额退款
      this.getInfo(this.$route.query.headId);
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
          this.header = { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } };
          _this.getInfo(_this.$route.query.headId)
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
    getInfo(headId) {
      const url = `${conf.url}/internethospital/api/orders/prescriptions/${headId}`;
      ax.get(url, this.header).then(res => {
        if (res.data.amount.toString().indexOf('.') < 0) {
          res.data.amount = res.data.amount + '.00'
        } else {
          if (res.data.amount.toString().slice(res.data.amount.toString().indexOf('.') + 1).length < 2) {
            res.data.amount = res.data.amount + '0'
          } else {
            res.data.amount = res.data.amount.toString().slice(0, res.data.amount.toString().indexOf('.') + 3)
          }
        }
        for (let i in res.data.items) {
          if (res.data.items[i].amount.toString().indexOf('.') < 0) {
            res.data.items[i].amount = res.data.items[i].amount + '.00'
          } else {
            if (res.data.items[i].amount.toString().slice(res.data.items[i].amount.toString().indexOf('.') + 1).length < 2) {
              res.data.items[i].amount = res.data.items[i].amount + '0'
            } else {
              res.data.items[i].amount = res.data.items[i].amount.toString().slice(0, res.data.items[i].amount.toString().indexOf('.') + 3)
            }
          }
        }

        this.prescription = res.data;
        this.prescriptionItems = res.data.items;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    changeOne() {
      this.form.fullAmount = 'fullAmount'; //默认值为全额退款
      this.form.amount = '';
      this.form.reason = '';
      this.dialogFormVisible = true;
      this.chooseCode(this.form.fullAmount);
    },
    chooseCode(value) {
      if (value === 'fullAmount') {
        this.form.priceDisabled = true;
      } else {
        this.form.priceDisabled = false;
      }
    },
    /*确认退款*/
    sureRefund() {
      /*到后台执行退款接口*/
      this.fullscreenLoading = true;
      const url = `${conf.url}/internethospital/api/orders/${this.$route.query.headId}/refund/wechat`;
      /*如果选择的全额退款，退款金额取值传过来的金额，如果为部分退款，取值为用户自定义的值*/
      let data;
      if (this.form.fullAmount === 'fullAmount') { //全额退款
        data = {
          "amount": this.form.allAmount.replace('￥', ''),
          "fullAmount": true,
          "reason": this.form.reason
        }
      } else { //部分退款
        data = {
          "amount": this.form.amount,
          "fullAmount": false,
          "reason": this.form.reason
        }
      }
      ax.post(url, data, this.header).then(res => {
        /*创建成功后，跳转到退款订单详情页，待做！！！！！*/
        this.$message({
          type: 'success',
          message: '退款申请已提交'
        });
        this.goToDetail(res.data.orderNumber)
        this.dialogFormVisible = false;
        this.fullscreenLoading = false;
      }).catch(err => {
        this.refreshTokened(err)
        this.fullscreenLoading = false;
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })

    },
    goToDetail(orderNumber) {
      this.$router.push({
        path: '/refund-order-manager/detail',
        query: {
          orderNumber: orderNumber,
          type: 'refund'
        }
      });
    },
    cancel() {
      this.$router.back(-1);
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

</style>
