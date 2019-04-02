<template>
  <div>
    <div class="refound_details">
      <!--    <h5>订单信息</h5>
    <p>订单编号：<span class="number">59465688</span> </p>
    <p>订单金额：￥35：00元</p>
    <p>支付渠道：微信</p>
    <p>支付时间：201707-09 144:45：55</p>
    <p>订单状态：已超时</p>
    <el-button type="primary" @click="dialogFormVisible = true">申请退款</el-button> -->
      <!--  <div class="refound_message">
      <h5>退款信息</h5>
      <p>退款状态：待处理</p>
      <p>退款类型：全额退款</p>
      <p>退款金额：￥35</p>
      <p>退款原由：医生为接诊，订单超时</p>
        <p>退款时间：201707-09 144:45：55</p>
    </div>   -->
    </div>
    <!--  <div class="refound_details">
   	   <h5>订单信息</h5>
    <p>订单编号：<span class="number">59465688</span> </p>
    <p>订单金额：￥35：00元</p>
    <p>支付渠道：微信</p>
    <p>支付时间：201707-09 144:45：55</p>
    <p>订单状态：已超时</p>
      <h5 class="inform">审批信息</h5>
      <p>退款状态：待处理</p>
      <p>退款类型：全额退款</p>
      <p>退款金额：￥35元</p>
      <p>退款原由：医生为接诊，订单超时</p>
      <p>患者：张青</p>
      <p>患者电话：5675885666</p>
        <p>申请时间：{{new Date()}}</p>
 <div><el-button type="primary" @click="centerDialogVisible = true">确认退款</el-button>
    	<el-button type="danger" @click="dialogRefoundVisible = true">拒绝退款</el-button></div>        
    </div>   -->
    <div class="refound_details">
      <h5>订单信息</h5>
      <p>订单编号：<span class="number">59465688</span> </p>
      <p>订单金额：￥35：00元</p>
      <p>支付渠道：微信</p>
      <p>支付时间：201707-09 144:45：55</p>
      <p>订单状态：已超时</p>
      <h5 class="inform">审批信息</h5>
      <p>退款状态：待处理</p>
      <p>退款类型：全额退款</p>
      <p>退款金额：￥35元</p>
      <p>退款原由：医生为接诊，订单超时</p>
      <p>患者：张青</p>
      <p>患者电话：5675885666</p>
      <p>申请时间：{{new Date()}}</p>
      <div>
        <el-button type="primary" @click="dialogFnanceVisible = true">确认退款</el-button>
      </div>
    </div>
    <div class="flow">
      <h5>退款流程</h5>
      <p><span class="apply">申请退款</span><span class="default">确定</span><span class="default">财务退款</span></p>
    </div>
    <el-dialog :show-close='false' :visible.sync="centerDialogVisible" width="180px" center class="content">
      <span >请确认是否进行退款</span>
      <span slot="footer" class="dialog-footer">
    <el-button @click="centerDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="centerDialog">确 定</el-button>
  </span>
    </el-dialog>
    <el-dialog title="拒绝理由" :visible.sync="dialogRefoundVisible" center width='400px'>
      <p class="refound"><span class="left">退款原由：</span>
        <el-input type="textarea" size='small' :rows="5" v-model="content.textarea">
        </el-input>
      </p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRefoundVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogRefound">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="申请退款" :visible.sync="dialogFormVisible" center width='400px'>
      <p class="refound"><span>退款类型：</span>
        <el-select v-model="content.typeValue">
          <el-option label="全额退款" value="SUM_REFOUND">
          </el-option>
          <el-option label="部分退款" value="SUM_REFOUND">
          </el-option>
        </el-select>
      </p>
      <p class="refound"><span class="left">退款金额：</span>
        <el-input v-model="content.input1">
        </el-input>
      </p>
      <p class="refound"><span class="left">退款原由：</span>
        <el-input type="textarea" size='small' :rows="3" v-model="content.textarea">
        </el-input>
      </p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="退款" :visible.sync="dialogFnanceVisible" center width='400px'>
      <p class="refound"><span>退款类型：</span>
        <el-select v-model="content.typeValue">
          <el-option label="全额退款" value="SUM_REFOUND">
          </el-option>
          <el-option label="部分退款" value="SUM_REFOUND">
          </el-option>
        </el-select>
      </p>
      <p class="refound"><span class="left">退款金额：</span>
        <el-input v-model="content.input1">
        </el-input>
      </p>
      <p class="refound"><span class="left">退款原由：</span>
        <el-input type="textarea" :disabled='true' size='small' :rows="3" v-model="content.textarea">
        </el-input>
      </p>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFnanceVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFnance">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script type="text/javascript">
export default {
  data() {
    return {
      dialogFormVisible: false,
      centerDialogVisible: false,
      dialogRefoundVisible: false,
      dialogFnanceVisible: false,
      content: {
        typeValue: 'SUM_REFOUND',
        input1: '65',
        textarea: '医生为接诊，订单超时',
      },

    }
  },
  activated(){
  let a = 55
  },
  methods: {
    dialogFnance() {
      this.dialogFnanceVisible = false
    },
    dialogRefound() {
      this.dialogRefoundVisible = false
    },
    centerDialog() {
      this.centerDialogVisible = false
    },
    //确定
    confirm() {
      console.log(55)
      console.log(this.content)
      this.dialogFormVisible = false
    }
  }
}

</script>
<style type="text/css">
.refound_details,
.flow {
  text-align: left;
  font-size: 16px;
}

.refound_message {
  margin-top: 20px;
}

.refound_details h5 {
  font-size: 16px;
}

.refound_details .inform {
  margin-top: 20px;
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

.content .el-dialog__header {
  padding: 0
}

.flow h5 {
  font-size: 16px;
  margin: 40px 0 30px;
}

.flow p span {
  font-size: 16px;
  border: 1px solid;
  padding: 20px;
}

.apply {
  background-color: rgba(25, 158, 216, 1);
}

.default {
  background: rgba(204, 204, 204, 1);
}

.number {
  color: #0000FF;
  cursor: pointer;
}

</style>
