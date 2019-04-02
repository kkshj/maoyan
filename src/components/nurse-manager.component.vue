<template>
  <div>
    <el-row class="header">

      <el-col :span="18"><h4>护师管理</h4></el-col>
      <el-col :span="6">
        <el-button type="primary" v-if="canIVisit('operate', 'NURSE_CREATE')" plain icon="el-icon-plus" @click="goToDetail('add', '')">添加护师信息</el-button>
      </el-col>
    </el-row>
    <el-row class="search">
      <el-col :span="8"><el-input placeholder="请输入护师姓名" clearable v-model="searchCondition.nurseName"></el-input></el-col>
      <el-col :span="8" v-if="!hasHospital">
        <el-select
          v-model="searchCondition.hospitalCode"
          filterable
          remote
          placeholder="请输入医院"
          :remote-method="remoteHospitalMethod">
          <el-option
            v-for="item in hospitalOptions"
            :key="item.id"
            :label="item.text"
            :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="success" plain @click="getInfo(1)">搜索</el-button>
        <el-button type="danger"  plain :disabled="!searchCondition.nurseName && !searchCondition.hospitalCode" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-row class="search" v-if="canIVisit('operate', 'NURSE_DOWNLOAD')">
      <el-col :span="5" v-if="!hasHospital">
        <el-select
          v-model="condition.hospitalCode"
          filterable
          remote
          placeholder="护师所属医院"
          :remote-method="remoteHospitalMethod">
          <el-option
            v-for="item in hospitalOptions"
            :key="item.id"
            :label="item.text"
            :value="item.code">
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="5">
        <el-select
          v-model="condition.departmentId"
          filterable
          remote
          placeholder="护师所属科室（一级）"
          :remote-method="remoteDepartmentMethod">
          <el-option
            v-for="item in departmentOptions"
            :key="item.id"
            :label="item.text"
            :value="item.id">
            <span style="float: left">{{ item.text }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="5">
        <el-select
          v-model="condition.secondDepartmentId"
          filterable
          remote
          placeholder="护师所属科室（二级）"
          :remote-method="remoteSecondDepartmentMethod">
          <el-option
            v-for="item in secondDepartmentOptions"
            :key="item.id"
            :label="item.text"
            :value="item.id">
            <span style="float: left">{{ item.text }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.organizationText }}</span>
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="9">
        <el-button type="success" plain :disabled="!condition.hospitalCode" icon="el-icon-download" @click="downloadNursesCode()" v-loading.fullscreen.lock="fullscreenLoading">下载护师二维码</el-button>
        <el-button type="danger" plain :disabled="!condition.departmentId && !condition.hospitalCode" @click="resetCondition()">重置</el-button>
      </el-col>
    </el-row>
    <el-table :data="nurseList" v-loading = "loading" style="width: 100%">
      <el-table-column align="left" type="index"></el-table-column>
      <el-table-column align="left" label="护师姓名" prop="nurseName"></el-table-column>
      <el-table-column align="left" label="护师头像" prop="nurseAvatar">
        <template slot-scope="scope">
          <img  :src="scope.row.nurseAvatar" alt="" style="width: 40px; display: block;">
        </template>
      </el-table-column>
      <el-table-column align="left" label="所属医院" prop="organizationText"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="left" label="职称描述" prop="positionalTitleText"></el-table-column>
      <!--<el-table-column align="left" label="标准职称" prop="standPositionalTitleText"></el-table-column>-->
      <el-table-column align="left" label="所属科室" prop="departmentText"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" align="left" label="简介" prop="text"></el-table-column>
      <el-table-column align="left" label="操作" width="380"  v-if="canIVisit('operate', 'NURSE_READ') || canIVisit('operate', 'NURSE_UPDATE') || canIVisit('operate', 'NURSE_DELETE')">
        <template slot-scope="scope">
          <!--<el-button size="mini"  type="warning" plain @click="downloadNurseCode(scope.row.code)">二维码下载</el-button>-->
          <el-button size="mini" v-if="canIVisit('operate', 'NURSE_READ')" type="success" plain @click="goToDetail('check', scope.row.nurseId)">查看</el-button>
          <el-button size="mini" v-if="canIVisit('operate', 'NURSE_UPDATE')" type="primary" plain @click="goToDetail('update', scope.row.nurseId)">修改</el-button>
          <el-button size="mini" v-if="canIVisit('operate', 'NURSE_DELETE')" type="danger" plain @click="deleteRow(scope.$index, scope.row)">删除</el-button>
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
        :current-page.sync = "currentPage"
        @current-change="changePage">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  import ax from '../api/axios.api'
  import conf from '../config.json'
  import rules from '../rules/index'
  export default {
    name: "nurse-manager",
    data () {
      return {
      accout:0,
        hasHospital: false,
        centerDialogVisible: false,
        currentPage:1,//默认开始页面
        total:0,//默认数据总数
        loading:false,
        searchCondition: {
          nurseName: '',
          hospitalCode: ''
        },
        condition: {
          hospitalCode: '',
          departmentId: '',
          secondDepartmentId: ''
        },
        downloadNurseFile:'',
        nurseList: [],
        addOne: false,
        delivery: {},
        hospitalOptions: [],
        departmentOptions: [],
        secondDepartmentOptions: [],
        fullscreenLoading: false
      }
    },
    /*页面加载调用该方法*/
    activated () {
      const organizationsCode = localStorage.getItem('organizationsCode');
      if (organizationsCode) {
        this.condition.hospitalCode = organizationsCode;
        this.searchCondition.hospitalCode = organizationsCode;
        this.hasHospital = true;
      }
      this.loading = true;
      const token = localStorage.getItem("token");
      this.header = {headers: {'Authorization': 'Bearer '+token}};
      this.getInfo(this.currentPage);//页面默认加载首页
      this.condition={}//切换菜单栏，重置搜索项
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
      getInfo(page) {
        /*加载订单数据*/
        let url = `${conf.url}/internethospital/api/nurses?page-index=${page}&page-size=10`;
        if (this.searchCondition.nurseName) {
          url = `${url}&name=${this.searchCondition.nurseName}`;
        }
        if (this.searchCondition.hospitalCode) {
          url = `${url}&organization-code=${this.searchCondition.hospitalCode}`;
        }
        /*向后台获取数据*/
        ax.get(url, this.header).then(res => {
          console.log(res);
          this.nurseList = res.data.content;
          this.total = res.data.totalElements;/*设置总条数*/
          this.loading = false;
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
      resetCondition () {
        this.condition = {
          hospitalCode: '',
          departmentId: '',
          secondDepartmentId: ''
        }

        this.searchCondition = {
          nurseName: '',
          hospitalCode: ''
        }
      },
      /*护师二维码批量下载*/
      remoteHospitalMethod (query) {
        if (query) {
          const url = `${conf.url}/internethospital/api/organizations?page-index=1&page-size=1000&text=${query}&type=HOSPITAL`;
          ax.get(url,this.header).then(res =>{
            this.hospitalOptions = res.data.content;
          }).catch(err=>{
            this.refreshTokened(err)
          })
        }
      },
      remoteDepartmentMethod (query){
        if (query) {
          let url = `${conf.url}/internethospital/api/departments?page-index=1&page-size=100&text=${query}&type=HOSPITAL_DEPARTMENT&show-all=true`;
          if (this.condition.hospitalCode) {
            url = `${url}&organization-code=${this.condition.hospitalCode}`;
          }
          ax.get(url,this.header).then(res =>{
            this.departmentOptions = res.data.content;
          }).catch(err=>{
            this.refreshTokened(err)
          })
        }
      },
      remoteSecondDepartmentMethod (query) {
        if (query) {
          if (this.condition.departmentId) {
            let url = `${conf.url}/internethospital/api/departments?page-index=1&page-size=100&text=${query}&parent-id=${this.condition.departmentId}`;
            ax.get(url, this.header).then(res => {
              this.secondDepartmentOptions = res.data.content;
            }).catch(err=>{
              this.refreshTokened(err)
            })
          } else {
            this.$message({
              type: 'warning',
              message: '请先选择一级科室'
            })
          }
        }
      },
      downloadNurseCode (code) {
        const url = `${conf.url}/internethospital/api/nurses/action/download-micro-app-qrcode?page-index=1&page-size=1&nurse-code=${code}`;
        let form = document.createElement('FORM');
        form.method = 'POST';
        form.action = url;
        document.body.appendChild(form);
        form.submit();
      },
      downloadNursesCode () {
        let url = `${conf.url}/internethospital/api/nurses/action/download-micro-app-qrcode?page-index=1&page-size=100&organization-code=${this.condition.hospitalCode}`;
        if (this.condition.secondDepartmentId) {
          let department = this.secondDepartmentOptions.find(d => d.id === this.condition.secondDepartmentId);
          if (department.standDepartment) {
            url = `${url}&standard-department-id=${this.condition.secondDepartmentId}`;
          } else {
            url = `${url}&department-id=${this.condition.secondDepartmentId}`;
          }
        }
        if (this.condition.departmentId){
          let department = this.departmentOptions.find(d => d.id === this.condition.departmentId);
          if (department.standDepartment) {
            url = `${url}&parent-standard-department-id=${this.condition.departmentId}`;
          } else {
            url = `${url}&parent-department-id=${this.condition.departmentId}`;
          }
        }
        let form = document.createElement('FORM');
        form.method = 'POST';
        form.action = url;
        document.body.appendChild(form);
        form.submit();
      },
      /*
      goToDetail：RU
      type：传入类型，id：获取到该条数据的id
      */
      goToDetail (type, id) {
        this.$router.push({
          path: '/nurse-manager/detail',
          query: {
            type: type,
            id: id
          }
        });
      },
      /*数据删除*/
      deleteRow (index,rows) {
        var token = localStorage.getItem("token");
        /*获取当前选中行的id*/
        var nurseId = this.nurseList[index].nurseId;
        this.$confirm(`此操作将删除该条数据，是否继续？`,`提示`,{
          confirmButtonText:`确定`,
          cancelButtonText:`取消`,
          type:`warning`
        }).then(()=>{
          /*到后台执行删除操作*/
          const url = `${conf.url}/internethospital/api/nurses/`+nurseId;
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
          this.$message.error('取消删除')
        })
      }
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
    margin-bottom: 10px;
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
