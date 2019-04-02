<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>产品服务管理</h4></el-col>
      <el-col :span="6"><el-button type="primary" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加药品信息</el-button></el-col>
    </el-row>
    <el-table :data=" productlist" stripe v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" :show-overflow-tooltip="true" prop="code" label="产品编码"></el-table-column>
      <el-table-column align="left" :show-overflow-tooltip="true" prop="id" label="产品id"></el-table-column>
      <el-table-column align="left" prop="text" label="产品名称"></el-table-column>
      <!--<el-table-column align="left" prop="manufacturer" label="生产厂家"></el-table-column>-->
      <!--<el-table-column align="left" prop="orderItemTypeText" label="订单行项目类型名称"></el-table-column>-->
      <!--<el-table-column align="left" prop="orderItemTypeId" label="订单行项目id"></el-table-column>-->
      <!--<el-table-column align="left" prop="standard" label="规格"></el-table-column>-->
      <el-table-column align="left" prop="type" label="产品类型"></el-table-column>
      <el-table-column align="left" label="操作" width="240">
        <template slot-scope="scope">
          <el-button size="mini" type="success" plain @click="goToDetail('check', scope.row.id)">查看</el-button>
          <el-button size="mini" type="primary" plain @click="goToDetail('update', scope.row.id)">修改</el-button>
          <el-button size="mini" type="danger" plain @click="deleteRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
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
  export default {
    name: "consult-product-manager",
    data() {
      return {
      accout:0,
        header: '',
        loading: false,
        productlist:[],
        listCount: 0,
        currentPage: 1,



      }
    },
    activated() {  // 当页面激活时调用
      const token = localStorage.getItem('token');
      this.header = {headers: {'Authorization': 'Bearer '+token}};
      this.type = this.$route.query.type;
      console.log(this.$route.query);

      this.getInfo(1);
      this.currentPage = 1;
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
          _this.getInfo(1)
        }).catch(err => {
          console.log('网络不加')
        })
      }
    }, 
      //初始化数据
      getInfo(page) {
        const url = `${conf.url}/internethospital/api/products?page-index=${page}&page-size=10&type=CONSULT`;
        ax.get(url, this.header).then(res => {
          this.productlist = res.data.content
          this.listCount = res.data.totalElements;
          console.log('getInfo:::res：：',res)
        }).catch(err => {
          this.refreshTokened(err)
          console.log(err);
         this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      },

      changePage (p) {
        this.getInfo(p);
        this.currentPage = p;
      },
      deleteRow(id) {
        const url = `${conf.url}/internethospital/api/products/${id}`;
        ax.delete(url, this.header).then(res => {
          console.log(res);
          this.getInfo(1)
        }).catch(err => {
          this.refreshTokened(err)
          console.log(err);
          this.$message({
             type: 'warning',
             message: err.response.data.message
           });
        })
      },
      goToDetail(type, id,) {
        this.$router.push({
          path: '/consult-product-manager/detail',
          query: {
            type: type,
            id: id
          }
        });
      },
      cancel() {

      }
    },
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
