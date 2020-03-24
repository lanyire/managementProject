<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域，:closable="false"设置警告区域不可关闭 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false">
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>请选择商品分类：</span>
          <!-- 选择商品分类的级联选择器 ，options="cateList"数据源，props级联选择框的配置列表，handleChange监听商品分类事件-->
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleChange" clearable></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面版，绑定为many-->
        <el-tab-pane label="动态参数" name="many">

          <!-- 动态参数添加按钮，disabled="isBtnDisabled"是计算属性，控制按钮是否为禁用状态，添加参数对话框默认隐藏，当点击添加参数后显示 -->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加参数</el-button>

          <!-- 动态参数表格 ，数据源是获取并赋值给manyTableDate的动态数据-->
          <el-table :data="manyTableDate" border stripe>

            <!-- 索引列下的展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}} </el-tag>

                <!-- 输入的文本框，并且用v-if和v-else控制是显示文本或者是输入文本每个文本框各自的属性值 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                  <!-- @click="showEditDialog(scope.row.attr_id)"点击编辑按钮根据id显示相应参数修改对话框 -->
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <!-- @click="removeParams(scope.row.attr_id)"点击删除按钮根据id删除相应参数 -->
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面版 ，绑定为only，disabled="isBtnDisabled"控制按钮是否为禁用状态-->
        <el-tab-pane label="静态属性" ame="only">
            
          <!-- 添加参数的按钮，添加参数对话框默认隐藏，当点击添加参数后显示-->
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加属性</el-button>

          <!-- 静态属性表格，数据源为onlyTabDate -->
          <el-table :data="onlyTabDate" border stripe>

            <!-- 索引列下的展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">

                <!-- 循环渲染Tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag> 

                <!-- 输入的文本框，并且用v-if和v-else控制是显示文本或者是输入文本，每个文本框各自的属性值 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                          size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框,动静态参数共用,titleText为计算属性，visible.sync控制对话框的显示与隐藏，@close="addDialogClose监听对话框关闭时重置数据-->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" @close="addDialogClose">

      <!-- 内容主体区域 ，addFormRules表单的验证规则对象，addFormRef表单数据索引对象-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible"  @close="editDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      
      // 商品分类列表
      cateList: [],

      // 级联选择框的配置对象
      cascaderProps: {
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值
        children: 'children'
      },

      // 级联选择框双向绑定到的数组选中的父级分组ID数组
      selectedKeys: [],

      // 被激活的页签的名称
      activeName: 'many',
      
      // 动态参数的数据
        manyTableData: [], 

      // 静态属性的数据
        onlyTableData: [], 

      // 添加参数对话框的显示，默认隐藏
      addDialogVisible: false,

      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },

      // 添加数据的验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },

      // 控制修改参数对话框的显示与隐藏，默认隐藏
      editDialogVisible: false,

      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },

      // 修改参数数据的验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },

      //控制按钮与文本框的切换显示
      inputVisible:false,

      //文本框中输入的内容
      inputValue:''
    }
  },

  created () {
    this.getCateList()
  },

  methods: {

    // 获取所有商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) { return this.$message.error('获取商品分类数据列表失败！') }
      this.cateList = res.data
    },

    // 级联选择器选中项变化，会触发这个函数
    handleChange () {
     this.getParamsData()
    },

    // tab页签点击事件的处理函数,点击立即获取相应的参数列表
    handleTabClick () {
      this.getParamsData()
    },

    // 获取分类参数列表数据
    async getParamsData () {
        //证明选中的不是三级分类
        if(this.selectedCatekeys.length !== 3)
        {
            this.selectedCatekeys = []
            this.manyTableData = []
            this.onlyTableData = []
            return
        }
        
        //证明选中的是三级分类
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) { return this.$message.warning('获取参数列表失败') }

      // 将得到的数据进行forEach循环，将字符串attr_vals分割为数组，并且只有当attr_vals不为空时才将其分割为数组
      res.data.forEach(item => {item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      this.tableData = res.data
      // 如果获取到的是many则把获取的数据绑定到动态参数列表中，获取的是only则把获取的数据绑定到静态参数列表中
       if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else { this.onlyTableData = res.data } 
    },

    // 展示添加参数对话框
    showAddDialog () {
      this.addDialogVisible = true
    },

    // 监听添加对话框关闭，关闭时重置数据
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },

    // 点击确定按钮添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
          //预验证失败
        if (!valid) return;
        //预验证成功
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          { attr_name: this.addForm.attr_name,attr_sel: this.activeName })
        if (res.meta.status !== 201) {  return this.$message.error('添加失败！') }
        this.$message.success('添加成功！')
        //成功添加后隐藏对话框并刷新参数列表
        this.addDialogVisible = false
        this.getParamsList()
      })
    },

    // 点击按钮，展示修改参数对话框
    async showEditDialog (attrId) {
      this.editDialogVisible = true
      //查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) { return this.$message.error('查询参数失败！') }
      //获取成功后获取的数据赋给编辑表单对象
      this.editForm = res.data
    },

    // 监听修改参数对话框的关闭事件，关闭时重置数据
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },

    // 点击按钮，确定修改参数信息
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        //校验失败
        if (!valid) return;
        //校验成功
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) { return this.$message.error('参数修改失败！') }
        this.$message.success('参数修改成功！')
        //关闭对话框并刷新并刷新参数列表
        this.editDialogVisible = false
        this.getParamsList()
      })
    },

    // 根据id删除参数
   async removeParams (attrId) {
        //删除参数前先进行询问
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      //用户取消了删除的操作
      if(confirmResult !== 'confirm'){return this.$message.info('用户已取消删除')}

      //删除的业务逻辑
      const { data:res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if(res.meta.status !== 200){ return this.$message.error('删除参数失败') }
      this.$message.succsee('删除参数成功')
    },

    // 文本框失去焦点，或摁下Enter键都会触发
    handleInputConfirm (row) {
      // 删除字符串首尾的空白格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },

    // 点击按钮，展示文本输入框
    showInput (row) {
      //这里用作用域插槽才能保证不同参数之间各自的文本框不受影响，如果用this将导致不同参数共用一个文本框
      row.inputVisible = true

      // 让文本框自动获得焦点,$nextTick 方法的作用 就是当页面上元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 将对 attr_vals的操作，保存到数据库中
    async saveAttrVals (row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数可选项失败！')
      }
      this.$message.success('修改参数可选项成功！')
    },

    // 删除对应的参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },

  // 计算属性
  computed: {
    // 只有三级属性下才能选中参数列表，如果按钮需要被禁用则返回true，否则返回false
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) { return true}
      return false
    },

    // 当前选中的三级分类的Id
    cateId () {
        //选中了三级分类
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      //没选中三级分类
      return null
    },

   // 复用组件,动态计算标题的文本，如果激活的是many则显示动态参数，如果激活的是only则显示静态属性
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader {
  width: 300px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
