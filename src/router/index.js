import Vue from 'vue'
import Router from 'vue-router'

// 主页及登录
import HomeComponent from '@/components/home.component'
import LoginComponent from '@/components/login.component'

// 轮播图页面
import CarouselManagerComponent from '@/components/carousel-manager.component'
import CarouselDetailComponent from '@/components/carousel-detail.component'

// 优惠券管理
import CouponManagerComponent from '@/components/coupon-manager.component'
import CouponDetailComponent from '@/components/coupon-detail.component'

// 活动管理
import ActivityManagerComponent from '@/components/activity-manager.component'
import ActivityDetailComponent from '@/components/activity-detail.component'

// 医助管理
import ChannelManagerComponent from '@/components/channel-manager.component'
import ChannelDetailComponent from '@/components/channel-detail.component'
import ChannelSpecificComponent from '@/components/channel-specific.component'
import ChannelConsultationSpecificComponent from '@/components/channel-consultationSpecific.detail'

// 医院管理
import HospitalManagerComponent from '@/components/hospital-manager.component'
import HospitalDetailComponent from '@/components/hospital-detail.component'

// 科室管理
import DepartmentManagerComponent from '@/components/department-manager.component'
import DepartmentDetailComponent from '@/components/department-detail.component'

// 医院科室管理
import OrganizationDepartmentManagerComponent from '@/components/organization-department-manager.component'
import OrganizationDepartmentDetailComponent from '@/components/organization-department-detail.component'

//  医生管理
import DoctorManagerComponent from '@/components/doctor-manager.component'
import DoctorDetailComponent from '@/components/doctor-detail.component'

//  护士管理
import NurseManagerComponent from '@/components/nurse-manager.component'
import NurseDetailComponent from '@/components/nurse-detail.component'

// 订单管理
import OrderManagerComponent from  '@/components/order-manager.component'
import OrderDetailComponent from '@/components/order-detail.component'

/*订单类型管理*/
import OrderTypeManagerComponent from  '@/components/orderType-manager.component'
import OrderTypeDetailComponent from '@/components/orderType-detail.component'

/*订单行项目确认*/
import orderItemTypeIdentificationsManagerComponent from  '@/components/order-item-type-identifications-manager.component'
import orderItemTypeIdentificationsDetailComponent from  '@/components/order-item-type-identifications-detail.component'

/*订单行项目类别*/
import orderItemTypeManagerComponent from  '@/components/order-item-type-manager.component'
import orderItemTypeDetailComponent from  '@/components/order-item-type-detail.component'

/*状态参数文件配置管理*/
import statusProfilesManagerComponent from '@/components/status-profiles-manager.component'
import statusProfilesDetailComponent from '@/components/status-profiles-detail.component'
/*评价管理*/
import orderEvaluationManagerComponent from '@/components/order-evaluation-manager.component'
import orderEvaluationDetailComponent from '@/components/order-evaluation-detail.component'

/*处方订单管理*/
import presciptionOrderManagerComponent from '@/components/presciption-order-manager.component'
import presciptionOrderDetailComponent from '@/components/presciption-order-detail.component'

/*订单总览*/
import orderOverviewManagerComponent from '@/components/order-overview-manager.component'
import orderOverviewDetailComponent from '@/components/order-overview-detail.component'

/*原始订单详情*/
import orderSourceDetailComponent from '@/components/order-source-detail.component'

/*排班管理*/
import doctorTypeSettingManagerComponent from '@/components/doctor-type-setting-manager.component'
import doctorTypeSettingDetailComponent from '@/components/doctor-type-setting-detail.component'
import doctorTypeSettingSchedulingDetailComponent from '@/components/doctor-type-setting-scheduling-detail.component'
import doctorTypeSettingSchedulingCycleDetailComponent from '@/components/doctor-type-setting-scheduling-cycle-detail.component'

/*药品管理*/
import medicineProductManagerComponent from '@/components/medicine-product-manager.component'
import medicineProductDetailComponent from '@/components/medicine-product-detail.component'

/*退款订单*/
import refundOrderManagerComponent from '@/components/refund-order-manager.component'
import refundOrderDetailComponent from '@/components/refund-order-detail.component'

import laboratory from '@/components/laboratory'
/*订单统计*/
import orderCartogram from '@/components/order-cartogram.component'
// 财务管理
import financePayment from '@/components/finance-payment.component'
import financeVoidRefund from '@/components/finance-void-refund.component'
import financeServeRefund from '@/components/finance-serve-refund.component'
import financeVoidRefundDetails from '@/components/finance-void-refund-details.component'
import financeServeRefundInformation from '@/components/finance-serve-refund-information.component'
import financeOrderRefund from '@/components/finance-order-refund.component'
import financeOrderRefundInformation from '@/components/finance-order-refund-information.component'
//医生结账
import financesettleAccountDoctor from '@/components/finance-settleAccount-doctor.component'
import financeISettleAccountDoctorDetails from '@/components/finance-settleAccount-doctor-details.component'
//药品结账
import financeDrugSettleAccountDrug from '@/components/finance-settleAccount-drug.component'
import financeDrugSettleAccountDrugDetails from '@/components/finance-settleAccount-drug-details.component'
//医院结账
import financeDrugSettleAccountHospital from '@/components/finance-settleAccount-hospital.component'
import financeDrugSettleAccountHospitalDetails from '@/components/finance-settleAccount-hospital-details.component'

Vue.use(Router)

const routes = [
  // 财务管理
  {path:'/finance-payment',component:financePayment},
  {path:'/finance-void-refund',component:financeVoidRefund},
  {path:'/finance-serve-refund',component:financeServeRefund},
 {path:'/finance-void-refund-details',component:financeVoidRefundDetails},
  {path:'/finance-serve-refund-information',component:financeServeRefundInformation},
  {path:'/finance-order-refund',component:financeOrderRefund},
  {path:'/finance-order-refund-information',component:financeOrderRefundInformation},
  //结账管理
    {path:'/finance-settleAccount-hospital',component:financeDrugSettleAccountHospital},
    {path:'/finance-settleAccount-hospital-details',component:financeDrugSettleAccountHospitalDetails},
  {path:'/finance-settleAccount-doctor',component:financesettleAccountDoctor},
    {path:'/finance-settleAccount-doctor-details',component:financeISettleAccountDoctorDetails},
  {path:'/finance-settleAccount-drug',component:financeDrugSettleAccountDrug},
  {path:'/finance-settleAccount-drug-details',component:financeDrugSettleAccountDrugDetails},


 

  {path: '/', redirect: '/login'},
  {path: '/login', component: LoginComponent},
  {path: '/home', component: HomeComponent},

  /*订单总览*/
  {path:'/order-overview-manager',component:orderOverviewManagerComponent},
  {path:'/order-overview-manager/detail',component:orderOverviewDetailComponent},

  /*原始订单详情*/
  {path:'/order-source-manager/detail',component:orderSourceDetailComponent},


  /*处方订单管理*/
  {path:'/presciption-order-manager',component:presciptionOrderManagerComponent},
  {path:'/presciption-order-manager/detail',component:presciptionOrderDetailComponent},

  /*订单管理*/
  {path: '/order-manager', component: OrderManagerComponent},
  {path: '/order-manager/detail', component: OrderDetailComponent},

  {path: '/carousel-manager', component: CarouselManagerComponent},
  {path: '/carousel-manager/detail', component: CarouselDetailComponent},

  /*活动管理*/
  {path:'/activity-manager',component:ActivityManagerComponent},
  {path:'/activity-manager/detail',component:ActivityDetailComponent},

  /*优惠券管理*/
  {path:'/coupon-manager',component:CouponManagerComponent},
  {path:'/coupon-manager/detail',component:CouponDetailComponent},

  /*医助管理*/
  {path:'/channel-manager',component:ChannelManagerComponent},
  {path:'/channel-manager/detail',component:ChannelDetailComponent},
  {path:'/channel-manager/specific',component:ChannelSpecificComponent},
  {path:'/channel-manager/consultationSpecific',component:ChannelConsultationSpecificComponent},

  /* 医院管理 */
  {path:'/hospital-manager',component:HospitalManagerComponent},
  {path:'/hospital-manager/detail',component:HospitalDetailComponent},

  /* 科室管理 */
  {path:'/department-manager',component:DepartmentManagerComponent},
  {path:'/department-manager/detail',component:DepartmentDetailComponent},

  /* 医院科室管理 */
  {path:'/organization-department-manager',component:OrganizationDepartmentManagerComponent},
  {path:'/organization-department-manager/detail',component:OrganizationDepartmentDetailComponent},

  /* 医生管理 */
  {path:'/doctor-manager',component:DoctorManagerComponent},
  {path:'/doctor-manager/detail',component:DoctorDetailComponent},

  /* 护士管理 */
  {path:'/nurse-manager',component:NurseManagerComponent},
  {path:'/nurse-manager/detail',component:NurseDetailComponent},

  /*订单类型管理*/
  {path: '/order-type-manager', component: OrderTypeManagerComponent},
  {path: '/order-type-manager/detail', component: OrderTypeDetailComponent},

  /*订单行项目确认*/
  {path: '/order-item-type-identifications-manager',component:orderItemTypeIdentificationsManagerComponent},
  {path: '/order-item-type-identifications-manager/detail',component:orderItemTypeIdentificationsDetailComponent},

  /*订单行项目类别*/
  {path: '/order-item-type-manager',component:orderItemTypeManagerComponent},
  {path: '/order-item-type-manager/detail',component:orderItemTypeDetailComponent},

  /*状态参数配置文件管理*/
  {path:'/status-profiles-manager',component:statusProfilesManagerComponent},
  {path:'/status-profiles-manager/detail',component:statusProfilesDetailComponent},

  /*排班管理*/
  {path:'/doctor-type-setting-manager',component:doctorTypeSettingManagerComponent},
  {path:'/doctor-type-setting-manager/detail',component:doctorTypeSettingDetailComponent},
  {path:'/doctor-type-setting-scheduling-manager/detail',component:doctorTypeSettingSchedulingDetailComponent},
  {path:'/doctor-type-setting-scheduling-cycle-manager/detail',component:doctorTypeSettingSchedulingCycleDetailComponent},

  /*评价管理*/
  {path:'/order-evaluation-manager',component:orderEvaluationManagerComponent},
  {path:'/order-evaluation-manager/detail',component:orderEvaluationDetailComponent},

  /*药品管理*/
  {path:'/medicine-product-manager',component:medicineProductManagerComponent},
  {path:'/medicine-product-manager/detail',component:medicineProductDetailComponent},

  /*退款订单*/
  {path:'/refund-order-manager',component:refundOrderManagerComponent},
  {path:'/refund-order-manager/detail',component:refundOrderDetailComponent},

  /* 实验室 */
  {path:'/lab',component:laboratory},

  /*订单统计*/
  {path:'/order-cartogram',component:orderCartogram}

]


const router = new Router({
  routes
});

router.beforeEach((to, from, next) => {  // 路由守卫
  const toPath = to.path;
  const fromPath = from.path;
  let token;
  if (toPath !== '/login') {
    token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  } else {
    localStorage.clear();
  }
  next();
});

export default router
