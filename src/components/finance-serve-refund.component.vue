<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="3">
        <el-input placeholder="订单编号" clearable v-model="condition.orderNumber"></el-input>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.refundMethod" placeholder="支付渠道" @change="remotestatusMethod">
          <el-option v-for="item in payments" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="8">
 <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </div>       
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.statusText" placeholder="退款状态">
          <el-option v-for="item in refunds" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
     
      <el-col :span="3">
        <el-button type="success" plain @click='getInfo(1)'>搜索</el-button>
        <el-button type="danger" plain :disabled="!condition.payTime && !condition.orderNumber && !condition.payment && !condition.refund&&condition.reconciliationTime" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class='refund_totel'>
      <el-col :span='7'>
        <el-button type="primary" plain size="medium" @click="search()">全部订单：{{total}}</el-button>
        <el-button type="primary" plain size="medium" @click="search()">待处理：{{num}}</el-button>
      </el-col>
    </el-row>
    <el-table ref="multipleTable" tooltip-effect="light" class='tableList' :data="tableData" border style="width: 100%" v-loading='loading'>
      <el-table-column align='center' type="index" label="编号"> </el-table-column>
      <el-table-column align='center' label="订单号" prop='sourceOrder.orderNumber'></el-table-column>
      <el-table-column align='center' label="订单金额" prop='sourceOrder.amount'></el-table-column>
      <el-table-column align='center' label="订单状态" prop='sourceOrder.statusText'></el-table-column>
      <el-table-column align='center' label="支付渠道" prop='refundMethod'>
        <template slot-scope="scope">
          <span>{{scope.row.refundMethod=='WECHAT'?'微信':'支付宝'}}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="支付时间" prop='sourceOrder.createDate'></el-table-column>
      <el-table-column align='center' label="退款人员" prop='createdBy'></el-table-column>
      <el-table-column align='center' label="退款时间" prop='createdDate'></el-table-column>
      <el-table-column align='center' label="退款状态" prop='statusText'></el-table-column>
      <el-table-column align='center' label="退款编号" prop='orderNumber'></el-table-column>
      <el-table-column align='center' label="退款金额" prop='amount'></el-table-column>
      <el-table-column align='center' label="操作">
        <template align='center' slot-scope="scope">
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
      num: 8,
      currentPage: 1,
      total: 0,
      token: '',
      header:'',
      loading: false,
      multipleSelection: [],
      condition: {
        startAndEndTime: '',
        orderNumber: '',
        refundMethod: '',
        statusText: '',

      },
      tableData: [],
      payments: [
        { value: '', label: '全部' },
        { value: 'WECHAT', label: '微信' },
        { value: 'ALI_PAY', label: '支付宝' },

      ],
      refunds: [
        { value: '', label: '退款状态' },
        { value: 'REFUNDING', label: '退款中' },
        { value: 'REFUNDED', label: '已退款' },
        { value: 'REJECTED', label: '已拒绝' },


      ],
    }
  },
activated() {
    this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.loading = false;
    this.getInfo(1);
  },
  methods: {
    getInfo(currentPage) {
      this.currentPage = currentPage
      let status=`statuses=REFUND_SUCCEED&statuses=CREATED&statuses=DOCTOR_COMPLETED&statuses=CANCEL&statuses=AUTO_COMPLETED&statuses=PUSH_FAILED&statuses=PAYED&statuses=REFUNDED&statuses=SHIPPED&statuses=PUSH_SUCCEED&statuses=AUDITED&statuses=SIGNED&statuses=REFUNDING&statuses=RECEIVED&statuses=REJECTED`
      let reUrl=`${conf.url}/internethospital/api/orders/refund?page-index=${currentPage}&page-size=10`
      let url=`${reUrl}&${status}`

      if (this.condition.startAndEndTime) {
        var startAndEndTime = this.condition.startAndEndTime;
        url = `${reUrl}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1];
      }
      if (this.condition.orderNumber) {
        url = `${reUrl}&order-number=${this.condition.orderNumber}`
      }
      if (this.condition.refundMethod) {
        url = `${reUrl}&refund-method=${this.condition.refundMethod}`
      }
      if (this.condition.statusText) {
        url = `${reUrl}&status=${this.condition.statusText}`
      }

      console.log('Bearer ' + this.token)
      ax.get(url, this.header).then(res => {
        console.log(res.data.content)
        let content = res.data.content

        this.tableData = content
        this.total = res.data.totalElements; /*设置总条数*/
        this.loading = false;
      }).catch(err => {
        console.log(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    //详情
    handleEdit(index, row) {
      console.log(index, row);
      this.$router.push('/finance-serve-refund-information')
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
        refundState: '',

      }

    }
  }
}

</script>
<style type="text/css" scoped>

.el-row.refund_totel>.el-col {
 
  padding-top: 30px;
  text-align: left;
}

.tableList {
  margin-top: 20px;
}


</style>
</template>
