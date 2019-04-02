<template>
    <div @keyup.enter="login('user')">
      <div class="container">
        <div class="message_img">
          <img src="static/img/messege1.png" alt="">
        <el-form ref="user" :rules="rules" :model="user">
          <h4>欢迎登陆</h4>
          <el-form-item prop="account">
            <el-input size="large" prefix-icon="el-icon-p" class="el-icon-person" v-model="user.account" placeholder="请输入账号"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input size="large" prefix-icon="el-icon-d" class="el-icon-lock" type="password" v-model="user.password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-button type="primary" size="small" @click="login('user')">登  陆</el-button>
        </el-form>
        </div>
      </div>
      <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="20%">
        <span>{{ dialog }}</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
  import ax from '../api/axios.api'
  import conf from '../config.json'
    export default {
      name: "login",
      data () {
        return {
          dialogVisible: false,
          dialog: '',
          popover: '',
          user: {
            account: '',
            password: ''
          },
          rules: {
            account: [
              { required: true, message: '请输入用户名', trigger: 'blur' }
            ],
            password: [
              { required: true, message: '请输入密码', trigger: 'blur' }
            ]
          }
        }
      },

      methods: {
        login (formName) {
          const url = `${conf.url}/users/channels/internet-hospital/token`;
          this.$refs[formName].validate((valid) => {
            if (!valid) {
              return false;
            } else {
              const data = {
                "username": this.user.account,
                "password": this.user.password
              };
              ax.post(url, data).then(res => {
                console.log(res)
                let canVisit = false;
                let organizationsCode = []
                for (let i in res.data.groups) {
                  organizationsCode.push(res.data.groups[i].slice(res.data.groups[i].indexOf('hospital/') + 9, res.data.groups[i].lastIndexOf('/')));
                  if (res.data.groups[i].indexOf('hospital') >= 0 && res.data.groups[i].indexOf('admin') >= 0) {
                    canVisit = true;
                  }
                }
                console.log(res.data.roles)
                if (res.data.roles.indexOf('admin') >= 0) {
                  canVisit = true;
                }
                if (!canVisit) {
                  this.dialogVisible = true;
                  this.dialog = '非管理员无法操作';
                  return;
                }
                const user = res.data;
                localStorage.setItem('userInfo', JSON.stringify(user));
                /*设置token到localStorage，通过getItem获取*/
                localStorage.setItem('token', user.access_token);
                localStorage.setItem('username', user.username);
                if(res.data.roles.indexOf('admin') < 0) {
                  localStorage.setItem('organizationsCode', organizationsCode);
                }
                this.$router.push("/home");
              }).catch(err => {
                this.user = {
                  account: '',
                  password: ''
                };
                this.dialogVisible = true;
                this.dialog = err.response.data.message;
              });
            }
          });
        }
      }
    }
</script>

<style scoped>
.container{
  width: 1200px;
  height: 80vh;
  margin: 0 auto;
  position: relative;
}
.message_img{
  position: absolute;
  display: flex;
  justify-content: center;
  width: 720px;
  height: 400px;
    top: 50%;
  left: 50%;
  margin-top: -200px;
  margin-left: -360px;
  box-shadow:0px 30px 40px 0px rgba(6,82,122,0.2);
  background-color: #F2F6FC;
}
.message_img img{
  width: 360px;
  height: 400px;
}

.el-form{
  width: 360px;
  height: 400px;
  overflow: hidden;
  
}
.el-form>h4{
  height: 60px;
  line-height: 90px;
  font-size: 20px;
  text-align: center;
}
.el-form-item{
  padding: 0 20px;
  margin-top: 50px;
}
.el-form .el-button{
  width: 240px;
  height: 40px;
  margin-top: 30px;
  font-size: 18px;
}

</style>
