<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>医院管理</h4>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" v-if="canIVisit('operate', 'HOSPITAL_CREATE')" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加医院信息</el-button>
      </el-col>
    </el-row>
    <el-table :data="hospitalListInfo" v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" label="logo" prop="logoUrl">
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" style="width: 40px;height: 40px;display: block;"/>
        </template>
      </el-table-column>
      <el-table-column align="left" label="医院名称" prop="text"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="left" label="地址" prop="address"></el-table-column>
      <el-table-column align="left" label="经度" prop="longitude"></el-table-column>
      <el-table-column align="left" label="纬度" prop="latitude"></el-table-column>
      <el-table-column align="left" label="机构类型" prop="type">
        <template slot-scope="scope">
          <span>{{scope.row.type === "HOSPITAL" ? "医院" : scope.row.type === "BRANCH" ? "分院" : scope.row.type}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="联系电话" prop="contactPhone"></el-table-column>
      <el-table-column align="left" v-if="canIVisit('operate', 'HOSPITAL_READ') || canIVisit('operate', 'HOSPITAL_UPDATE') || canIVisit('operate', 'HOSPITAL_DELETE')" label="操作" width="240">
        <template slot-scope="scope">
          <el-button size="mini" v-if="canIVisit('operate', 'HOSPITAL_READ')" type="success" plain @click="goToDetail('check', scope.row.id)">查看</el-button>
          <el-button size="mini" v-if="canIVisit('operate', 'HOSPITAL_UPDATE')" type="primary" plain @click="goToDetail('update', scope.row.id)">修改</el-button>
          <el-button size="mini" v-if="canIVisit('operate', 'HOSPITAL_DELETE')" type="danger" plain @click="deleteRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination layout="prev, pager, next" :current-page="currentPage" :total="listCount" @current-change="changePage">
    </el-pagination>
  </div>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "hospital-manager",
  data() {
    return {
    accout:0,
      loading: false,
      condition: {
        hospitalCode: '',
        orderCode: '',
        customerPhone: '',
        address: '',
        status: ''
      },
      hospitalListInfo: [],
      addOne: false,
      delivery: {},
      listCount: 0,
      currentPage: 1,
      p: {
        contactPhone: ''
      },
    }
  },
  activated() {
    const organizationsCode = localStorage.getItem('organizationsCode');
    if (organizationsCode) {
      this.condition.hospitalCode = organizationsCode;
    }
    const token = localStorage.getItem('token');
    this.header = { headers: { 'Authorization': 'Bearer ' + token } };
    this.type = this.$route.query.type;

    this.loading = true;
    this.getInfo(1);
    this.currentPage = 1;
  },
  // mounted () {
  //   this.getInfo(1);
  // },
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
          _this.getInfo(1)
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
    getInfo(page) {
      let url = `${conf.url}/internethospital/api/organizations?page-index=${page}&page-size=10`;
      if (this.condition.hospitalCode) {
        url = `${url}&organization-code=${this.condition.hospitalCode}`
      }
      ax.get(url, this.header).then(res => {
        console.log(res);
        this.hospitalListInfo = res.data.content;
        this.listCount = res.data.totalElements;
        this.loading = false
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    resetCondition() {
      this.condition = {
        orderCode: '',
        customerPhone: '',
        address: '',
        status: ''
      }
    },
    goToDetail(type, id) {
      console.log("goToDetail::::::::::::", id)
      this.$router.push({
        path: '/hospital-manager/detail',
        query: {
          type: type,
          id: id
        }
      });
    },
    deleteRow(row) {
      console.log("row.id打印：：", row.id);
      this.$confirm(`此操作将删除该条数据，是否继续？`, `提示`, {
        confirmButtonText: `确定`,
        cancelButtonText: `取消`,
        type: `warning`
      }).then(() => {
        const url = `${conf.url}/internethospital/api/organizations/${row.id}`;
        ax.delete(url, this.header).then(res => {
          console.log(res);
          this.getInfo(this.currentPage);
          this.$message({
            type: 'success',
            message: '删除成功'
          });
        }).catch(err => {
           this.refreshTokened(err)
          this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      })
    },
    changePage(p) {
      this.getInfo(p);
      this.currentPage = p;
    },

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

.el-row.search {
  height: 50px;
  line-height: 50px;
}

.el-row.search>.el-col {
  padding: 0 10px;
  text-align: left;
}

.el-form {
  width: 70%;
  margin: 0 auto;
}

.el-select {
  width: 100%;
}

.el-dialog .el-form-item {
  text-align: left;
}

</style>
