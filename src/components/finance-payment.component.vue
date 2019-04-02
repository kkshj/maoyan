<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="5">
        <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="3">
        <el-input placeholder="订单编号" clearable v-model="condition.orderNumber"></el-input>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.payment" placeholder="全部支付" @change="remotestatusMethod">
          <el-option v-for="item in payments" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.bill" placeholder="对账状态">
          <el-option v-for="item in bills" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="success" plain @click='getInfo(1)'>查询</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTime && !condition.orderNumber && !condition.payment && !condition.bill" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class='order_totel'>
      <el-col :span='4'>
        <p>订单总数：{{sum.orderNumber}}</p>
      </el-col>
      <el-col :span='4'>
        <p>订单总金额：{{sum.orderAmount}}元</p>
      </el-col>
      <el-col :span='4'>
        <p>订单差异数：{{sum.orderAbnormalNumber}}</p>
      </el-col>
      <el-col :span='4'>
        <p>订单差异金额：{{sum.orderAbnormalAmount}}</p>
      </el-col>
    </el-row>
    <el-row class='refund_totel'>
      <el-col :span='4'>
        <p>退款订单总数：{{sum.refundOrderNumber}}</p>
      </el-col>
      <el-col :span='4'>
        <p>退款订单总金额：{{sum.refundOrderAmount}}元</p>
      </el-col>
      <el-col :span='4'>
        <p>退款订单差异数：{{sum.refundOrderAbnormalNumber}}</p>
      </el-col>
      <el-col :span='4'>
        <p>退款订单差异金额：{{sum.refundOrderAbnormalAmount}}</p>
      </el-col>
    </el-row>
    <el-table class='tableList' :data="tableData" border style="width: 100%" v-loading='loading'>
      <el-table-column align='center' type="index" label="编号"> </el-table-column>
      <el-table-column align='center' label="流水号" prop='wechatOrderNo'></el-table-column>
      <el-table-column align='center' label="订单号" prop='orderNumber'></el-table-column>
      <el-table-column align='center' label="交易时间" prop='tradingTime'></el-table-column>
      <el-table-column align='center' label="完成时间" prop='endTime'></el-table-column>
      <el-table-column align='center' label="订单金额" prop='orderAmount'></el-table-column>
      <el-table-column align='center' label="支付渠道">
        <template slot-scope="scope">
          <span>{{scope.row.payMethod==='WECHAT' ?  '微信' : scope.row.payMethod==='ALI_PAY'?  '支付宝' : '银联'}}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="对账时间" prop='createdDate'></el-table-column>
      <el-table-column align='center' label="对账状态">
        <template slot-scope="scope">
          <span>{{scope.row.wechatOrderBillStatus==='ABNORMAL' ?  '异常' : scope.row.wechatOrderBillStatus==='CHECK'?  '已对账' : scope.row.wechatOrderBillStatus==='NOT_CHECK'?  '未对账' : ''}}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="操作">
        <template slot-scope="scope">
          <el-button type="success" plain @click="handleEdit(scope.$index, scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br />
    <el-pagination background layout="prev, pager, next" :current-page="currentPage" :total="total" @current-change="getInfo">
    </el-pagination>
  </div>
</template>
<script type="text/javascript">
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  data() {
    return {
      accout:0,
      currentPage: 1,
      total: 0,
      loading: false,
      header: '',
      token: '',
      sum: '',
      condition: {
        startAndEndTime: '',
        orderNumber: '',
        payment: '',
        bill: ''
      },
      tableData: [],
      payments: [
        { value: '', label: '全部' },
        { value: 'WECHAT', label: '微信' },
        { value: 'ALI_PAY', label: '支付宝' },
        { value: 'CMB_PAY', label: '银联' },

      ],
      bills: [
        { value: '', label: '全部' },
        { value: 'CHECK', label: '已对账' },
        { value: 'NOT_CHECK', label: '未对账' },
        { value: 'ABNORMAL', label: '异常' },

      ],
    }
  },
  activated() {
    this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.loading = true;
    this.getInfo(1);
    this.orderSum()
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
          _this.getInfo(1)
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },
    //查询
    getInfo(currentPage) {
       this.loading = true;
      this.currentPage = currentPage
      /*加载订单数据*/
      let url = `${conf.url}/internethospital/api/wechatBills/?page-index=${currentPage}&page-size=10`;
      if (this.condition.startAndEndTime) {
        var startAndEndTime = this.condition.startAndEndTime;
        url = `${url}&start-time=` + startAndEndTime[0] + `&end-time=` + startAndEndTime[1];
      }
      if (this.condition.orderNumber) {
        url = `${url}&order-number=${this.condition.orderNumber}`
      }
      if (this.condition.payment) {
        url = `${url}&payMethod=${this.condition.payment}`
      }

      if (this.condition.bill) {
        url = `${url}&wechat-order-bill-status=${this.condition.bill}`
      }
      /*向后台获取数据*/
      ax.get(url, this.header).then(res => {
        console.log(res)
        this.tableData = res.data.content;
        this.total = res.data.totalElements; /*设置总条数*/
        this.loading = false;
      }).catch(err => {
        console.log(err);
        this.refreshTokened(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    //订单总数
    orderSum() {
      const url = `${conf.url}/internethospital/api/wechatBills/wechat-statistic`
      ax.get(url, this.header).then(res => {

        this.sum = res.data
        console.log(this.sum)
      }).catch(err => {
        console.log(err)
      })
    },
    //详情
    handleEdit(index, row) {
      console.log(index, row);
    },
    //下拉框改变状态
    remotestatusMethod() {
      console.log('55', this.condition.payment)
    },
    //重置
    resetCondition() {
      this.condition = {
        startAndEndTime: '',
        orderNumber: '',
        payment: '',
        bill: ''

      }

    }
  }
}

</script>
<style type="text/css" scoped>
.el-row.order_totel>.el-col p,
.el-row.refund_totel>.el-col p {
  font-size: 20px;
  font-weight: bold;
  padding-top: 30px;
  text-align: left;
}

.tableList {
  margin-top: 20px;
}

</style>
