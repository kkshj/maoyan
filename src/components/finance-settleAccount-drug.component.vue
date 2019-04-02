<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
              <div class="block">
          <el-date-picker value-format="yyyy-MM-dd" v-model="condition.billMonth" type="daterange" unlink-panels range-separator="—" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </div>
      </el-col>
      <el-col :span="2">
        <el-select v-model="condition.hospital" placeholder="医院" @change="remotestatusMethod">
          <el-option v-for="item in hospitals" :key="item.value" :label="item.text" :value="item.id">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="success" plain @click='searth'>确认</el-button>
        <el-button type="danger" plain :disabled="!condition.hospital &&  !condition.billMonth" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class='order_totel'>
      <el-col :span='4'>
        <p>订单总金额：1300元</p>
      </el-col>
      <el-col :span='4'>
        <p>药企分成总金额：1300元</p>
      </el-col>
      <el-col :span='4'>
        <p>快医分成总金额：1300</p>
      </el-col>
    </el-row>
    <el-table class='tableList' :data="tableData" border style="width: 100%" v-loading='loading'>
      <el-table-column align='center' type="index" label="序号"> </el-table-column>
      <el-table-column align='center' label="医院名称" prop='payOrderId'></el-table-column>
      <el-table-column align='center' label="订单数量" prop='orderNumber' ></el-table-column>
      <el-table-column align='center' label="订单总金额" prop='startTime'></el-table-column>
      
      <el-table-column align='center' label="药企分成金额" prop='orderMoney'></el-table-column>
      
      <el-table-column align='center' label="快医分成金额" prop='reconciliationTime'></el-table-column>
      <el-table-column align='center' label="配送费" prop='reconcilia'></el-table-column>
      <el-table-column align='center' label="结账状态" prop='reconciliationState'></el-table-column>
      <el-table-column align='center' label="操作">
        <template slot-scope="scope">
          <el-button type="success" plain @click="handleEdit(scope.$index, scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
 <br/>
    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :total="total"
      @current-change="changePage">
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
    	currentPage:1,
    	total:0,
      loading: false,
      condition: {
      	hospital:'',
      	billMonth:'',

      },
      tableData: [],
      hospitals: [],
    }
  },
  activated(){
    this.getHospital()
      for (var i = 0; i < 10; i++) {
      let t={
        index:i,
        payOrderId:'fff',
        orderNumber:'fffjjjjjjjjjjjjjjjjjjjj地方郭德纲的风格的鬼地方郭德纲的发个梵蒂冈地方郭德纲的鬼地方个郭德纲jjjjjjjjjj',
        startTime:'fff',
        EndTime:'fff',
        orderMoney:'fff',
        paymentChannel:'fff',
        reconcilia:'fff',
        reconciliationTime:'fff',
        reconciliationState:'fff'
      }
      
      this.tableData=this.tableData.concat(t)
    }

  },
  methods: {
  	searth(){

  	},
  	//分页
  	changePage(num){
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
    //详情
    handleEdit(index, row) {
      console.log(index, row);
      this.$router.push('/finance-settleAccount-drug-details')
    },
    //下拉框改变状态
    remotestatusMethod() {
      console.log('55', this.condition.hospital)
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
.el-row.order_totel>.el-col p
{
  font-size: 20px;
  font-weight: bold;
  padding-top: 30px;
  text-align: left;
}
.tableList{
	margin-top: 20px;
}
</style>
