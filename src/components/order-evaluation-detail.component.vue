<template>
  <div>
    <el-row class="header">
      <el-col :span="12"><h4>评价信息详情</h4>
      </el-col>
      <el-col :span="12">
        <el-button type="danger" plain icon="el-icon-back" @click="cancel">返回</el-button>
        <el-button v-if="canIVisit('operate', 'EVALUATE_EXAMINE')" type="primary" :disabled="audited === false ? false : true" plain icon="el-icon-check" @click="auditRow()">审核</el-button>
      </el-col>
    </el-row>
    <el-form ref="orderEvaluation" :model="orderEvaluation" label-width="140px" :rules="rules" style="width: 70%; margin: 20px auto;">
      <el-form-item label="医生/护士" prop="doctorOrNurse">
        <span v-if="type==='check'">{{orderEvaluation.doctorName || orderEvaluation.nurseName}}</span>
      </el-form-item>
      <el-form-item label="评价时间" prop="createdDate">
        <span v-if="type==='check'">{{orderEvaluation.createdDate}}</span>
      </el-form-item>
      <el-form-item label="评价内容" prop="evaluation">
        <span v-if="type==='check'">{{orderEvaluation.evaluation}}</span>
      </el-form-item>
      <el-form-item label="回复及时性" prop="promptness">
        <span v-if="type==='check'">{{orderEvaluation.promptness}}</span>
      </el-form-item>
      <el-form-item label="服务态度" prop="attitude">
        <span v-if="type==='check'">{{orderEvaluation.attitude}}</span>
      </el-form-item>
      <el-form-item label="是否审核通过" prop="audited">
        <span v-if="type==='check'">{{orderEvaluation.audited === false ?  '否' : '是'}}</span>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "orderEvaluation-detail",
  data() {
    return {
    accout:0,
      type: '',
      audited: '',
      header: '',
      orderEvaluation: {},
      rules: {}
    }
  },
  activated() {
    const token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.audited = this.$route.query.audited;
    this.type = this.$route.query.type;
    this.getInfo(this.$route.query.id);
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
      const url = `${conf.url}/internethospital/api/evaluations/?page-index=1&page-size=10&order-evaluation-id=${id}`;
      ax.get(url, this.header).then(res => {
        this.orderEvaluation = res.data.content[0];
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    auditRow() {
      this.$confirm(`点击确认，审批通过`, `提示`, {
        distinguishCancelAndClose: true,
        confirmButtonText: `确定`,
        cancelButtonText: `取消`,
        type: `warning`
      }).then(() => {
        /*到后台执行审批操作*/
        const url = `${conf.url}/internethospital/api/evaluations/` + this.$route.query.id;
        ax.post(url, this.header).then(res => {
          this.$message({
            /*删除成功返回成功信息*/
            message: '审核通过',
            type: 'success'
          })
          this.cancel();
        }).catch(err => {
          this.refreshTokened(err)
          console.log(err);
          this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      }).catch(err => {

        this.$message({
          message: '审核取消',
          type: 'info'
        })
      })
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

</style>
