<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="3">
        <el-input placeholder="订单编号" clearable v-model="condition.sourceOrderOrderNumber"></el-input>
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
    <el-row class='refund_totel' type='flex' justify='start'>
      <el-col :span='4'>
        <p>待退款总数：1300</p>
      </el-col>
      <el-col :span='5'>
        <p>待退款总金额：1300元</p>
      </el-col>
      <el-col :span='4'>
        <p>
          <el-button type="danger" size='medium' plain @click="batchDelete">批量退款</el-button>
        </p>
      </el-col>
    </el-row>
    <el-table ref="multipleTable" tooltip-effect="dark" class='tableList' :data="tableData" border style="width: 100%" v-loading='loading' @selection-change="handleSelectionChange">
      <el-table-column align='center' type="selection">
      </el-table-column>
      <el-table-column align='center' type="index" label="编号"> </el-table-column>
      <el-table-column align='center' label="订单号" prop='orderNumber'></el-table-column>
      <el-table-column align='center' label="订单金额" prop='amount'></el-table-column>
      <el-table-column align='center' label="订单状态" prop='statusText'></el-table-column>
      <el-table-column align='center' label="支付渠道" prop="payMethod">
        <template slot-scope="scope">
          <span>{{scope.row.payMethod=='WECHAT'?'微信':'支付宝'}}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="支付时间" prop='createdDate'></el-table-column>
      <el-table-column align='center' label="退款人员" prop='purchaserUsername'></el-table-column>
      <el-table-column align='center' label="退款时间" prop='referencedOrders.createDate'></el-table-column>
      <el-table-column align='center' label="退款状态" prop='referencedOrders.statusText'>
        <template slot-scope="scope">
          <span>{{scope.row.referencedOrders.statusText?'已退款':'未退款'}}</span>
        </template>
      </el-table-column>
      <el-table-column align='center' label="退款编号" prop='referencedOrders.orderNumber'></el-table-column>
      <el-table-column align='center' label="退款金额" prop='referencedOrders.amount'></el-table-column>
      <el-table-column align='center' label="操作">
        <template slot-scope="scope">
          <el-button type="primary" plain @click="handleEdit(scope.row.referencedOrders.statusText, scope.row)">查看详情</el-button>
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
      currentPage: 1,
      total: 0,
      loading: false,
      token: '',
      header: '',
      multipleSelection: [],
      condition: {
        startAndEndTime: '',
        sourceOrderOrderNumber: '',
        refundMethod: '',
        statusText: '',

      },
      tableData: [],
      payments: [
        { value: '', label: '全部支付' },
        { value: 'WECHAT', label: '微信' },
        { value: 'ALI_PAY', label: '支付宝' },

      ],
      refunds: [
        { value: '', label: '全部' },
        { value: 'NOT_REFUND', label: '未退款' },
        { value: 'REFUND', label: '已退款' },


      ],
    }
  },
  activated() {
    this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.loading = true;
    this.getInfo(1);
  },
  methods: {
    getInfo(currentPage) {
      this.currentPage = currentPage
      let url = `${conf.url}/internethospital/api/orders/?page-index=${currentPage}&page-size=10&statuses=OVER_TIME`;

      if (this.condition.startAndEndTime) {
        var startAndEndTime = this.condition.startAndEndTime;
        url = `${url}&start-date=` + startAndEndTime[0] + `&end-date=` + startAndEndTime[1];
      }
      if (this.condition.sourceOrderOrderNumber) {
        url = `${url}&order-number=${this.condition.sourceOrderOrderNumber}`
      }
      if (this.condition.refundMethod) {
        url = `${url}&pay-method=${this.condition.refundMethod}`
      }
      if (this.condition.statusText) {
        url = `${url}&refund-status=${this.condition.statusText}`
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

    //批量删除
    batchDelete() {

      if (this.multipleSelection.length > 0) {
        console.log(this.multipleSelection)
        this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',

        }).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      } else {
        this.$message({
          type: 'error',
          message: '选择框不能为空'
        })
      }
    },
    //多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    //详情
    handleEdit(type, row) {
      console.log(type, row.orderNumber);
      this.$router.push({
        path: '/finance-void-refund-details',
        query: {
          type: type,
          id: row.id,
          payOrderId: row.payOrderId,
          orderNumber: row.orderNumber
        }
      });
    },
    //下拉框改变状态
    remotestatusMethod() {
      console.log('55', this.condition.payment)
    },
    //重置
    resetCondition() {
      this.condition = {
        startAndEndTime: '',
        sourceOrderOrderNumber: '',
        refundMethod: '',
        statusText: '',


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

.el-row.refund_totel>.el-col:last-child {
  flex-grow: 1;

}

.el-row.refund_totel>.el-col:last-child p {

  text-align: right;
}

</style>
</template>
