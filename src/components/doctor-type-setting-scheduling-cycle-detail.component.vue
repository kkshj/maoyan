<template>
  <div>
    <el-row class="header">
      <el-col :span="12"><h4>循环排班信息排班{{type === 'add' ? '录入' : type === 'update' ? '编辑' : ''}}</h4></el-col>
      <el-col :span="12">
        <el-button v-if="type === 'update'" type="primary" plain icon="el-icon-edit" @click="update">保存</el-button>
        <el-button  type="danger" plain icon="el-icon-back" @click="cancel">返回</el-button>
      </el-col>
    </el-row>

    <el-form ref="doctorInformation" :model="doctorInformation" label-width="160px" :rules="rules" style="width: 70%; margin: 20px auto;">
      <h4 align="left">医生信息</h4>
      <br>
      <el-form-item  label="医生姓名" prop="doctorName">
        <span>{{doctorInformation.doctorName}}</span>
      </el-form-item>
      <el-form-item  label="所属医院" prop="organizationText">
        <span v-if="type==='add'||type==='check'">{{doctorInformation.organizationText}}</span>
        <span v-if="type==='update'">{{doctorInformation.organizationName}}</span>
      </el-form-item>
      <el-form-item  label="所属科室" prop="departmentText">
        <span v-if="type==='add'||type==='check'">{{doctorInformation.departmentText}}</span>
        <span v-if="type==='update'">{{doctorInformation.departmentName}}</span>
      </el-form-item>
      <el-form-item  label="排班开关" prop="scheduling">
        <span  v-if="type==='check'||type==='update'">{{doctorInformation.scheduling===true ? '已开启' : '已关闭'}}</span>
        <el-select v-else v-model="scheduling" placeholder="请选择排班状态">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <br>
      <h4 align="left">排班信息</h4>
      <br>
      <el-form-item  label="接诊日期" prop="startAndEndTime">
        <span v-if="type==='check'">{{doctorInformation.startTime}} 至 {{doctorInformation.endTime}}</span>
        <div v-else class="block">
          <el-date-picker
            v-model="doctorInformation.startAndEndTime"
            type="datetimerange"
            align="right"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </div>
      </el-form-item>
      <el-form-item  label="排班来源" prop="source">
        <span v-if="type==='check'||type==='update'">{{doctorInformation.source==='HOSPITAL'? '医院创建' : '医生创建'}}</span>
        <el-select v-else v-model="source" placeholder="请选择排班来源">
          <el-option
            v-for="item in sourceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item  label="循环排班" prop="cycle">
        <span v-if="type==='check'||type==='update'">{{doctorInformation.cycle===false? '否' : '是'}}</span>
        <el-select v-else v-model="cycle" placeholder="请选择循环排班状态">
          <el-option
            v-for="item in cycleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  Date.prototype.format = function (fmt) { // 定义Date类型的format函数 【必须使用 ‘= function () {}’ 的形式】
    const o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }
  import ax from '../api/axios.api'
  import conf from '../config.json'
  export default {
    name: "scheduling-doctorType-detail",
    data () {
      return {
      accout:0,
        type: '',
        header: '',
        doctorInformation: {},
        /*排班详情集合*/
        schedulingList:[],
        rules: {
        },
        detailRule:{
        },
        scheduling:'true',
        source:'HOSPITAL',
        cycle:'false',
        statusOptions: [
          {value: 'true', label: '开启'},
          {value: 'false', label: '关闭'}
        ],
        cycleOptions: [
          {value: 'true', label: '开启'},
          {value: 'false', label: '关闭'}
        ],
        sourceOptions: [
          {value: 'HOSPITAL', label: '医院创建'}
        ],
      }
    },
    activated () {
      const token = localStorage.getItem("token");
      this.header = {headers: {'Authorization': 'Bearer '+token}};
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
        }).catch(err => {
          console.log('网络不加')
        })
      }
    },       
      getInfo (id) {
          const url = `${conf.url}/internethospital/api/scheduling/cycle/${id}`;
          ax.get(url,this.header).then(res => {
            res.data.startAndEndTime = [new Date(res.data.startTime), new Date(res.data.endTime)];
            this.doctorInformation = res.data;
          }).catch(err => {
            this.refreshTokened(err)
            console.log(err);
            this.$message({
              type: 'warning',
              message: err.response.data.message
            });
          })
      },
      update(){
        const url = `${conf.url}/internethospital/api/scheduling/cycle/${this.$route.query.id}`;
        let data = {
          "endTime": this.doctorInformation.startAndEndTime[1].format("yyyy-MM-dd hh:mm:ss"),
          "schedulingStatus": true,
          "startTime": this.doctorInformation.startAndEndTime[0].format("yyyy-MM-dd hh:mm:ss")
        }
        /*请求后台修改*/
        ax.put(url,data,this.header
        ).then(res=>{
          this.$message({
            type:'success',
            message:'保存成功'
          })
          /*修改完成后，设置页面类型为check*/
          this.cancel()
        }).catch(err =>{
            this.refreshTokened(err)
          console.log(err);
          this.$message({
            type: 'warning',
            message: err.response.data.message
          });
        })
      },
      cancel () {
        this.$router.back(-1);
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

</style>
