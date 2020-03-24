<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索栏和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 将queryInfo.query双向绑定实现搜索功能，点击搜索按钮后立即刷新商品列表 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col> 
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>

        <!-- dateFormat是自行设定一个时间过滤器，用来将原本以毫秒显示的时间用正常年月日的格式显示出来 -->
        <el-table-column prop="add_time" label="创建时间" width="140px">
            <template slot-scope="scope">{{scope.row.add_time|dateFormat}}</template>
        </el-table-column>

        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background> </el-pagination>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" label-width="120px" ref="editFormRef">
        <el-form-item label="商品 ID"> <el-input v-model="editForm.goods_id" disabled></el-input></el-form-item>
        <el-form-item label="商品名称" prop="goods_name"> <el-input v-model="editForm.goods_name"></el-input> </el-form-item>
        <el-form-item label="商品价格(元)" prop="goods_price"> <el-input v-model="editForm.goods_price"></el-input> </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight"> <el-input v-model="editForm.goods_weight"></el-input> </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },

      // 商品数据列表
      goodsList: [],

      //总数据条数
      total: 0,

      // 控制修改分类对话框的显示
      editDialogVisible: false,

      // 修改用户的表单数据
      editForm: {},

      // 修改用户的验证规则
      editFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名字', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ]
      }
    }
  },

  created () {
    //根据分页获取所有的商品列表
    this.getGoodsList()
  },

  methods: {
    // 获取商品列表数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) { return this.$message.error('获取商品列表数据失败！') }
      this.$message.success('获取商品列表数据成功')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },

    // 监听当前每页显示多少条数据,获取后立即刷新商品列表
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    // 监听当前的页面改变，获取后立即刷新商品列表
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    // 删除商品,删除后立即刷新商品列表
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning' 
      }).catch(err => err)   

      if(confirmResult !== 'confirm'){ return this.$message.info('用户已取消删除')}

        const { data: res } = await this.$http.delete(`goods/${id}`)

        if (res.meta.status !== 200) {return this.$message.error('删除参数失败！') }
        this.$message.success('删除参数成功！')
        this.getGoodsList()
      }
    },

    // 跳转到添加商品页面
    goAddpage () {
      this.$router.push('/goods/add')
    },

    // 展示编辑分类的对话框
    async showEditDialog (goodsId) {
      const { data: res } = await this.$http.get('goods/' + goodsId)
      if (res.meta.status !== 200) { return this.$message.error('查询分类失败！') }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },

    // 监听编辑分类对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 编辑分类信息并提交
    editInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id,
          {
            goods_name: this.editForm.goods_name,
            goods_price: this.editForm.goods_price,
            goods_number: this.editForm.goods_number
          })
        if (res.meta.status !== 201) {
          return this.$message.error('更新分类信息失败！')
        }
        this.$message.success('更新分类信息成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getGoodsList()
      })
    }
  
}

</script>
<style lang="less" scoped>
.input-with-select {
  width: 350px;
  margin-right: 15px;
}
</style>