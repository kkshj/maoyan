<template>
  <div>
    <el-row class="header">
      <el-col :span="12"><h4>排班信息{{type === 'add' ? '录入' : type === 'update' ? '编辑' : ''}}</h4>
      </el-col>
      <el-col :span="12">
        <el-button type="danger" plain icon="el-icon-back" @click="cancel">返回</el-button>
        <el-button v-if="canIVisit('operate', 'SCHEDULE_CREATE')" type="primary" plain icon="el-icon-plus" @click="goToDetail('add', docid)">添加排班</el-button>
      </el-col>
    </el-row>
    <el-form ref="doctorInformation" :model="doctorInformation" label-width="160px" :rules="rules" style="width: 70%; margin: 20px auto;">
      <el-form-item label="医生姓名" prop="doctorName">
        <span  v-if="type==='check'">{{doctorInformation.doctorName}}</span>
        <el-input v-else v-model="doctorInformation.doctorName"></el-input>
      </el-form-item>
      <el-form-item label="所属医院" prop="organizationText">
        <span v-if="type==='check'">{{doctorInformation.organizationText}}</span>
        <el-input v-else v-model="doctorInformation.organizationText"></el-input>
      </el-form-item>
      <el-form-item label="所属科室" prop="departmentText">
        <span  v-if="type==='check'">{{doctorInformation.departmentText}}</span>
        <el-input v-else v-model="doctorInformation.departmentText"></el-input>
      </el-form-item>
      <el-form-item label="排班状态" prop="scheduling">
        <span  v-if="type==='check'">{{doctorInformation.scheduling===true ? '已开启' : '已关闭'}}</span>
        <el-select v-else v-model="doctorInformation.scheduling" placeholder="请选择排班状态">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <br>
      <h4 align="left" v-if="type==='check'">排班列表</h4><span>（临时排班）</span>
      <br>
      <el-table v-if="type==='check'" :data="schedulingList" style="width: 100%">
        <!--<el-table-column align="left" type="index"></el-table-column>-->
        <el-table-column align="left" label="接诊日期" prop="startTime">
          <template slot-scope="scope">
            <span>{{scope.row.startDate}} （{{scope.row.week}}）</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="接诊时间" prop="endTime">
          <template slot-scope="scope">
            <span>{{scope.row.startTime}}-{{scope.row.endTime}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="排班来源" prop="source">
          <template slot-scope="scope">
            <span>{{scope.row.source==='HOSPITAL'? '医院创建':'医生创建'}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column align="left" label="循环问诊" prop="cycle">-->
        <!--<template slot-scope="scope">-->
        <!--<span>{{scope.row.cycle===false? '否' : '是'}}</span>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column align="left" label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" plain @click="goToDetail('update', scope.row.id, scope.row.cycle)">编辑</el-button>
            <el-button size="mini" type="danger" plain @click="deleteTemporary(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <span>（循环排班）</span>
      <br>
      <el-table v-if="type==='check'" :data="schedulingCycleList" style="width: 100%">
        <!--<el-table-column align="left" type="index"></el-table-column>-->
        <el-table-column align="left" label="接诊日期" prop="startTime">
          <template slot-scope="scope">
            <span>{{scope.row.startDate}} （{{scope.row.week}}）</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="接诊时间" prop="endTime">
          <template slot-scope="scope">
            <span>{{scope.row.startTime}}-{{scope.row.endTime}}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="排班来源" prop="source">
          <template slot-scope="scope">
            <span>{{scope.row.source==='HOSPITAL'? '医院创建':'医生创建'}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column align="left" label="循环问诊" prop="cycle">-->
        <!--<template slot-scope="scope">-->
        <!--<span>{{scope.row.cycle===false? '否' : '是'}}</span>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column align="left" label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" plain @click="goToCycleDetail('update', scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" plain @click="deleteCycleTemporary(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "scheduling-detail",
  data() {
    return {
    accout:0,
      type: '',
      header: '',
      docid: '',
      doctorInformation: {},
      /*排班详情集合*/
      schedulingList: [],
      /*循环排班集合*/
      schedulingCycleList: [],
      rules: {},
      statusOptions: [
        { value: 'OPEN', label: '已开启' },
        { value: 'CLOSE', label: '已关闭' }
      ],
    }
  },
  activated() {
    const token = localStorage.getItem("token");
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.type = this.$route.query.type;
    this.docid = this.$route.query.id
    if (this.type !== 'add') { /*传入类型不为add，调用getinfo方法，范回数据*/
      this.getInfo(this.$route.query.id);
    } else { /*传入类型为add，doctorInformation赋值为空*/
      this.doctorInformation = {};
    }
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
              if (_this.type !== 'add') { /*传入类型不为add，调用getinfo方法，范回数据*/
      _this.getInfo(_this.$route.query.id);
    } else { /*传入类型为add，doctorInformation赋值为空*/
      _this.doctorInformation = {};
    }
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
      const url = `${conf.url}/internethospital/api/doctors/${id}`;
      this.schedulingList = [];
      this.schedulingCycleList = [];
      ax.get(url, this.header).then(res => {
        /*查出医生的基本信息，再查询排班信息*/
        this.doctorInformation = res.data;
        const urlScheduling = `${conf.url}/internethospital/api/scheduling/temporary?page-index=1&page-size=1000&doctor-id=${id}`;
        ax.get(urlScheduling, this.header).then(res => {
          for (let item of res.data.content) {
            this.schedulingList = this.schedulingList.concat(item.schdulingShowDetails)
          }
        });
        const urlCycleScheduling = `${conf.url}/internethospital/api/scheduling/cycle?page-index=1&page-size=1000&doctor-id=${id}`;
        ax.get(urlCycleScheduling, this.header).then(resCycle => {
          for (let item of resCycle.data.content) {
            this.schedulingCycleList = this.schedulingCycleList.concat(item.schdulingShowDetails);
          }
        });

      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    deleteTemporary(id) { //临时排班删除
      this.$confirm(`此操作将删除该条数据，是否继续？`, `提示`, {
        confirmButtonText: `确定`,
        cancelButtonText: `取消`,
        type: `warning`
      }).then(() => {
        /*到后台执行删除操作*/
        const url = `${conf.url}/internethospital/api/scheduling/temporary/${id}`;
        ax.delete(url, this.header).then(res => {
          this.$message({
            /*删除成功返回成功信息*/
            message: '删除成功',
            type: 'success'
          })
          this.getInfo(this.docid)
        }).catch(err => {
        this.refreshTokened(err)
          console.log(err);
          this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      }).catch(err => {
        this.refreshTokened(err)
        this.$message('取消删除')
      })
    },
    deleteCycleTemporary(id) { //循环排班删除
      this.$confirm(`此操作将删除该条数据，是否继续？`, `提示`, {
        confirmButtonText: `确定`,
        cancelButtonText: `取消`,
        type: `warning`
      }).then(() => {
        /*到后台执行删除操作*/
        const url = `${conf.url}/internethospital/api/scheduling/cycle/${id}`;
        ax.delete(url, this.header).then(res => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getInfo(this.docid)
        }).catch(err => {
        this.refreshTokened(err)
          console.log(err);
          this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      }).catch(err => {
        this.$message('取消删除')
      })
    },
    goToDetail(type, id) {
      this.$router.push({
        path: '/doctor-type-setting-scheduling-manager/detail',
        query: {
          type: type,
          id: id
        }
      });
    },
    goToCycleDetail(type, id) {
      this.$router.push({
        path: '/doctor-type-setting-scheduling-cycle-manager/detail',
        query: {
          type: type,
          id: id
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

</style>
