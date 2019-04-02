<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>药品管理</h4></el-col>
      <el-col :span="6">
        <!--<el-button type="primary" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加药品信息</el-button>-->
        <!--<el-button type="primary" plain @click="getInfo(1)">药品导入<i class="el-icon-upload el-icon&#45;&#45;right"></i></el-button>-->
        <!--<el-upload-->
          <!--class="upload-demo"-->
          <!--:action="headUrl + '/internethospital/api/products/action/import-medicine-product&object-id=' + fileId"-->
          <!--:limit="1"-->
          <!--:on-success="uploadSuccess">-->
          <!--<el-button type="primary">药品导入<i class="el-icon-upload el-icon&#45;&#45;right"></i></el-button>-->
        <!--</el-upload>-->
      </el-col>
    </el-row>
    <el-row class="search">
      <el-col :span="5">
      </el-col>
      <el-col :span="4">
        <el-input placeholder="请输入药品名称" clearable v-model="condition.medicinename"></el-input>
      </el-col>
      <el-col :span="7">
        <el-button type="success" plain @click="getInfo(1)">搜索</el-button>
        <el-button type="danger"  plain :disabled="!condition.medicinename" @click="resetCondition()">重置</el-button>
        <el-button type="primary" plain @click="getInfo(1)" v-if="canIVisit('operate', 'MEDICAL_EXPORT')">模板导出</el-button>
      </el-col>
    </el-row>
    <el-table :data="productlist" stripe v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" :show-overflow-tooltip="true" prop="text" label="产品名称"></el-table-column>
      <el-table-column align="left" prop="pinyinAbbreviate" label="拼音首字母"></el-table-column>
      <el-table-column align="left" prop="manufacturer" label="生产厂家"></el-table-column>
      <!--<el-table-column align="left" prop="orderItemTypeText" label="订单行项目类型名称"></el-table-column>-->
      <!--<el-table-column align="left" prop="orderItemTypeId" label="订单行项目id"></el-table-column>-->
      <el-table-column align="left" prop="standard" label="规格"></el-table-column>
      <el-table-column align="left" prop="shippingUnitText" label="单位"></el-table-column>
      <!--<el-table-column align="left" prop="type" label="类型"></el-table-column>-->
      <el-table-column header-align="right" align="right" label="价格">
        <template slot-scope="scope">
          <span>￥{{scope.row.price}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" label="操作" width="80" v-if="canIVisit('operate', 'MEDICAL_READ')">
        <template slot-scope="scope">
          <el-button size="mini" type="success" plain @click="goToDetail('check', scope.row.id ,scope.row.price)">查看</el-button>
          <!--<el-button size="mini" type="primary" plain @click="goToDetail('update', scope.row.id)">修改</el-button>-->
          <!--<el-button size="mini" type="danger" plain @click="deleteRow(scope.row.id)">删除</el-button>-->
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
  import rules from '../rules/index'
  export default {
    name: "medicine-product-manager",
    data() {
      return {
      accout:0,
        header: '',
        loading: false,
        productlist:[],
        listCount: 0,
        currentPage: 1,
        userinfo:'',
        organ: [],
        organizationid:'',
        organization_id:'',
        medicineOptions:[],
        condition: {
          medicinename:'',
        },
        headUrl: `${conf.url}`,
        fileId: '',

      }
    },
    activated() {  // 当页面激活时调用
      const token = localStorage.getItem('token');
      this.header = {headers: {'Authorization': 'Bearer '+token}};
      this.type = this.$route.query.type;
      console.log(this.$route.query);

      const userinfo = localStorage.getItem('userInfo');
      this.organ = JSON.parse(userinfo)
      console.log('organization_id_______',this.organ.organization_id);

      this.getInfo(1);
      this.currentPage = 1;
      this.fileId = 'departmentHeader' + Math.random() + Math.random();
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
      //初始化数据
      getInfo(page) {
        const organizationid = this.organ.organization_id;
        if(organizationid){
          let url = `${conf.url}/internethospital/api/products?page-index=${page}&page-size=10&type=MEDICINE&organization-id=${organizationid}`;
          if(this.condition.medicinename){
            url = `${url}&name=${this.condition.medicinename}`;
          }
          ax.get(url, this.header).then(res => {
            for(let i in res.data.content) {
              if (res.data.content[i].price.toString().indexOf('.') < 0) {
                res.data.content[i].price = res.data.content[i].price + '.00'
              } else {
                if (res.data.content[i].price.toString().slice(res.data.content[i].price.toString().indexOf('.') + 1).length < 2) {
                  res.data.content[i].price = res.data.content[i].price + '0'
                } else {
                  res.data.content[i].price = res.data.content[i].price.toString().slice(0, res.data.content[i].price.toString().indexOf('.') + 3)
                }
              }
            }
            this.productlist = res.data.content;
            this.listCount = res.data.totalElements;
          }).catch(err => {
            this.refreshTokened(err)
            console.log(err);
            this.$message({
              type: 'warning',
              message: err.response.data.message
            });
          })
        }else {
          let url = `${conf.url}/internethospital/api/products?page-index=${page}&page-size=10&type=MEDICINE`;
          if(this.condition.medicinename){
            url = `${url}&name=${this.condition.medicinename}`;
          }
          ax.get(url, this.header).then(res => {
            for(let i in res.data.content) {
              if (res.data.content[i].price && res.data.content[i].price.toString().indexOf('.') < 0) {
                res.data.content[i].price = res.data.content[i].price + '.00'
              } else {
                if (res.data.content[i].price && res.data.content[i].price.toString().slice(res.data.content[i].price && res.data.content[i].price.toString().indexOf('.') + 1).length < 2) {
                  res.data.content[i].price = res.data.content[i].price + '0'
                } else {
                  res.data.content[i].price = res.data.content[i].price && res.data.content[i].price.toString().slice(0, res.data.content[i].price && res.data.content[i].price.toString().indexOf('.') + 3)
                }
              }
            }
            this.productlist = res.data.content;
            this.listCount = res.data.totalElements;
          }).catch(err => {
            this.refreshTokened(err)
            console.log(err);
            this.$message({
              type: 'warning',
              message: err.response.data.message
            });
          })


        }
      },
      resetCondition () {
        this.condition = {
          medicinename: '',
        }
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
//         this.$message({
//            type: 'warning',
//            message: err.response.data.message
//          });
        })
      },
      goToDetail(type, id, price) {
        this.$router.push({
          path: '/medicine-product-manager/detail',
          query: {
            type: type,
            id: id,
            price: price
          }
        });
      },
      uploadSuccess (response, file, fileList) {
        // if(file.size/1024 <= 1024){
          this.imgUrl = response.path
          console.log(response);
        // }else {
        //   this.fileList = [];
          // this.fileList2 = [];
          // this.$message({
          //   type: 'warning',
          //   message: '上传文件大小不能大于1MB，请重新上传'
          // })
        // }
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
