<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>机构定价条件管理</h4>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加定价条件</el-button>
      </el-col>
    </el-row>
    <el-table :data="pricecondition" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" :show-overflow-tooltip="true" label="定价id" prop="id"></el-table-column>
      <el-table-column align="left" label="机构" prop="organizationText"></el-table-column>
      <el-table-column align="left" label="量" prop="amount"></el-table-column>
      <el-table-column align="left" label="数量" prop="quantity"> </el-table-column>
      <el-table-column align="left" label="开始时间" prop="startTime"></el-table-column>
      <el-table-column align="left" label="结束时间" prop="endTime"></el-table-column>
      <el-table-column align="left" label="操作" width="240">
        <template slot-scope="scope">
          <el-button size="mini" type="success" plain @click="goToDetail('check', scope.row.id)">查看</el-button>
          <el-button size="mini" type="primary" plain @click="goToDetail('update', scope.row.id)">修改</el-button>
          <el-button size="mini" type="danger" plain @click="deleteRow(scope.row)">删除</el-button>
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
export default {
  name: "organization-price-condition-manager",
  data() {
    return {
    accout:0,
      loading: false,
      condition: {
        orderCode: '',
        customerPhone: '',
        address: '',
        status: ''
      },
      pricecondition: [],
      secondDepartment: [],
      addOne: false,
      delivery: {},


      listCount: 0,
      currentPage: 1,
      p: {
        contactPhone: ''
      },

    }
  },
  activated(){
  this.getInfo(1);
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
          _this.header = { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } };
          _this.getInfo(1)
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },
    getInfo(page) {
      const url = `${conf.url}/internethospital/api/organization-price-condition?page-index=${page}&page-size=10`;
      ax.get(url, this.header).then(res => {
        //   this.pricecondition = res.data.content;
        this.listCount = res.data.totalElements;

        for (let i in res.data.content) {
          let url = `${conf.url}/internethospital/api/organizations/${res.data.content[i].organizationId}`;
          ax.get(url, this.header).then(resp => {
            for (let j in resp.data) {
              // console.log('text::',resp.data.text)
              // resp.data.content[j].organizationText = this.pricecondition[i].text;
              res.data.content[i].organizationText = resp.data.text;

            }
            this.pricecondition = res.data.content;
            console.log('赋值之后pricecondition:', this.pricecondition);

          })
        }


      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    create() {
      const url = `${conf.url}/internethospital/api/product`;
      const body = {
        "id": "string",
        "longText": "string",
        "manufacturer": "string",
        "name": "string",
        "orderItemTypeId": "string",
        "standard": "string",
        "text": "string"
      };
      ax.post(url, body, this.header).then(res => {
        console.log(res);
        this.getInfo(1)
      }).catch(err => {
        this.refreshTokened(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    update() {
      const url = `${conf.url}/internethospital/api/product/${id}`;
      const body = {
        "id": "string",
        "longText": "string",
        "manufacturer": "string",
        "name": "string",
        "orderItemTypeId": "string",
        "standard": "string",
        "text": "string"
      };
      ax.put(url, body, this.header).then(res => {
        console.log(res);
        this.getInfo(1)
      }).catch(err => {
        this.refreshTokened(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    deleteRow(id) {
      const url = `${conf.url}/internethospital/api/product?id=${id}`;
      ax.delete(url, this.header).then(res => {
        console.log(res);
        this.getInfo()
      }).catch(err => {
        this.refreshTokened(err)
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    check(id) {
      const url = `${conf.url}/internethospital/api/product?id=${id}`;
      ax.get(url, this.header).then(res => {
        connsole.log(res)
        this.produclist = res;
      }).catch(err => {
        this.refreshTokened(err)
        console.log(err);
        this.$message({
          type: 'warning',
          message: err.response.data.message
        });
      })
    },
    goToDetail(type, id) {
      this.$router.push({
        path: '/organization-price-condition-manager/detail',
        query: {
          type: type,
          id: id
        }
      });
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
