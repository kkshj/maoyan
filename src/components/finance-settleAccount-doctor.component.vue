<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
          <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.startAndEndTime" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.hospital" placeholder="医院" @change="remotestatusMethod">
          <el-option v-for="item in hospitals" :key="item.value" :label="item.text" :value="item.id" @click='remotestatusMethod'>
          </el-option>
        </el-select>
      </el-col>
  <el-col :span="2">
        <el-select :disabled='!condition.hospital' v-model="condition.orderNumber" placeholder="科室" @change="remotestatusMethod">
          <el-option v-for="item in administrator" :key="item.value" :label="item.text" :value="item.id">
          </el-option>
        </el-select>
      </el-col>      
      <el-col :span="3">
        <el-button type="success" plain @click='searth'>确认</el-button>
        <el-button type="danger" plain :disabled="!condition.startAndEndTime && !condition.orderNumber && !condition.bill" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class='order_totel' type='flex' justify='start'>
      <el-col>
        <p>订单总金额：1300元</p>
      </el-col>
      <el-col>
        <p>医生分成总金额：1300元</p>
      </el-col>
      <el-col>
        <p>医院分成总金额：1300元</p>
      </el-col>
      <el-col>
        <p>快医分成总金额：1300</p>
      </el-col>
    </el-row>
    <el-table class='tableList' :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column align='center' type="index" label="序号"> </el-table-column>
      <el-table-column align='center' label="医生姓名" prop='payOrderId'></el-table-column>
      <el-table-column align='center' label="所属医院" prop='startTime'></el-table-column>
      <el-table-column align='center' label="所属科室" prop='startTime'></el-table-column>
      <el-table-column align='center' label="结算月份" prop='startTime'></el-table-column>
      <el-table-column align='center' label="订单数量" prop='EndTime'></el-table-column>
      <el-table-column align='center' label="订单总金额" prop='orderMoney'></el-table-column>
      <el-table-column align='center' label="代扣个税" prop='orderMoney'></el-table-column>
      <el-table-column align='center' label="其他扣款" prop='reconcilia'>
        <template slot-scope="scope">
          <el-input type='number' class="edit-cell" v-if="scope.row.isEdit" v-model="scope.row.reconcilia" @blur='textChange(scope.row)' @keyup.enter.native='textChange(scope.row)'></el-input>
          <span v-else>{{scope.row.reconcilia}}</span>
          <el-button v-if="!scope.row.isEdit" type="text" icon='el-icon-edit-outline' size="medium" @click="handleEd(scope.$index, scope.row)"></el-button>
        </template>
      </el-table-column>
      <el-table-column align='center' label="应付金额" prop='reconciliationState'></el-table-column>
      <el-table-column align='center' label="快医分成金额" prop='reconc'></el-table-column>
      <el-table-column align='center' label="医院分成金额" prop='reconc'></el-table-column>
      <el-table-column align='center' label="结账状态" prop='rec'></el-table-column>
      <el-table-column align='center' label="操作" width='140px'>
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.$index, scope.row)">详情</el-button>
          <el-button type="text" @click="affirm(scope.$index, scope.row)">确认</el-button>
        </template>
      </el-table-column>
    </el-table>
    <br />
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
      token: '',
      header:'',
      list: [1, 5, 8, 7, 8, 6],
      condition: {
        hospital: '',
        orderNumber: '',
        startAndEndTime:'',
        billMonth: '',

      },
      tableData: [],
      hospitals: [],
     administrator: [],      
    }
  },
  activated(){
        this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.getHospital()
        for (var i = 0; i < 10; i++) {
      let t = {
        index: i,
        payOrderId: 'fff',
        isEdit:false,
        startTime: 'fff',
        EndTime: 'fff',
        orderMoney: 'fff',
        paymentChannel: 'fff',
        reconcilia: 'fff',

        rec: 'fff',

        reconc: 'fff',
        reconciliationState: 'fff'
      }

      this.tableData = this.tableData.concat(t)
    }
  },
  methods: {
    searth() {

    },
    textChange(row){
      row.isEdit=false
      console.log(row.reconcilia)
    },
    //点击编辑
    handleEd(index, row) {
           row.isEdit=true
    },

    //分页
    changePage(num) {
      console.log(num)

    },
       getHospital(){
      let url= `${conf.url}/internethospital/api/organizations?page-index=1&page-size=100`
      ax.get(url).then(res=>{
        this.hospitals=res.data.content
       console.log(res)
      }).catch(err=>{
        console.log(err)
      })
    },    
    affirm(index, row) {
      console.log(index, row.reconcilia);
    },
    //详情
    handleEdit(index, row) {
      console.log(index, row);
      this.$router.push('/finance-settleAccount-doctor-details')
    },
    //下拉框改变状态
    remotestatusMethod(val) {
        console.log('55', this.condition.hospital)
        let url=`${conf.url}/internethospital/api/departments?organization-id=${val}&page-index=1&page-size=100`
        ax.get(url).then(res=>{
          console.log(res)
          this.administrator=res.data.content
        }).catch(err=>{
          console.log(err)
        })
    
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
.el-row.order_totel>.el-col p {
  font-size: 20px;
  font-weight: bold;
  padding-top: 30px;
  text-align: left;
}

.tableList {
  margin-top: 20px;
}

</style>
