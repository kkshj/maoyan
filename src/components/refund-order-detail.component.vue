<template>
  <div>
    <el-row class="header">
      <el-col :span="12"><h4>退款订单信息</h4>
      </el-col>
      <el-col :span="12">
        <el-button v-if="type==='check'" type="danger" plain icon="el-icon-back" @click="cancel">返回</el-button>
        <el-button v-if="type==='refund'" type="danger" plain icon="el-icon-back" @click="cancelRefund">返回到主界面</el-button>
      </el-col>
    </el-row>
    <el-form ref="refund" :model="refund" label-width="140px" :rules="rules" style="width: 70%; margin: 20px auto;">
      <h4 style="text-align: left;">订单信息</h4>
      <el-form-item label="订单号" prop="orderNumber">
        <span>{{refund.orderNumber}}</span>
      </el-form-item>
      <el-form-item label="订单类型" prop="orderTypeText">
        <span>{{refund.orderTypeText}}</span>
      </el-form-item>
      <el-form-item label="原始订单号" prop="sourceOrder">
        <span>{{refund.sourceOrder}}</span>
      </el-form-item>
      <el-form-item label="交易流水号" prop="refundOrderId">
        <span>{{refund.refundOrderId}}</span>
      </el-form-item>
      <el-form-item label="订单金额" prop="amount">
        <span>￥{{refund.amount}}</span>
      </el-form-item>
      <el-form-item label="订单状态" prop="statusText">
        <span>{{refund.statusText}}</span>
      </el-form-item>
      <el-form-item label="退款类型" prop="fullAmountRefund">
        <span>{{refund.fullAmountRefund===true? '全额退款':'部分退款'}}</span>
      </el-form-item>
      <el-form-item label="退款原因" prop="reason">
        <span>{{refund.reason}}</span>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdDate">
        <span>{{refund.createdDate}}</span>
      </el-form-item>
      <br>
      <h4 style="text-align: left;">医生信息</h4>
      <el-form-item label="医生/护师姓名" prop="doctorName">
        <span>{{refund.doctorName}}</span>
      </el-form-item>
      <el-form-item label="所属医院" prop="organizationText">
        <span>{{refund.organizationText}}</span>
      </el-form-item>
      <el-form-item label="所属科室" prop="departmentText">
        <span>{{refund.departmentText}}</span>
      </el-form-item>
      <br>
      <h4 style="text-align: left;">就诊人信息</h4>
      <el-form-item label="就诊人姓名" prop="patientName">
        <span>{{refund.patientName}}</span>
      </el-form-item>
      <el-form-item label="就诊人电话" prop="purchaserUsername">
        <span>{{refund.purchaserUsername}}</span>
      </el-form-item>
      <h4 style="text-align: left;">聊天记录</h4>
    </el-form>
    <span v-if="chatRecordList.length===0">暂无聊天记录</span>
    <el-row v-for="(item,index) in chatRecordList" :key="index" style="margin-top: 10px; padding-bottom: 10px; border-bottom: 1px #e2e2e2 solid;">
      <el-col :span="4">{{item.personType === 'HEALER' ? '医生' : '患者'}}：</el-col>
      <el-col :span="20" style="text-align: left">
        <span v-if="item.msgType === 'TIMTextElem'">{{item.msgContent}}</span>
        <span v-if="item.msgType === 'TIMFaceElem'">[表情]</span>
        <span v-if="item.msgType === 'TIMSoundElem'">[语音消息]</span>
        <img v-if="item.msgType === 'TIMImageElem'" :src="item.msgContent" style="width: 60px;">
      </el-col>
    </el-row>
    <br>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
export default {
  name: "refund-detail",
  data() {
    return {
    accout:0,
      type: '',
      header: '',
      statusText: '',
      refund: {},
      /*聊天记录*/
      chatRecordList: [],
      rules: {},
      condition: {
        hospitalCode: ''
      }
    }
  },
  activated() {
    const organizationsCode = localStorage.getItem('organizationsCode');
    if (organizationsCode) {
      this.condition.hospitalCode = organizationsCode;
    }
    const token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.type = this.$route.query.type;
    this.getInfo(this.$route.query.orderNumber);
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
          _this.getInfo(_this.$route.query.orderNumber)
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },
    getInfo(orderNumber) {
      let url = `${conf.url}/internethospital/api/orders/refund?order-number=${orderNumber}&page-index=1&page-size=100`;
      if (this.condition.hospitalCode) {
        url = `${url}&organization-code=${this.condition.hospitalCode}`
      }
      ax.get(url, this.header).then(res => {
        if (res.data.content[0].amount.toString().indexOf('.') < 0) {
          res.data.content[0].amount = res.data.content[0].amount + '.00'
        } else {
          if (res.data.content[0].amount.toString().slice(res.data.content[0].amount.toString().indexOf('.') + 1).length < 2) {
            res.data.content[0].amount = res.data.content[0].amount + '0'
          } else {
            res.data.content[0].amount = res.data.content[0].amount.toString().slice(0, res.data.content[0].amount.toString().indexOf('.') + 3)
          }
        }
        /*原始订单拼接*/
        res.data.content[0].sourceOrder = res.data.content[0].sourceOrder && res.data.content[0].sourceOrder.orderTypeText + '-' + res.data.content[0].sourceOrder.orderNumber;
        this.refund = res.data.content[0];
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
      const url1 = `${conf.url}/internethospital/api/chat-message?order_header_id=${orderNumber}&page_index=1&page_size=100000`;
      ax.get(url1).then(res => {
        for (let i in res.data.content) {
          res.data.content[i].personType = res.data.content[i].fromAccount === this.$route.query.healerId ? 'HEALER' : 'PATIENT'
          if (res.data.content[i].msgType === 'TIMImageElem') {
            res.data.content[i].msgContent = res.data.content[i].msgContent.slice(res.data.content[i].msgContent.indexOf('url='))
            res.data.content[i].msgContent = res.data.content[i].msgContent.slice(4, res.data.content[i].msgContent.indexOf('),'))
            console.log(res.data.content[i].msgContent)
          }
        }
        this.chatRecordList = res.data.content;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    cancel() {
      this.$router.back(-1);
    },
    cancelRefund() {
      this.$router.go(-2);
    }
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
