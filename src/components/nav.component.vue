<template>
  <el-aside width="200px">
    <h4 class="title">管理系统</h4>
    <el-menu :default-active="position">
      <!--<el-menu-item index="1" @click="goTo('/home')">-->
      <!--<i class="el-icon-menu"></i>-->
      <!--<span slot="title">控制台</span>-->
      <!--</el-menu-item>-->
      <!--<el-submenu index="2" v-if="rules.indexOf('2') > 0">-->
      <el-submenu index="2" v-if="canIVisit('navigate', 'DATA_STATISTICS')">
        <template slot="title">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">数据统计</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="2-2" @click="goTo('/order-cartogram')">数据统计</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="3" v-if="canIVisit('navigate', 'ORDER')">
        <template slot="title">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">订单管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="3-1" v-if="canIVisit('navigate', 'OVERVIEW')" @click="goTo('/order-overview-manager')">订单总览</el-menu-item>
          <el-menu-item index="3-2" v-if="canIVisit('navigate', 'INTERROGATION')" @click="goTo('/order-manager')">问诊订单</el-menu-item>
          <el-menu-item index="3-3" v-if="canIVisit('navigate', 'PRESCRIPTION')" @click="goTo('/presciption-order-manager')">处方订单</el-menu-item>
          <el-menu-item index="3-4" v-if="canIVisit('navigate', 'REFUND')" @click="goTo('/refund-order-manager')">退款订单</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="4" v-if="canIVisit('navigate', 'MASTER_DATA')">
        <template slot="title">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">主数据管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="4-1" v-if="canIVisit('navigate', 'HOSPITAL')" @click="goTo('/hospital-manager')">医院管理</el-menu-item>
          <el-menu-item index="4-2" v-if="canIVisit('navigate', 'DEPARTMENT')" @click="goTo('/department-manager')">科室管理</el-menu-item>
          <el-menu-item index="4-3" v-if="canIVisit('navigate', 'ORGANIZATION_DEPARTMENT')" @click="goTo('/organization-department-manager')">医院科室管理</el-menu-item>
          <el-menu-item index="4-4" v-if="canIVisit('navigate', 'DOCTOR')" @click="goTo('/doctor-manager')">医生管理</el-menu-item>
          <el-menu-item index="4-5" v-if="canIVisit('navigate', 'NURSE')" @click="goTo('/nurse-manager')">护师管理</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="5" v-if="canIVisit('navigate', 'ACTIVITY')">
        <template slot="title">
          <i class="el-icon-goods"></i>
          <span slot="title">活动管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="5-1" v-if="canIVisit('navigate', 'ACTIVITY_ACTIVITY')" @click="goTo('/activity-manager')">活动管理</el-menu-item>
          <el-menu-item index="5-2" v-if="canIVisit('navigate', 'COUPON')" @click="goTo('/coupon-manager')">优惠券管理</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-menu-item index="6" v-if="canIVisit('navigate', 'CAROUSEL')" @click="goTo('/carousel-manager')">
        <i class="el-icon-picture-outline"></i>
        <span slot="title">轮播图管理</span>
      </el-menu-item>
      <el-submenu index="7" v-if="canIVisit('navigate', 'OPERATE')">
        <template slot="title">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">运营管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="7-1" v-if="canIVisit('navigate', 'MEDICAL_ASSISTANT')" @click="goTo('/channel-manager')">医助人员管理</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-menu-item index="8" v-if="canIVisit('navigate', 'EVALUATE')" @click="goTo('/order-evaluation-manager')">
        <i class="el-icon-menu"></i>
        <span slot="title">评价管理</span>
      </el-menu-item>
      <el-submenu index="9" v-if="canIVisit('navigate', 'SCHEDULE')">
        <template slot="title">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">排班管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="9-1" @click="goTo('/doctor-type-setting-manager')">排班管理</el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-menu-item index="10" v-if="canIVisit('navigate', 'MEDICAL')" @click="goTo('/medicine-product-manager')">
        <i class="el-icon-menu"></i>
        <span slot="title">药品管理</span>
      </el-menu-item>
      <el-submenu index="11" v-if="canIVisit('navigate', 'FINANCE')">
        <template slot="title">
          <i class="el-icon-goods"></i>
          <span slot="title">财务管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="11-1" @click="goTo('/finance-payment')">支付对账</el-menu-item>
          <el-submenu index="11-2">
            <template slot="title">退款管理</template>
           <!--  <el-menu-item index="11-2-1" data-code="canIVisit('navigate', 'FINANCE_VOID')" @click="goTo('/finance-void-refund')">无效退款</el-menu-item>
            <el-menu-item index="11-2-2" data-code="canIVisit('navigate', 'FINANCE_SERVE')" @click="goTo('/finance-serve-refund')">服务退款</el-menu-item> -->
            <el-menu-item index="11-2-3" @click="goTo('/finance-order-refund')">订单退款</el-menu-item>
          </el-submenu>
          <el-submenu index="11-3">
            <template slot="title">结账管理</template>
            <el-menu-item index="11-3-1" @click="goTo('/finance-settleAccount-hospital')">医院结账</el-menu-item>
            <el-menu-item index="11-3-2" @click="goTo('/finance-settleAccount-doctor')">医生结账</el-menu-item>
            <el-menu-item index="11-3-3" @click="goTo('/finance-settleAccount-drug')">药品结账</el-menu-item>
          </el-submenu>
        </el-menu-item-group>
      </el-submenu>
<el-submenu index="12" v-if="canIVisit('navigate', 'FINANCE')">
        <template slot="title">
          <i class="el-icon-goods"></i>
          <span slot="title">财务交易管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="12-1" @click="goTo('/finance-payment')">财务账号</el-menu-item>
          <el-menu-item index="12-1" @click="goTo('/finance-payment')">财务账号分组</el-menu-item>
          <el-menu-item index="12-1" @click="goTo('/finance-payment')">财务交易类型</el-menu-item>
          <el-menu-item index="12-1" @click="goTo('/finance-payment')">财务交易</el-menu-item>
          <el-menu-item index="12-1" @click="goTo('/finance-payment')">财务分配规则</el-menu-item>
         
         
        </el-menu-item-group>
      </el-submenu>      
  <!-- <el-submenu index="11" v-if="canIVisit('navigate', 'METADATA')">
        <template slot="title">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">数据管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="11-1" @click="goTo('/order-type-manager')">订单类型管理</el-menu-item>
          <el-menu-item index="11-2" @click="goTo('/order-item-type-identifications-manager')">订单行项目确认</el-menu-item>
          <el-menu-item index="11-3" @click="goTo('/order-item-type-manager')">订单行项目类别</el-menu-item>
          <el-menu-item index="11-4" @click="goTo('/status-profiles-manager')">状态参数配置</el-menu-item>
        </el-menu-item-group>
      </el-submenu>  -->     
      <!--<el-submenu index="10">-->
      <!--<template slot="title">-->
      <!--<i class="el-icon-goods"></i>-->
      <!--<span slot="title">药品管理</span>-->
      <!--</template>-->
      <!--<el-menu-item-group>-->
      <!--<el-menu-item index="5-2" @click="goTo('/medicine-product-manager')">药品管理</el-menu-item>-->
      <!--</el-menu-item-group>-->
      <!-- </el-submenu> -->
    </el-menu>
  </el-aside>
</template>
<script>
import ax from '../api/axios.api'
import conf from '../config.json'
import rules from '../rules/index'
export default {
  name: "nav-component",
  data() {
    return {
      position: '1',
      header: null,
      goodsClassify: []
    }
  },
  activated(){
 const path = location.hash.slice(location.hash.indexOf('#') + 2);
    let orderOverview = /order-overview-manager/g;
    let order = /order-manager/g;
    let presciptionOrder = /presciption-order-manager/g;
    let hospital = /hospital-manager/g;
    let department = /department-manager/g;
    let organizationDepartment = /organization-department-manager/g;
    let doctor = /doctor-manager/g;
    let nurse = /nurse-manager/g;
    let activity = /activity-manager/g;
    let coupon = /coupon-manager/g;
    let carousel = /carousel-manager/g;
    let channel = /channel-manager/g;
    let evaluation = /order-evaluation-manager/g;
    let doctorTypeSetting = /doctor-type-setting/g;

    this.position = path === 'home' ? '1' :
      path === 'user-manager' ? '2-1' :
      orderOverview.exec(path) ? '3-1' :
      presciptionOrder.exec(path) ? '3-3' :
      order.exec(path) ? '3-2' :
      hospital.exec(path) ? '4-1' :
      organizationDepartment.exec(path) ? '4-3' :
      department.exec(path) ? '4-2' :
      doctor.exec(path) ? '4-4' :
      nurse.exec(path) ? '4-5' :
      activity.exec(path) ? '5-1' :
      coupon.exec(path) ? '5-2' :
      carousel.exec(path) ? '6' :
      channel.exec(path) ? '7-1' :
      evaluation.exec(path) ? '8' :
      doctorTypeSetting.exec(path) ? '9-1' :'';
    const token = sessionStorage.getItem('token');
    this.header = { headers: { 'X-USER-TOKEN': token } };
    // this.confirmRules()    
  },
  methods: {
    goTo(str) {
      this.$router.push(str);
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
    }
    // rules(rule){
    //   /** Explain
    //    *  1 ———— 控制台
    //    *  2 ———— 数据统计
    //    *  3 ———— 订单管理
    //    *  3-1 ———— 订单总览
    //    *  3-2 ———— 问诊订单
    //    *  3-3 ———— 处方订单
    //    *  3-4 ———— 退款订单
    //    *  4 ———— 主数据管理
    //    *  4-1 ———— 医院管理
    //    *  4-2 ———— 科室管理
    //    *  4-3 ———— 医院科室管理
    //    *  4-4 ———— 医生管理
    //    *  4-5 ———— 护师管理
    //    *  5 ———— 活动管理
    //    *  5-1 ———— 活动管理
    //    *  5-2 ———— 优惠券管理
    //    *  6 ———— 轮播图管理
    //    *  7 ———— 运营管理
    //    *  7-1 ———— 医助人员管理
    //    *  8 ———— 评价管理
    //    *  9 ———— 排班管理
    //    *  10 ———— 药品管理
    //    *  11 ———— 数据管理
    //    *  11-1 ———— 订单类型管理
    //    *  11-2 ———— 订单行项目确认
    //    *  11-3 ———— 订单行项目类别
    //    *  11-4 ———— 状态参数配置
    //    */
    //   switch (rule) {
    //     case 'hospital_admin':
    //       return ['1', '3', '3-1', '3-2', '3-3', '3-4', '4', '4-1', '4-4', '4-5', '6', '8', '9', '10'];
    //     case 'pharmacist':
    //       return ['3', '3-3'];
    //     case 'operator':
    //       return ['3', '3-1', '3-2', '3-3', '3-4', '4', '4-3', '4-4', '4-5', '5', '5-1', '5-2', '6', '7', '7-1', '8'];
    //     default:
    //       throw new Error('菜单权限参数错误：' + rule  + '不是可选的权限参数')
    //   }
    // },
    // confirmRules(){
    //   let roles = JSON.parse(localStorage.getItem('userInfo')).roles;
    //   console.log(roles)
    // }
  }
}

</script>
<style scoped>
.el-menu {
  border: none;
  text-align: left;
}

.el-aside {
  height: 100vh;
  border-right: solid 1px #e6e6e6;
  overflow-x: hidden;
  overflow-y: scroll;
}

.el-aside>.title {
  height: 60px;
  line-height: 60px;
  color: #409EFF;
}

</style>
