<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 点击首页按钮时返回首页 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="card">
      <!-- 搜索与添加区域，gutter设定行间距 -->
      <el-row :gutter="20">
          <!-- 将一行分成24栅格，这里占8格 点击刷新用户列表-->
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加用户按钮，type控制颜色 -->
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 ，数据源为userlist-->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>

        <!-- 状态用作用域插槽slot-scope接收scope，scope.row就是获得的数据对象，将数据对象里面的mg_state属性双向绑定到状态上 -->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="useStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <!-- 用作用域插槽slot-scope获取到这一行的数据 -->
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮，为点击事件绑定一个展示修改用户事件数 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮，为点击事件绑定一个通过id移除用户函数 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮，enterable鼠标移除马上隐藏content，setRoles(scope.row)展示分配角色的对话框-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable='false'>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域，size-change监听page-size改变事件，current=change监听页码值改变事件，current-page当前页数，page-size单页条数，page-size当前每页数据条数-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                     :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框，:visible.sync用于控制添加用户对话框的显示与隐藏，addDialogClose用于监听对话框close事件，close时重置对话框-->
    <el-dialog title="添加用户信息" :visible.sync="addDialogVisible" width="50%" @close='addDialogClose'>

      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password" autocomplete="new-password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 添加用户对话框底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框，editDialogClosed控制对话框关闭时重置 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域，model动态绑定用户数据，rule表单验证规则ref当前表单的引用对象 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>

    </el-dialog>

    <!-- 分配角色的对话框，visible.sync控制对话框显示与隐藏，setRolesdialogClosed对话框关闭时重置数据-->
    <el-dialog title="分配角色" :visible.sync="setRolesdialogVisible" width="50%" @close="setRolesdialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectRolesId" placeholder="请选择">
            <!-- :label看到的文本 :value是选中的值 -->
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesdialogVisible = false">取 消</el-button>
        <el-button type="primary"  @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {

    // 自定义验证电话规则
    var checkMobile = (rule, value, cb) => {
      // 验证电话的正则表达式
      const regMobile = /^1(3|4|5|7|8)\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入有效的电话号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: { query: '',  // 当前的页数
                   pagenum: 1,    // 当前页码值，默认第一页
                   pagesize: 10   //默认每页显示10条数据
                  },

      //用户列表
      userlist: [],

      //总数据条数
      total: 0,

      // 控制添加用户对话框的显示与隐藏，false默认隐藏
      addDialogVisible: false,

      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },

      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, message: '请输入正确的电话', trigger: ['blur', 'change'] }
        ]
      },

      // 控制修改用户对话框的显示与隐藏，false默认隐藏
      editDialogVisible: false,

      // 修改用户的表单数据
      editForm: {},

      // 修改用户的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, message: '请输入正确的电话', trigger: ['blur', 'change'] }
        ]
      },

      // 控制分配角色对话框的显示与隐藏
      setRolesdialogVisible: false,

      // 需要被分配角色的用户信息
      userInfo: '',

      // 所有角色的数据列表
      rolesList: [],

      // 已选中的角色Id值
      selectRolesId: ''
    }
  },

  //在created生命周期函数发起当前组件的首屏数据请求
  created () {
    this.getUserList()
  },

  methods: {

    // 页面创建期间调用getUserList发起ajxs请求，获取用户数据列表
    async getUserList () {
        //发起get请求，请求地址是users,请求目的是获取用户列表的参数对象，用queryInfo来接收
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      this.userlist = res.data.users
      this.total = res.data.total
    },

    // 监听pagesize（每页显示多少条数据）改变的事件，改变后即时获取最新数据并刷新页面
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()  
    },

    // 监听pagenum（页码值）改变的事件，改变后即时获取最新数据并刷新页面
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()  
    },

    // 监听switch开关状态的改变并在数据库中更新
    async useStateChanged (userinfo) {
        // 向数据库发起用户状态更新ajxs请求
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)

      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    },

    // 监听添加用户对话框的关闭事件，当对话框关闭时重置对话框内容
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },

    // 点击确定按钮，添加新用户,成功添加后隐藏对话框并且重新获取用户列表数据
    addUser () {
        // 添加前先进行表单的预校验，校验失败则直接返回，校验成功则发起ajxs请求
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },

    // 展示编辑用户的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 监听修改用户对话框的关闭事件，关闭时重置数据
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 修改用户信息并提交，提交前先预验证,验证成功提交数据并关闭对话框，更新用户数据
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！')
        }
        this.$message.success('更新用户信息成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
      })
    },

    // 根据id删除对用用户，删除前需要弹框询问是否确认删除
    async removeUserById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 确认删除返回字符串为confirm，取消删除返回字符串为cancel,确认后的操作,用catch捕获用户取消行为
      if(confirmResult !== 'confirm'){return this.$message.info('已取消删除')}

        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        this.getUserList()
        // 失败后的操作
    },
    
    // 分配角色的对话框
    async setRoles (userInfo) {
      //在展示对话框时先获取所有角色的列表
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败！')
      }
      this.rolesList = res.data
      //显示对话框
      this.setRolesdialogVisible = true
    },

    // 点击按钮确定分配新角色，分配完成后刷新用户列表并关闭分配角色对话框
    async saveRoleInfo () {
      if (!this.selectRolesId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRolesId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRolesdialogVisible = false
    },

    // 监听分配角色对话框关闭事件，数据重置为空
    setRolesdialogClosed () {
      this.selectRolesId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination {
  margin-top: 15px;
}
</style>