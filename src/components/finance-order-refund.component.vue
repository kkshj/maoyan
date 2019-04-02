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
        <el-select v-model="condition.refundMethod" placeholder="支付渠道" @change="remotestatusMethod">
          <el-option v-for="item in payments" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
<el-col :span="2">
        <el-select v-model="condition.statusTexted" placeholder="订单状态">
          <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>      
      <el-col :span="2">
        <el-select v-model="condition.refundStatusText" placeholder="退款状态" @click='aa'>
          <el-option v-for="item in refunds" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="success" plain @click='getInfo(1)'>搜索</el-button>
        <el-button type="danger" plain :disabled="condition.refundsStatusText=='ALL'" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-table ref="multipleTable" tooltip-effect="dark" class='tableList' :data="tableData" border style="width: 100%" v-loading='loading'>
      <el-table-column align='center' type="index" label="编号"> </el-table-column>
      <el-table-column align='center' label="订单号" prop='orderNumber'>
      </el-table-column>
      <el-table-column align='center' label="订单金额" prop='amount'>
      </el-table-column>
      <el-table-column align='center' label="订单状态" prop='statusText'>
      </el-table-column>
      <el-table-column align='center' label="支付渠道" prop="payMethod">
        <template slot-scope="scope">
          <span>{{scope.row.payMethod=='WECHAT'?'微信':'支付宝'}}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="支付时间" prop='createdDate'>
      </el-table-column>
      <el-table-column align='center' label="退款人员" prop='patientName'>
      <!--   <template slot-scope="scope">
          <div v-if='scope.row.referencedOrders.length>0'>
            <div v-for='item in scope.row.referencedOrders'>
              <span>{{item.patientName}}</span>
            </div>
          </div>
          <div v-else></div>
        </template> -->
      </el-table-column>
      <el-table-column align='center' label="退款时间" prop='sourceOrder[0].createDate'>
  <template slot-scope="scope">
          <div v-if='scope.row.sourceOrder.length>0'>
            <div v-for='item in scope.row.sourceOrder'>
              <span>{{item.createDate}}</span>
            </div>
          </div>
          <div v-else>--</div>
        </template>       
      </el-table-column>
      <el-table-column align='center' label="退款状态" prop='sourceOrder[0].statusText'>
        <template slot-scope="scope">
          <div v-if='scope.row.sourceOrder.length>0'>
            <div v-for='item in scope.row.sourceOrder'>
              <span>{{item.statusText}}</span>
            </div>
          </div>
          <div v-else>未退款</div>
        </template> 
      </el-table-column>
      <el-table-column align='center' label="退款编号" prop='sourceOrder[0].orderNumber'>
 <template slot-scope="scope">
          <div v-if='scope.row.sourceOrder.length>0'>
            <div v-for='item in scope.row.sourceOrder'>
              <span>{{item.orderNumber}}</span>
            </div>
          </div>
          <div v-else>--</div>
        </template>         
      </el-table-column>
      <el-table-column align='center' label="退款金额" prop='sourceOrder[0].amount'>
<template slot-scope="scope">
          <div v-if='scope.row.sourceOrder.length>0'>
            <div v-for='item in scope.row.sourceOrder'>
              <span>{{item.amount}}</span>
            </div>
          </div>
          <div v-else>--</div>
        </template>           
      </el-table-column>
      <el-table-column align='center' label="操作">
        <template slot-scope="scope">
          <el-button type="primary" plain @click="handleEdit( scope.row)">查看详情</el-button>
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
      accout: 0,
      currentPage: 1,
      total: 0,
      loading: false,
      token: '',
      header: '',
      multipleSelection: [],
      condition: {
        startAndEndTime: '',
        orderNumber: '',
        refundMethod: '',
        statusTexted: '',
        refundStatusText: 'ALL',

      },
      tableData: [],
      payments: [
        { value: '', label: '全部支付' },
        { value: 'WECHAT', label: '微信' },
        { value: 'ALI_PAY', label: '支付宝' },

      ],
      refunds: [
        { value: 'ALL', label: '全部' },
        { value: 'NOT_REFUND', label: '未退款' },
        { value: 'REFUND', label: '已退款' },


      ],
      status:[
      { value: '', label: '全部' },
      { value: 'DOCTOR_COMPLETED', label: '已成功' },
      { value: 'CANCEL', label: '已取消' },
      { value: 'OVER_TIME', label: '已超时' },
      { value: 'AUTO_COMPLETED', label: '已完成' },
      { value: 'PUSH_FAILED', label: '已支付' },
      { value: 'PAYED', label: '已付款' },
      { value: 'SHIPPED', label: '已配送' },
      { value: 'AUDITED', label: '已审方' },
      { value: 'SIGNED', label: '已签章' },
      { value: 'RECEIVED', label: '已接诊' },
      { value: 'REJECTED', label: '已拒绝' },
      ]
    }
  },
  activated() {
    this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
   
    this.getInfo(1);
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
    getInfo(currentPage) {
       this.loading = true;
      this.currentPage = currentPage
  console.log(this.condition.refundStatusText)

      let url = `${conf.url}/internethospital/api/orders/return-overTime-refund-order?page-index=${currentPage}&page-size=10&refund-status=${this.condition.refundStatusText}`

      if (this.condition.startAndEndTime) {
        var startAndEndTime = this.condition.startAndEndTime;
        url = `${url}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1];
   
      }
      if (this.condition.orderNumber) {
        url = `${url}&order-number=${this.condition.orderNumber}`
      }
      if (this.condition.refundMethod) {
        url = `${url}&pay-method=${this.condition.refundMethod}`
      }
      if (this.condition.statusTexted) {
         url=`${url}&order-status=${this.condition.statusTexted}`
      }
      // console.log('Bearer ' + this.token)
      ax.get(url, this.header).then(res => {
        console.log(res.data.content)
        this.total = res.data.totalElements; /*设置总条数*/
        let content = res.data.content
          for (var i = 0; i < content.length; i++) {
            
              content[i].sourceOrder = content[i].sourceOrder ? content[i].sourceOrder.filter(d => d.orderTypeCode === 'REFUND') : [];
          }
        this.tableData = content
        this.loading = false;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },

    //详情
    handleEdit(row) {
      console.log(row);
      let data={
          id: row.id,
          payOrderId: row.payOrderId, 
          orderNumber: row.orderNumber,   
      }
      this.$router.push({
        path: '/finance-order-refund-information',
        query: data
    
      });
    },
    //下拉框改变状态
    remotestatusMethod() {
      console.log('55', this.condition.payment)
    },
    aa(val){
      this.condition.refundStatusText=val
    },
    //重置
    resetCondition() {
      this.condition = {
        startAndEndTime: '',
        orderNumber: '',
        refundMethod: '',
        statusTexted: '',
        refundStatusText: 'ALL',
      }
location.href='/#/order-manager'

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

.el-row.refund_totel>.el-col:last-child {
  flex-grow: 1;

}

.el-row.refund_totel>.el-col:last-child p {

  text-align: right;
}

</style>
</template>
