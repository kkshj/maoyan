<template>
    <div class="refound_details" v-loading='loading'> 
    <h5>订单信息</h5>
    <p>订单编号：{{refoundDeatil.orderNumber}}</p>
    <p>订单金额：￥{{refoundDeatil.amount}}</p>
    <p>支付渠道：{{refoundDeatil.payMethod}}</p>
    <p>支付时间：{{refoundDeatil.createdDate}}</p>
    <p>订单状态：{{refoundDeatil.statusText}}</p>

    <el-button v-if='!param.payOrderId' type="primary" @click="dialogFormVisible = true">退款</el-button>
    <div v-if='param.payOrderId' class="refound_message">
      <h5>退款信息</h5>
      <p>退款状态：{{refoundDeatil.referencedOrders.statusText}}</p>
      <p>退款类型：全额退款</p>
      <p>退款金额：￥{{refoundDeatil.amount}}</p>
      <p>退款原由：医生为接诊，订单超时</p>
      <p>用户姓名：{{refoundDeatil.patientName}}</p>
      <p>操作人：张青</p>
      <p>退款时间：{{refoundDeatil.referencedOrders.createDate}}</p>
    </div>
    <el-dialog title="退款" :visible.sync="dialogFormVisible" center width='400px'>
      <p class="refound"><span>退款类型：</span>
        <el-select v-model="content.typeValue">
          <el-option label="全额退款" value="SUM_REFOUND">
          </el-option>
        </el-select>
      </p>
      <p class="refound"><span class="left">退款金额：</span>
        <el-input type='number' v-model="content.amount" :disabled="true">
        </el-input>
      </p>
      <p class="refound"><span class="left">退款原由：</span>
        <el-input type="textarea" size='small' :rows="2" v-model="content.textarea">
        </el-input>
      </p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script type="text/javascript">
  import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  data() {
    return {
      dialogFormVisible: false,
      loading: false,
      token:'',
      header:'',
      param:'',
      refoundDeatil:'',
      content: {
        typeValue: 'SUM_REFOUND',
        amount: '无',
        textarea: '医生为接诊，订单超时',
      },

    }
  },
    activated() {
    this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.param = this.$route.query;
    console.log(this.param)
    this.loading=true;
    this.getInfo(this.param.orderNumber);
  },
  methods: {
    getInfo(orderNumber){
      const url=`${conf.url}/internethospital/api/orders/?order-number=${orderNumber}&page-index=1&page-size=2&statuses=OVER_TIME`;
      ax.get(url,this.header).then(res=>{
        console.log(res)
        this.refoundDeatil=res.data.content[0]
        this.content.amount=res.data.content[0].amount
        this.loading=false;
      }).catch(err=>{
        console.log(err)
 this.$message({
              type: 'warning',
              message: err.response.data.message
            });        
      })
    },
    //确定
    confirm() {
      console.log(this.content)
      const url=`${conf.url}/internethospital/api/orders/${this.param.id}/refund/wechat`;
 let data = {
          "amount": this.content.amount,
          "fullAmount": true,
          "reason": this.content.textarea
        }      
      ax.post(url,data,this.header).then(res=>{
        console.log(res)
        this.$message({
          type:'success',
          message:'退款申请已提交'
        })
        this.param.type=res.data.statusCode
        console.log(this.param)
        this.dialogFormVisible = false
      }).catch(err=>{
        console.log(err)
      })
      
    }
  }
}

</script>
<style type="text/css" scoped>
.el-select{
  width: 280px;
}
.refound_details {

  text-align: left;
  font-size: 16px;
}

.refound_message {
  margin-top: 20px;
}

.refound_details h5 {
  font-size: 16px;
}

.refound_details p {
  padding: 10px 0;
}

.refound {
  display: flex;
  justify-content: flex-start;

}

.refound .left {
  width: 90px;
}

</style>
