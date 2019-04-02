<template>
  <div v-loading='loading'>
    <div class='getBack'>
      <el-button icon="el-icon-back" type="danger" plain @click="getBack">返回</el-button>
    </div>
    <div class="refound_details" v-if='refundRow&&(refundOrderNumber.length <= 0)'>
      <h5>订单信息</h5>
      <p>订单编号：{{refundRow.orderNumber}}</p>
      <p>订单类型：{{refundRow.orderTypeText}}</p>
      <p>就诊人姓名：{{refundRow.patientName}}</p>
      <p>就诊人电话：{{refundRow.purchaserUsername}}</p>
      <p>订单金额：￥{{refundRow.amount}}</p>
      <p>支付渠道：{{refundRow.refundMethod=='WECHAT'?'微信':'支付宝'}}</p>
      <p>支付时间：{{refundRow.createdDate}}</p>
      <p>订单状态：{{refundRow.statusText}}</p>
      <el-button type="primary" @click="dialogFormVisible = true">退款</el-button>
    </div>
    <div v-else-if='refundRow&&(refundOrderNumber.length > 0)' class="refound_details refound_message">
      <h5>订单信息</h5>
      <p>订单编号：{{refundRow.orderNumber}}</p>
      <p>订单类型：{{refundRow.orderTypeText}}</p>
      <p>就诊人姓名：{{refundRow.patientName}}</p>
      <p>就诊人电话：{{refundRow.purchaserUsername}}</p>
      <p>订单金额：￥{{refundRow.amount}}</p>
      <p>支付渠道：{{refundRow.refundMethod=='WECHAT'?'微信':'支付宝'}}</p>
      <p>支付时间：{{refundRow.createdDate}}</p>
      <p>订单状态：{{refundRow.statusText}}</p>
      <h5 class="inform">退款信息</h5>
      <div class="refound_details refound_message" v-loading='loading' v-for='item in refoundDeatil'>
        <p>退款状态：{{item.statusText}}</p>
        <p>退款类型：{{item.fullAmountRefund==true?'全额退款':'部分退款'}}</p>
        <p>退款金额：￥{{item.amount}}</p>
        <p>退款原由：{{item.reason}}</p>
        <p>就诊人姓名：{{item.patientName}}</p>
        <p>操作人：{{item.createdBy}}</p>
        <p>退款时间：{{item.createdDate}}</p>
      </div>
      <el-button v-if='!(refundMoneyAmount >= amount)' type="primary" @click="dialogFormVisible = true">退款</el-button>
    </div>
    <el-dialog title="退款" :visible.sync="dialogFormVisible" center width='400px' v-loading='loading'>
      <p class="refound"><span>退款类型：</span>
        <el-select v-model="content.typeValue" @change='changeRefund'>
          <el-option label="全额退款" value="SUM_REFOUND">
          </el-option>
          <el-option label="部分退款" value="PART_REFOUND">
          </el-option>
        </el-select>
      </p>
      <p class="refound"><span class="left">退款金额：</span>
        <el-input type='number' v-model="content.amount" :disabled="refundMoney">
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
      accout:0,
      dialogFormVisible: false,
      refundMoney: true,
      fullAmountRefund: false,
      loading: false,
      refundMoneyAmount: '',
      amount: '',
      token: '',
      header: '',
      param: '',
      refundRow: '',
      refoundDeatil: [],
      refundOrderNumber: [],
      content: {
        typeValue: 'SUM_REFOUND',
        amount: '',
        textarea: '医生为接诊，订单超时',
      },

    }
  },
  activated() {
    this.token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + this.token } };
    this.param = this.$route.query;
    this.content = {
      typeValue: 'SUM_REFOUND',
      amount: '',
      textarea: '医生为接诊，订单超时',
    }
    console.log(this.param)
    this.getInfo(this.param);
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
          _this.getInfo(_this.param)
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },    
    getInfo(param) {
       this.loading = true;
      let url = `${conf.url}/internethospital/api/orders/?order-number=${param.orderNumber}&page-index=1&page-size=2`;
      ax.get(url, this.header).then(res => {
        console.log(res)
        this.refundOrderNumber = []
        let content = res.data.content[0]
        this.amount = content.amount
        console.log(this.amount)
        content.referencedOrders = content.referencedOrders.filter(d => d.orderTypeCode === 'REFUND')
        this.refundRow = content
        this.refundMoneyAmount = 0
        if (content.referencedOrders.length > 0) {
          for (var i in content.referencedOrders) {
            this.refundMoneyAmount += content.referencedOrders[i].amount
            this.refundOrderNumber.push(content.referencedOrders[i].orderNumber)
          }
        }
        console.log(this.refundMoneyAmount)
        if (this.refundOrderNumber.length > 0) {
          this.refoundDeatil = []
          for (var i = 0; i < this.refundOrderNumber.length; i++) {
            url = `${conf.url}/internethospital/api/orders/refund?page-index=1&page-size=1&order-number=${this.refundOrderNumber[i]}`;
            ax.get(url, this.header).then(res => {
              this.refoundDeatil.push(res.data.content[0])
              this.loading = false;
            }).catch(err => {
              console.log(err)
              this.$message({
                type: 'warning',
                message: err.response.data.message
              });
            })
          }
        }
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
    changeRefund(val) {
      if (val == 'SUM_REFOUND') {
        this.content.amount = ''
        this.refundMoney = true
      } else {
        this.content.amount = ''
        this.refundMoney = false;
      }
    },
    getBack() {
      this.$router.back(-1)
    },
    //确定
    confirm() {
      this.loading = true;
      const url = `${conf.url}/internethospital/api/orders/${this.param.id}/refund/wechat`;
      let data = {}
      if (this.content.typeValue === 'SUM_REFOUND') {
        data = {

          "fullAmount": true,
          "reason": this.content.textarea
        }
      } else {
        data = {
          "amount": this.content.amount,
          "fullAmount": false,
          "reason": this.content.textarea
        }
      }
      ax.post(url, data, this.header).then(res => {
        console.log(res)
        this.$message({
          type: 'success',
          message: '退款申请已提交'
        })
        this.getInfo(this.param)
        // this.$router.back()
        this.dialogFormVisible = false
        this.loading = false;
      }).catch(err => {
        console.log(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        })
      })

    }
  }
}

</script>
<style type="text/css" scoped>
.el-select {
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

.refound_message .inform {
  padding-top: 20px;
}

.refound_details p {
  padding: 10px 0;
}

.refound {
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;

}

.refound .left {
  width: 90px;
}

.getBack {
  text-align: right;
}

</style>
