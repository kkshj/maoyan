<template>
  <div>
  	<h5 class="header"><span @click='clickDack'>问诊结账</span> > 医院名</h5>
    <el-row :gutter="20">
<el-col :span="6">
          <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.billMonth" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </div>
      </el-col>    	
      <el-col :span="3">
        <el-input placeholder="订单编号" clearable v-model="condition.orderNumber"></el-input>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.payment" placeholder="支付渠道" @change="remotestatusMethod">
          <el-option v-for="item in payments" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
     <!--  <el-col :span="3">
        <el-input placeholder="支付时间" clearable v-model="condition.payTime"></el-input>
      </el-col>
  
      <el-col :span="3">
        <el-input placeholder="完成时间" clearable v-model="condition.finishTime"></el-input>
      </el-col> -->
      <el-col :span="3">
        <el-button type="success" plain @click='search'>确认</el-button>
        <el-button type="danger" plain :disabled="!condition.payTime && 
        !condition.orderNumber && !condition.payment && !condition.refund&&condition.reconciliationTime" @click="resetCondition()">重置</el-button>     
      </el-col>
    </el-row>
      <el-table ref="multipleTable" tooltip-effect="dark" class='tableList' :data="tableData" border style="width: 100%" v-loading='loading'>
        <el-table-column align='center' type="index" label="编号"> </el-table-column>
        <el-table-column align='center' label="订单流水号" prop='orderNumber'></el-table-column>
        <el-table-column align='center' label="订单" prop='orderMoney'></el-table-column>
        <el-table-column align='center' label="支付渠道" prop='paymentChannel'></el-table-column>
        <el-table-column align='center' label="交易时间" prop='payTime'></el-table-column>
        <el-table-column align='center' label="完成时间" prop='refundPerson'></el-table-column>
        <el-table-column align='center' label="订单金额" prop='refundTime'></el-table-column>
        <el-table-column align='center' label="医生分成金额" prop='refundState'></el-table-column>
        <el-table-column align='center' label="医院分成金额" prop='refundIndex'></el-table-column>
        <el-table-column align='center' label="快医分成金额" prop='refundMoney'></el-table-column>
      </el-table>
      <br/>
      <el-pagination background layout="prev, pager, next" :current-page="currentPage" :total="total" @current-change="changePage">
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
      currentPage: 1,
      total: 0,
      loading: false,
      multipleSelection: [],
      condition: {
        billMonth: '',
        payTime: '',
        orderNumber: '',
        payment: '',
        finishTime: '',
       

      },
      tableData: [],
      payments: [
        { value: '', label: '全部' },
        { value: 'WEIXIN', label: '微信' },
        { value: 'ZHIFUBAO', label: '支付宝' },

      ],
    }
  },
  activated(){
      for (var i = 0; i < 10; i++) {
      let t = {
    index: i,
     
        orderNumber: 'fffjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj',
        payTime: 'fff',
        refundPerson: 'fff',
        orderMoney: 'fff',
        refundState: 'fff',
        paymentChannel: 'fff',
        refundTime: 'fff',
        refundIndex: 'fff',
        refundMoney: 'fff', 
      }
 
      this.tableData = this.tableData.concat(t)
    }
  },
  methods: {
  	//返回
  	clickDack(){
  		this.$router.back()
  	},
  	//搜索
  	search(){

  	},
    //分页
    changePage(num) {
      console.log(num)

    },
    //下拉框改变状态
    remotestatusMethod() {
      console.log('55', this.condition.payment)
    },
    //重置
    resetCondition() {
      this.condition = {
        payTime: '',
        orderNumber: '',
        payment: '',
        refund: '',
        reconciliationTime: ''

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
.header{
	text-align: left;
	margin-bottom: 20px;
}
.header span{
	cursor: pointer;
	color:#409EFF;
}

</style>
</template>
