/** 权限勾选 */
<template>
  <div class="permission-container">
    <el-tree
      ref="treeRef"
      :data="processedMenuData"
      show-checkbox
      node-key="id"
      :props="{
        children: 'submenus',
        label: 'name',
        class: customNodeClass
      }"
      default-expand-all
      :default-checked-keys="props.initialPermissions"
      @on-current-change="handleCurrentChange"
      @check="handleCheck"
      @check-change="handleCheckChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElTree } from 'element-plus';

// 定义props
const props = defineProps({
  initialPermissions: {
    type: Array,
    default: () => []
  }
});

const treeRef = ref();
const menuData = [
    {
        "id": "1814231274299858946",
        "name": "营销管理",
        "parentId": "0",
        "icon": "icon-a-Frame48785",
        "sort": "5",
        "type": "2",
        "submenus": [
            {
                "id": "1809053516761776130",
                "name": "自助开通订购",
                "parentId": "1814231274299858946",
                "sort": "4",
                "type": "2",
                "routePath": "/eMarketing/selfServiceSubscription",
                "permissions": [
                        {
                            "id": "1825732902106435586",
                            "name": "新建概览1",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435581",
                            "name": "新建概览2",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435582",
                            "name": "新建概览3",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435583",
                            "name": "新建概览4",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435584",
                            "name": "新建概览5",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435585",
                            "name": "新建概览6",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "18257329021064355866",
                            "name": "新建概览7",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435587",
                            "name": "新建概览8",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435588",
                            "name": "新建概览9",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "1825732902106435589",
                            "name": "新建概览10",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "18257329021064355810",
                            "name": "新建概览11",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                        {
                            "id": "18257329021064355811",
                            "name": "新建概览12",
                            "menuId": "1809053516761776130",
                            "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                        },
                ],
            },
            {
                "id": "1728332781559255041",
                "name": "营销工具",
                "parentId": "1814231274299858946",
                "icon": "icon-yingxiaoguanli-sel",
                "sort": "5",
                "type": "2",
                "submenus": [
                    {
                        "id": "1894596142583283713",
                        "name": "默认支付方式",
                        "parentId": "1728332781559255041",
                        "sort": "1",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/defaultPaymentMethod",
                        "permissions": [
                          {
                              "id": "1825732902106435586vv",
                              "name": "权限1",
                              "menuId": "1894596142583283713",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                          {
                              "id": "1825732902106435581vv",
                              "name": "权限2",
                              "menuId": "1894596142583283713",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                          {
                              "id": "1825732902106435582vv",
                              "name": "权限3",
                              "menuId": "1894596142583283713",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                        ]
                    },
                    {
                        "id": "1728332884353257473",
                        "name": "优惠券管理",
                        "parentId": "1728332781559255041",
                        "sort": "1",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/couponManagement",
                    },
                    {
                        "id": "1849017005819916289",
                        "name": "套餐限购",
                        "parentId": "1728332781559255041",
                        "sort": "1",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/OrderTimes",
                        "permissions": [
                          {
                              "id": "1825732902106435586xx",
                              "name": "xx权限1",
                              "menuId": "1849017005819916289",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                          {
                              "id": "1825732902106435581xx",
                              "name": "xx权限2",
                              "menuId": "1849017005819916289",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                          {
                              "id": "1825732902106435582xx",
                              "name": "xx权限3",
                              "menuId": "1849017005819916289",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                        ]
                    },
                    {
                        "id": "1728332933342728193",
                        "name": "余额预存",
                        "parentId": "1728332781559255041",
                        "sort": "2",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/balanceRechargeConfiguration",
                        "permissions": [
                          {
                              "id": "123",
                              "name": "xx权限1",
                              "menuId": "1728332933342728193",
                              "btnPerm": "nb:customer:api:dataAnalysis:AddOverview"
                          },
                        ]
                    },
                    {
                        "id": "1749247101897162753",
                        "name": "优惠券活动管理",
                        "parentId": "1728332781559255041",
                        "icon": "icon-yingxiaoguanli-sel",
                        "sort": "3",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/couponActivity"
                    },
                    {
                        "id": "1809067491528392706",
                        "name": "会员管理",
                        "parentId": "1728332781559255041",
                        "sort": "5",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/memberManage"
                    },
                    {
                        "id": "1848564135055327234",
                        "name": "用户挽留弹窗",
                        "parentId": "1728332781559255041",
                        "sort": "6",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/userRelatePopupWindow"
                    },
                    {
                        "id": "1889879760272678914",
                        "name": "切卡配置",
                        "parentId": "1728332781559255041",
                        "sort": "8",
                        "type": "2",
                        "routePath": "/eMarketing/marketingTool/cutCardConfig"
                    },
                    {
                        "id": "1844669705357365249",
                        "name": "H5模版中心",
                        "parentId": "1728332781559255041",
                        "sort": "998",
                        "type": "2",
                        "routePath": "/eMarketing/templateRechargePage"
                    }
                ],
                "routePath": "/eMarketing/marketingTool"
            },
            {
                "id": "1744174247363805186",
                "name": "规则管理",
                "parentId": "1814231274299858946",
                "icon": "icon-hetongzhongxin",
                "sort": "5",
                "type": "2",
                "submenus": [
                    {
                        "id": "1744174457339052034",
                        "name": "规则管理",
                        "parentId": "1744174247363805186",
                        "sort": "1",
                        "type": "2",
                        "routePath": "/eMarketing/ruleManage/ruleManagement"
                    },
                    {
                        "id": "1744174676982169602",
                        "name": "规则触发记录",
                        "parentId": "1744174247363805186",
                        "sort": "2",
                        "type": "2",
                        "routePath": "/eMarketing/ruleManage/ruleTriggerRecord"
                    }
                ],
                "routePath": "/eMarketing/ruleManage"
            },
            {
                "id": "1813410211025731585",
                "name": "首订多档预存",
                "parentId": "1814231274299858946",
                "sort": "6",
                "type": "2",
                "routePath": "/eMarketing/firstOrderMultiPreStorage"
            },
            {
                "id": "1816666206476726273",
                "name": "推荐套餐",
                "parentId": "1814231274299858946",
                "sort": "7",
                "type": "2",
                "routePath": "/eMarketing/recommendedPackages"
            }
        ],
        "routePath": "/eMarketing"
    },
    {
        "id": "1728333093221208066",
        "name": "账号管理",
        "parentId": "0",
        "icon": "icon-zhanghaoguanli-nor",
        "sort": "6",
        "type": "2",
        "submenus": [
            {
                "id": "1744173910217261058",
                "name": "联系人管理",
                "parentId": "1728333093221208066",
                "sort": "1",
                "type": "2",
                "routePath": "/eAccountManage/contacts"
            },
            {
                "id": "1728333230211371009",
                "name": "账号设置",
                "parentId": "1728333093221208066",
                "sort": "1",
                "type": "2",
                "routePath": "/eAccountManage/accountSettings"
            },
            {
                "id": "1744173983537889281",
                "name": "API密钥管理",
                "parentId": "1728333093221208066",
                "sort": "2",
                "type": "2",
                "routePath": "/eAccountManage/apiSecretKeyManage"
            },
            {
                "id": "1728333333705822209",
                "name": "账号权限",
                "parentId": "1728333093221208066",
                "sort": "2",
                "type": "2",
                "routePath": "/eAccountManage/authConfiguration"
            },
            {
                "id": "1728333457387458562",
                "name": "收款账户管理",
                "parentId": "1728333093221208066",
                "sort": "4",
                "type": "2",
                "routePath": "/eAccountManage/receivingAccount"
            }
        ],
        "routePath": "/eAccountManage"
    },
]
const customNodeClass = ({ permissions }, node) => {
  return permissions ? 'is-penultimate' : ''
}

const formatPermissionToMenu = (permissionsList) => {
  return permissionsList.map(node => ({
    id: 'permission_' + node?.id,
    name: node?.name,
    parentId: node.menuId,
    btnPerm: node?.btnPerm,
    type: 'buttonPermission'
  }))
  
}

// 处理菜单数据，添加按钮权限节点
const processedMenuData = computed(() => {
  const processNode = (node) => {
    const processedNode = { ...node };
    
    // 如果有子菜单，递归处理
    if (node.submenus && node.submenus.length > 0) {
      processedNode.submenus = node.submenus.map(processNode);
    }
    
    // 添加按钮权限节点 - 没有 submenus 的 菜单 才有权限
    if (node.routePath && !node.submenus) {
      processedNode.submenus = [
        ...(processedNode.submenus || []),
        ...formatPermissionToMenu(processedNode.permissions || []) // 权限放到 菜单的 子项重
      ];
    }
    
    return processedNode;
  };
  
  return menuData.map(processNode);
});

// 处理节点选中状态变化
const handleCheck = (data, checked) => {
  const { checkedKeys, halfCheckedKeys } = checked;
  console.log('选中的节点:', checkedKeys);
  console.log('半选中的节点:', halfCheckedKeys);
};

// 处理节点选中状态变化（单个节点）
const handleCheckChange = (data, checked, indeterminate) => {
  // console.log('节点:', data.id, '选中状态:', checked, '半选状态:', indeterminate);
};

const handleCurrentChange = (val, ...rest) => {
  console.log({val, rest})
}

// 获取当前选中的所有权限
const getSelectedPermissions = () => {
  const checkedNodes = treeRef.value.getCheckedNodes();
  const halfCheckedNodes = treeRef.value.getHalfCheckedNodes();
  
  return {
    checkedPermissions: checkedNodes.map(node => ({
      id: node.id,
      type: node.type,
      parentId: node.parentId
    })),
    halfCheckedPermissions: halfCheckedNodes.map(node => ({
      id: node.id,
      type: node.type,
      parentId: node.parentId
    }))
  };
};

// 设置选中的权限
const setCheckedPermissions = (permissions) => {
  if (treeRef.value) {
    // 清空当前所有选中状态
    treeRef.value.setCheckedKeys([]);
    
    // 遍历权限数组，逐个设置节点状态
    permissions.forEach(permissionId => {
      treeRef.value.setChecked(permissionId, true, false); // 第三个参数设为false，避免关联选中子节点
    });
  }
};

const echoHandler = () => {
  console.log(treeRef.value)
  const newPermissions = props.initialPermissions
  if (newPermissions && newPermissions.length > 0) {
    setCheckedPermissions(newPermissions);
  }
}

onMounted(() => {
  if (props.initialPermissions) echoHandler()
})

// 暴露方法给父组件
defineExpose({
  getSelectedPermissions,
  // setCheckedPermissions
});
</script>


<style scoped>
.permission-container {
  padding: 20px;
}
:deep(.el-tree-node__content) {
  min-width: 220px;
  max-width: 220px;
  width: 220px;
  box-sizing: border-box;
  border: 1px dashed pink;
  margin-bottom: 8px;
  /* padding: 12px 8px; */
}
:deep(.el-tree-node__children) {
  display: flex;
  flex-direction: column;
}
:deep(.is-penultimate){
  position: relative;
  /* background: yellowgreen; */
  width: 100%;
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
}
:deep(.is-penultimate > .el-tree-node__content) {
  /* background: yellow !important; */
  flex: 1;
  /* border: 1px solid red; */
  /* width: 26%; */
  /* width: 220px !important; */
}

:deep(.is-penultimate > .el-tree-node__children) {
  width: 500px;
  background-color: #f7eeef;
  /* border: 1px solid pink; */
  align-items: center;
  flex-direction: row !important;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  top: 0;
  right: 0;
}
:deep(.is-penultimate > .el-tree-node__children > .el-tree-node) {
  /* width: 100%; */
  flex: 0 0 25% !important;

}
:deep(.is-penultimate > .el-tree-node__children > .el-tree-node > .el-tree-node__content) {
  padding-left: 0 !important;
  min-width: 120px;
  max-width: 120px;
  width: 120px;
}

:deep(.is-penultimate) :deep(.el-tree-node__children) > div {
  display: inline-block;
  margin-right: 4px;
}
</style>