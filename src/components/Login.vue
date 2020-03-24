<template>
  <div class="login_container">

    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box"><img src="..\assets\logo.png" alt="" /></div>

      <!-- 登录表单区域 -->
      <!-- model为登录表单数据双向绑定,ref用来获取表单的实例对象以便实现重置功能，rules为表单绑定验证规则-->
      <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">

        <!-- 用户名区域 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>

        <!-- 密码区域 -->
        <el-form-item prop="password" autocomplete="new-password">
          <el-input type="password" show-password v-model="loginForm.password" prefix-icon="iconfont icon-3702mima">
          </el-input>
        </el-form-item>

        <!-- 按钮区域 -->
        <el-form-item class="btns">
            
          <el-button type="primary" @click="login">登录</el-button>

          <!-- 重置按钮通过this.refs.lgoinFormRef.resetFields（）方法重置数据 -->
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {

     //这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },

     // 表单验证规则
      loginFormRules: {

          //验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],

        //验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
      //点击重置按钮，重置登录表单
    resetLoginForm () {
      //refs里面有个loginFormRef属性，它就是表单的引用对象，resetFields是element UI提供的重置数据方法
      this.$refs.loginFormRef.resetFields()
    },

    login () {
        //获取表单的引用对象后调用validate函数进行表单的预校验
      this.$refs.loginFormRef.validate(async valid => {

          //如果valid为false则return，表示不发起请求
        if (!valid) return;

        //如果valid为true则需要用$http发起登录请求，要求先配置axios包实现跨域请求
        const { data: res } = await this.$http.post('login', this.loginForm)

        //如果获取的result里面的meta状态码不是200的话，证明登录失败,否则登录成功
        //element UIl提供弹框提示message，message需要全局挂载vue.prototypr.$message = message
        if (res.meta.status !== 200) return this.$message.error('登录失败！');
        this.$message.success('登录成功')
      
        //token只能在访问时生效，所以要放在sessionStorage里，服务器返回的token放置在data里
        window.sessionStorage.setItem('token', res.data.token)

        //登录成功后页面跳转到home组件
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding:0 20px;
    box-sizing: border-box;
  }
}
</style>