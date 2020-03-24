<template>
  <el-container>

    <!-- 头部区 -->
    <el-header>
      <!-- 商标区域 -->
      <div><img src="../assets/heima.png"> <span>电商管理后台系统</span></div>
      
      <!-- 退出按钮区域，绑定退出函数 -->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
 
    <!-- 页面主体区域 -->
    <el-container>

      <!-- 侧边栏 -->
      <!-- 展开是宽200px.收缩时为64px -->
      <el-aside :width="isCollapse?'64px':'200px'">

        <!-- 侧边栏折叠条区域 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
            
        <!-- 侧边栏菜单区域 -->
        <!-- unique-opened控制只打开一个子菜单，collapse控制折叠展开，collapses-transition取消折叠展开动画-->
        <!-- router为二级菜单开启了路由模式，才可以在左侧点击二级菜单时页面不发生跳转而是显示到右边内容主题区域,default-active控制高亮 -->
        <el-menu background-color="#373c41" text-color="#fff" active-text-color="#409EFF" unique-opened
                 :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">

          <!-- 一级菜单 -->
          <!-- 每个菜单都应该有自己独属的index，所以用赋值item.id，因为index只接受字符串+''使其变为字符串 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">

            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图案根据id动态绑定 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本，动态绑定item的authName -->
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单 -->
            <!-- 循环item.children，key值为subitem.id -->
            <!-- saveNavState用于保存激活的连接状态 ，点击二级菜单时对应的index值被保存到sessionStorage中-->
            <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/'+subitem.path)">

             <!-- 二级菜单的模板区域 -->
              <template slot="title">
                <!-- 二级菜单统一使用方块图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容主体区域 -->
      <el-main>
        <!-- 放置路由占位符，来显示其他子页面 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  data () {
    return {
      //侧菜单数据
      menulist: [],
      //为每一个一级菜单通过唯一的id赋予图标
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //控制左侧菜单是否折叠
      isCollapse: false,
      //被激活的链接地址，动态绑定到el-item上
      activePath: ''
    }
  },

  //组件被创建时会执行created函数，这里需要在创建的时候获取到菜单列表以及二级菜单处于激活状态的item
  created () {
    //调用getMenuList来获取所有的左侧菜单
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  
  methods: {

    //当点击退出后，login函数实现退出功能，先清除token，再强制跳转到登录页
    logout () {
      window.sessionStorage.clear();
      this.$router.push('/login')
    },

    //获取所有的左侧菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error('数据获取失败')
      this.menulist = res.data
    },

    //取反控制折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },

    //保存连接的激活状态
    saveNavState (activePath) {
      //获取到激活时的token，保存到activePath中
      window.sessionStorage.setItem('activePath', activePath)
      //被激活时activePath需要重新赋值，所以这里需要用到this.activePath =activePath写法
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  background-color: #373c41;
  padding-left: 0;
  font-size: 20px;
  color: #fff;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
}
.el-aside {
  background-color: #373c41;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf2;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  text-align: center;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  cursor: pointer;
  letter-spacing: 0.2em;
}
img {
  width: 50px;
  border-radius: 50%;
  margin-left: 5px;
}
</style>