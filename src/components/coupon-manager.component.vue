<template>
  <div>
    <el-row class="header">
      <el-col :span="18"><h4>优惠券管理</h4></el-col>
      <el-col :span="6">
        <el-button type="primary" v-if="canIVisit('operate', 'COUPON_CREATE')" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加优惠券</el-button>
      </el-col>
    </el-row>
<!--    <el-row class="search">
      <el-col :span="7">
        &lt;!&ndash;<el-input placeholder="请输入活动编码" clearable v-model="condition.activityCode"></el-input>&ndash;&gt;
        <el-select
          v-model="condition.activityCode"
          filterable
          remote
          placeholder="请输入活动编码"
          :remote-method="remoteActivityCodeMethod">
          <el-option
            v-for="item in activityCodeOptions"
            :key="item.id"
            :label="item.activityCode"
            :value="item.activityCode">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="7">
        &lt;!&ndash;<el-input placeholder="请输入优惠券编码" clearable v-model="condition.code"></el-input>&ndash;&gt;
        <el-select
          v-model="condition.code"
          filterable
          remote
          placeholder="请输入优惠券编码"
          :remote-method="remoteCodeMethod">
          <el-option
            v-for="item in codeOptions"
            :key="item.id"
            :label="item.code"
            :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-button type="success" plain @click="getInfo(1)">搜索</el-button>
        <el-button type="danger"  plain :disabled="!condition.activityCode&&!condition.code" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>-->
    <el-table :data="couponlist"  v-loading="loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" prop="code" label="编码"></el-table-column>
      <el-table-column align="left" prop="activityCode" label="活动编码"></el-table-column>
      <el-table-column align="left" prop="productCode" label="产品编码"></el-table-column>
      <el-table-column align="left" prop="text" label="优惠券名称"></el-table-column>
      <el-table-column align="left" prop="amount" label="金额">
        <template slot-scope="scope">
          <span>￥{{scope.row.amount.slice(1, scope.row.amount.indexOf('.'))}}</span>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="effectiveDays" label="有效天数"></el-table-column>
      <el-table-column align="left" prop="startTime" label="开始时间"></el-table-column>
      <el-table-column align="left" prop="endTime" label="结束时间"></el-table-column>
      <el-table-column align="left" prop="activityText" label="活动介绍"></el-table-column>
      <!--<el-table-column align="left" prop="status" label="活动状态"></el-table-column>-->
      <el-table-column align="left" prop="productCode" label="产品编码"></el-table-column>
      <el-table-column align="left" prop="productText" label="产品文本"></el-table-column>

      <el-table-column align="left" label="操作" width="340" v-if="canIVisit('operate', 'COUPON_DOWNLOAD') || canIVisit('operate', 'COUPON_READ') || canIVisit('operate', 'COUPON_UPDATE') || canIVisit('operate', 'COUPON_DELETE')">
        <template slot-scope="scope">
          <el-button type="warning" v-if="canIVisit('operate', 'COUPON_DOWNLOAD')" plain icon="el-icon-download" @click="downloadCouponCode(scope.row.code)">下载二维码</el-button>
          <el-button size="mini" type="success" v-if="canIVisit('operate', 'COUPON_READ')" plain @click="goToDetail('check', scope.row.code)">查看</el-button>
          <el-button size="mini" type="primary" v-if="canIVisit('operate', 'COUPON_UPDATE')" plain @click="goToDetail('update', scope.row.code, scope.row.id)">修改</el-button>
          <el-button size="mini" type="danger" v-if="canIVisit('operate', 'COUPON_DELETE')" plain @click="deleteRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--layout代表组件布局，子组件名用逗号分隔
        属性： total代表总条目数
        事件： current-change用于监听页数改变，而内容也发生改变-->
    <div class="block">
      <br>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        @current-change="getInfo">
      </el-pagination>

    </div>
  </div>
</template>

<script>
  import ax from '../api/axios.api'
  import conf from '../config.json'
  import rules from '../rules/index'
  export default {
    name: "doctor-manager",
    data () {
      return {
      accout:0,
        currentPage:1,//默认开始页面
        total:0,//默认数据总数
        loading:false,
        condition: {
          hospitalCode: '',
          activityCode: '',
          code:''
        },
        couponlist: [],
        addOne: false,
        delivery: {},
        activityCodeOptions:[],
        codeOptions:[]
      }
    },
    activated () {
      const organizationsCode = localStorage.getItem('organizationsCode');
      if (organizationsCode) {
        this.condition.hospitalCode = organizationsCode;
      }
      this.loading = true;
      this.condition.activityCode = null;
      this.condition.code = null;
      const token = localStorage.getItem("token");
      this.header = {headers: {'Authorization': 'Bearer '+token}};
      this.getInfo(this.currentPage);//页面默认加载首页
      this.condition = {}
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
          _this.getInfo(_this.currentPage)
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
      getInfo(currentPage) {
        let url = `${conf.url}/internethospital/api/coupons?page-index=`+currentPage+`&page-size=10`;
        if (this.condition.hospitalCode) {
          url = `${url}&organization-code=${this.condition.hospitalCode}`;
        }
        /*if(this.condition.activityCode){
          url = `${url}&activity-code=${this.condition.activityCode}`;
        }
        if(this.condition.code){
          url = `${url}&coupon-code=${this.condition.code}`;
        }*/
        /*向后台获取数据*/
        ax.get(url, this.header).then(res => {
          //console.log('res',res)
          this.couponlist = res.data.content;
          this.total = res.data.totalElements;/*设置总条数*/
          this.loading = false;
        }).catch(err => {
          this.refreshTokened(err)
          console.log('err',err);
          this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      },
      resetCondition () {
        this.condition = {
          activityCode: '',
          code:''
        }
      },
      goToDetail (type,code,tt) {
        this.$router.push({
          path: '/coupon-manager/detail',
          query: {
            type: type,
            code: code,
            id:tt
          }
        });
      },
      deleteRow (row) {
        this.$confirm(`此操作将删除该条数据，是否继续？`,`提示`,{
          confirmButtonText:`确定`,
          cancelButtonText:`取消`,
          type:`warning`
        }).then(()=>{
          /*到后台执行删除操作*/
          const url = `${conf.url}/internethospital/api/coupons/`+row.id;
          ax.delete(url,this.header).then(res => {
            this.$message({
              /*删除成功返回成功信息*/
              message:'删除成功',
              type: 'success'
            })
            this.currentPage = 1;
            this.getInfo(this.currentPage)
          }).catch(err => {
            this.refreshTokened(err)
            console.log(err);
            this.$message({
              type: 'warning',
              message: err.response.data.message
            });
          })
        }).catch(err =>{
          this.refreshTokened(err)
          this.$message.error('取消删除')
        })
      },
      downloadCouponCode(code){/*下载优惠券二维码*/
        const url = `${conf.url}/internethospital/api/coupons/action/download-micro-app-qrcode?coupon-code=${code}`;
        let element = document.createElement("FORM");
        element.method="POST";
        element.action = url;
        document.body.appendChild(element);
        element.submit();
      }

      /*remoteActivityCodeMethod(str){//查询活动编码
        const url = `${conf.url}/internethospital/api/coupons?page-index=1&page-size=10&activity-code=${str}`;
        ax.get(url,this.header).then(res => {
          this.activityCodeOptions = res.data.content
        })
      },
      remoteCodeMethod(str){//优惠券编码
        const url = `${conf.url}/internethospital/api/coupons?page-index=1&page-size=10&coupon-code=${str}`;
        ax.get(url,this.header).then(res => {
          this.codeOptions = res.data.content
        })
      }*/
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
