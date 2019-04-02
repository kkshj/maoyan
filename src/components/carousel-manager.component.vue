<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>首页论播图管理</h4></el-col>
      <el-col :span="6"><el-button type="primary" v-if="canIVisit('operate', 'CAROUSEL_CREATE')" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加轮播图信息</el-button></el-col>
    </el-row>

    <el-table :data="shufflings" v-loading = "loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>

      <el-table-column align="left" label="缩略图" prop="imgUrl">
        <template slot-scope="scope">
          <img :src="scope.row.imgUrl" style="width: 40px;height: 40px;display: block;"/>
        </template>
      </el-table-column>

      <!--<el-table-column align="left" label="图片id" prop="id"></el-table-column>-->
      <el-table-column align="left" label="平台类型" prop="platformType"></el-table-column>
      <el-table-column align="left" label="跳转类型" prop="jumpType">
        <template slot-scope="scope">
          <span>{{scope.row.jumpType === 'INTERNAL' ? '内部' : '外部'}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="跳转链接" prop="skipLinks"></el-table-column>
      <el-table-column align="left" label="所属医院" prop="organizationText"></el-table-column>

      <el-table-column align="left" label="操作" width="240" v-if="canIVisit('operate', 'CAROUSEL_READ') || canIVisit('operate', 'CAROUSEL_UPDATE') || canIVisit('operate', 'CAROUSEL_DELETE')">
        <template slot-scope="scope">
          <el-button v-if="canIVisit('operate', 'CAROUSEL_READ')" size="mini" type="success" plain @click="goToDetail('check', scope.row.id)">查看</el-button>
          <el-button v-if="canIVisit('operate', 'CAROUSEL_UPDATE')" size="mini" type="primary" plain @click="goToDetail('update', scope.row.id)">修改</el-button>
          <el-button v-if="canIVisit('operate', 'CAROUSEL_DELETE')" size="mini" type="danger" plain @click="deleteRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      layout="prev, pager, next"
      :current-page="currentPage"
      :total="listCount"
      @current-change="changePage">
    </el-pagination>
  </div>
</template>


<script>

  import ax from '../api/axios.api'
  import conf from '../config.json'
  import rules from '../rules/index'

    export default {
        name: "carousel",

        data () {
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

            shufflings: [],
            addOne: false,
            delivery: {},

            listCount: 0,
            currentPage: 1,
            p: {
              contactPhone: ''
            },

          }
        },

      activated () {
        const organizationsCode = localStorage.getItem('organizationsCode');
        if (organizationsCode) {
          this.condition.hospitalCode = organizationsCode;
        }
        const token = localStorage.getItem('token');
        this.header = {headers: {'Authorization': 'Bearer '+token}};
        this.type = this.$route.query.type;
        console.log(this.$route.query);

        this.loading = true;
        this.getInfo(1);
        this.currentPage = 1;
      },

      // mounted () {
      //   this.getInfo(1);
      // },

        methods: {
          canIVisit(type, functions){
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
            let url = `${conf.url}/internethospital/api/image-shufflings?page-index=${page}&page-size=10`;
            if (this.condition.hospitalCode) {
              url = `${url}&organization-code=${this.condition.hospitalCode}`;
            }
            ax.get(url, this.header).then(res => {
              console.log(res);
              this.loading = false
              for (let i in res.data.content){
                if (res.data.content[i].organizationId) {
                  let url = `${conf.url}/internethospital/api/organizations/${res.data.content[i].organizationId}`;
                  ax.get(url, this.header).then(resp => {
                    console.log(resp.data.text)
                    res.data.content[i].organizationText = resp.data.text;
                    this.shufflings = res.data.content;
                  })
                } else {
                  this.shufflings = res.data.content;
                }
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
          resetCondition () {
            this.condition = {
              orderCode: '',
              customerPhone: '',
              address: '',
              status: ''
            }
          },



          goToDetail (type, id) {
            console.log("goToDetail::::::::::::",id)
            this.$router.push({
              path: '/carousel-manager/detail',
              query: {
                type: type,
                id: id
              }
            });
          },

          deleteRow (row) {
            console.log("row.id打印：：",row.id);
            this.$confirm(`此操作将删除该条数据，是否继续？`,`提示`,{
              confirmButtonText:`确定`,
              cancelButtonText:`取消`,
              type:`warning`
            }).then(() =>{
              const url = `${conf.url}/internethospital/api/image-shufflings/${row.id}`;
              ax.delete(url, this.header).then(res => {
                console.log(res);
                this.getInfo(this.currentPage)
              }).catch(err => {
                this.refreshTokened(err)
                this.$message({
                  type: 'warning',
                  message: err.response.data.message
                });
              })
            })
          },

          changePage (p) {
            this.getInfo(p);
            this.currentPage = p;
          },

        }
    }
</script>


<style scoped>
  .el-row.header{
    height: 50px;
    line-height: 50px;
    border-bottom: solid 1px #409EFF;
  }
  .el-row.header>.el-col:first-child{
    text-align: left;
  }
  .el-row.header>.el-col:last-child {
    text-align: right;
  }

  .el-row.search{
    height: 50px;
    line-height: 50px;
  }
  .el-row.search>.el-col{
    padding: 0 10px;
    text-align: left;
  }

  .el-form{
    width: 70%;
    margin: 0 auto;
  }
  .el-select{
    width: 100%;
  }
  .el-dialog .el-form-item{
    text-align: left;
  }


</style>
