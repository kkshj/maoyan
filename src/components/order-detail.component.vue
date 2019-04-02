<template>
  <div>
    <el-row class="header">
      <el-col :span="12"><h4>查询订单聊天记录</h4>
      </el-col>
      <el-col :span="12">
        <!--<el-button v-if="type==='add'" type="primary" plain icon="el-icon-edit" @click="create">保存</el-button>-->
        <!--<el-button v-if="type === 'update'" type="primary" plain icon="el-icon-edit" @click="update">保存</el-button>-->
        <el-button type="danger" plain icon="el-icon-back" @click="cancel">返回</el-button>
      </el-col>
    </el-row>
    <span v-if="chatRecordList.length===0">暂无聊天记录</span>
    <el-row v-for="(item,index) in chatRecordList" :key="index" style="margin-top: 10px; padding-bottom: 10px; border-bottom: 1px #e2e2e2 solid;">
      <el-col :span="4">{{item.personType === 'HEALER' ? '医生' : '患者'}}：</el-col>
      <el-col :span="16" style="text-align: left">
        <span v-if="item.msgType === 'TIMTextElem'">{{item.msgContent}}</span>
        <span v-if="item.msgType === 'TIMFaceElem'">[表情]</span>
        <span v-if="item.msgType === 'TIMSoundElem'">[语音消息]</span>
        <img v-if="item.msgType === 'TIMImageElem'" :src="item.msgContent" style="width: 60px;">
      </el-col>
        <el-col :span="4">{{item.msgTime}}</el-col>
    </el-row>
    <br>
    <br>
    <!--退款成功和已退款的不显示退款按钮-->
    <el-button type="primary" v-if="canIVisit('operate', 'INTERROGATION_REFUND')" @click="changeOne()" :disabled="payOrderId==null">退款</el-button>
    <el-dialog title="退款信息" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <!--<el-form-item label="剩余可退款金额：" :label-width="formLabelWidth">
          <span>{{form.allAmount}}</span>
        </el-form-item>-->
        <el-form-item label="全额退款" :label-width="formLabelWidth">
          <el-select @change="chooseCode(form.fullAmount)" v-model="form.fullAmount" placeholder="请选择">
            <el-option selected v-for="item in fullAmountOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="退款金额" :label-width="formLabelWidth">
          <el-input type="number" :disabled="form.priceDisabled" v-model="form.amount" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="退款原因" :label-width="formLabelWidth">
          <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 4}" placeholder="请输入退款原因" v-model="form.reason">
          </el-input>
        </el-form-item>
      </el-form>
      <div>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="form.allAmount==='无价格'" @click="sureRefund" v-loading.fullscreen.lock="fullscreenLoading">确认退款</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "doctor-detail",
  data() {
    return {
    accout: 0,
      type: '',
      payOrderId: '',
      header: '',
      statusText: '',
      chatRecordList: [],
      dialogFormVisible: false,
      orderTypeText: '',
      form: {
        allAmount: '',
        amount: '',
        fullAmount: '', //默认值为全额
        reason: '',
        priceDisabled: false
      },

      fullAmountOptions: [{
        value: 'fullAmount',
        label: '全额退款'
      }, {
        value: 'Amount',
        label: '部分退款'
      }],
      formLabelWidth: '140px',
      fullscreenLoading: false
    }
  },
  activated() {
    const token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.statusText = this.$route.query.statusText;
    this.form.allAmount = this.$route.query.newAmount;
    this.type = this.$route.query.type;
    this.payOrderId = this.$route.query.payOrderId;
    this.orderTypeText = this.$route.query.orderTypeText;
    this.form.fullAmount = 'fullAmount', //默认值为全额退款
      this.getInfo(this.$route.query.id);
    this.chatRecordList = {}
    console.log(this.canIVisit('operate', 'INTERROGATION_REFUND'))
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
          _this.getInfo(_this.$route.query.id)
          this.jurisdiction = false
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },
    canIVisit(type, functions) {
      const roles = JSON.parse(localStorage.getItem('userInfo')).roles;
      if (roles.length === 1) {
        const role = roles[0];
        return rules.canIVisit(role, type, functions)
      }
      if (roles.length > 1) {
        let roleBol = false;
        for (let i in roles) {
          const role = roles[i];
          roleBol = roleBol || rules.canIVisit(role, type, functions);
        }
        return roleBol;
      }
    },
    getInfo(id) {
      const url = `${conf.url}/internethospital/api/chat-message?order_header_id=${id}&page_index=1&page_size=100000`;
      ax.get(url).then(res => {
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
    changeOne() {
      this.form.fullAmount = 'fullAmount'; //默认值为全额退款
      this.form.amount = '';
      this.form.reason = '';
      this.dialogFormVisible = true;
      this.chooseCode(this.form.fullAmount);
    },
    chooseCode(value) {
      if (value === 'fullAmount') {
        this.form.priceDisabled = true;
      } else {
        this.form.priceDisabled = false;
      }
    },
    /*确认退款*/
    sureRefund() {
      this.fullscreenLoading = true;
      /*到后台执行退款接口*/
      const url = `${conf.url}/internethospital/api/orders/${this.$route.query.id}/refund/wechat`;
      /*如果选择的全额退款，退款金额取值传过来的金额，如果为部分退款，取值为用户自定义的值*/
      let data;
      if (this.form.fullAmount === 'fullAmount') { //全额退款
        data = {
          "amount": this.form.allAmount.replace('￥', ''),
          "fullAmount": true,
          "reason": this.form.reason
        }
      } else { //部分退款
        data = {
          "amount": this.form.amount,
          "fullAmount": false,
          "reason": this.form.reason
        }
      }
      ax.post(url, data, this.header).then(res => {
        /*退款成功后，跳转到退款订单详情页，待做！！！！！*/
        this.$message({
          type: 'success',
          message: '退款申请已提交'
        });
        this.goToDetail(res.data.orderNumber)
        this.dialogFormVisible = false;
        this.fullscreenLoading = false;
      }).catch(err => {
        this.refreshTokened(err)
        this.fullscreenLoading = false;
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })

    },
    goToDetail(orderNumber) {
      this.$router.push({
        path: '/refund-order-manager/detail',
        query: {
          orderNumber: orderNumber,
          type: 'refund'
        }
      });
    },
    cancel() {
      this.$router.back(-1);
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

.el-form {
  width: 70%;
  margin: 0 auto;
}

.el-form-item {
  text-align: left;
}

</style>
