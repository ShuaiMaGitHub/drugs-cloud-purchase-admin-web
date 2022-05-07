<template>
  <v-card>
    <v-toolbar class="elevation-0">
      <v-btn @click="addItem" color="primary">新增商品</v-btn>
      <v-spacer/>
      <v-flex xs3>
        状态：
        <v-btn-toggle mandatory v-model.lazy="filter.saleable">
          <v-btn flat >
            全部
          </v-btn>
          <v-btn flat :value="false">
            上架
          </v-btn>
          <v-btn flat :value="true">
            下架
          </v-btn>

        </v-btn-toggle>
      </v-flex>
      <v-flex xs3>
        <v-text-field
          append-icon="search"
          label="搜索"
          single-line
          hide-details
          v-model="filter.search"
        />
      </v-flex>
    </v-toolbar>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="items"
      :pagination.sync="pagination"
      :total-items="totalItems"
      :loading="loading"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.title }}</td>
        <td class="text-xs-center">{{ props.item.cname}}</td>
        <td class="text-xs-center">{{ props.item.bname }}</td>
        <td class="justify-center layout px-0">
          <v-btn icon small @click="editGoods(props.item)">
            <i class="el-icon-edit"/>
          </v-btn>
          <v-btn icon small @click="deleteItem(props.item.id)">
            <i class="el-icon-delete"/>
          </v-btn>
          <v-btn icon small v-if="props.item.saleable" @click="changeSaleable(props.item.id)">下架</v-btn>
          <v-btn icon v-else @click="changeSaleable(props.item.id)">上架</v-btn>
        </td>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          对不起，没有查询到任何数据 :(
        </v-alert>
      </template>
      <template slot="pageText" slot-scope="props">
        共{{props.itemsLength}}条,当前:{{ props.pageStart }} - {{ props.pageStop }}
      </template>
    </v-data-table>

    <v-dialog v-if="show" v-model="show" max-width="900" scrollable persistent>
      <!--弹出的对话框-->
      <v-dialog max-width="800" v-model="show" persistent >
        <v-card>
          <!--对话框的标题-->
          <v-toolbar dense dark color="primary">
            <v-toolbar-title>{{isEdit ? '修改' : '新增'}}商品</v-toolbar-title>
            <v-spacer/>
            <!--关闭窗口的按钮-->
            <v-btn icon @click.native="closeForm"><v-icon>close</v-icon>
            </v-btn>
          </v-toolbar>
          <!--对话框的内容，表单-->
          <v-card-text class="px-3" style="height: 600px">
            <goods-form :oldGoods="oldGoods" :step="step" @close="closeForm" :is-edit="isEdit" ref="goodsForm"/>
          </v-card-text>
          <!--底部按钮，用来操作步骤线-->
          <v-card-actions class="elevation-10">
            <v-flex class="xs3 mx-auto">
              <v-btn @click="lastStep" color="primary" :disabled="step === 1">上一步</v-btn>
              <v-btn @click="nextStep" color="primary" :disabled="step === 4">下一步</v-btn>
            </v-flex>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-dialog>
  </v-card>
</template>

<script>
  import GoodsForm from './GoodsForm'

  export default {
    name: "item",
    components: {
      GoodsForm
    },
    data() {
      return {
        filter: {
          saleable: true, // 上架还是下架
          search: '', // 搜索过滤字段
        },
        totalItems: 0,// 总条数
        items: [],// 表格数据
        loading: true,
        pagination: {},// 分页信息
        headers: [// 表头
          {text: 'id', align: 'center', value: 'id',sortable: false},
          {text: '标题', align: 'center', sortable: false, value: 'name'},
          {text: '商品分类', align: 'center', sortable: false, value: 'cname'},
          {text: '品牌', align: 'center', value: 'bname', sortable: false,},
          {text: '操作', align: 'center', value: 'id', sortable: false}
        ],
        show: false,// 是否弹出窗口
        oldGoods: {}, // 即将被编辑的商品信息
        isEdit: false, // 判断是编辑还是新增
        step: 1// 表单中的导航条
      }
    },
    watch: {
      pagination: {
        handler() {
          this.getDataFromApi();
        },
        deep: true
      },
      filter: {// 监视搜索字段
        handler() {
          this.getDataFromApi();
        },
        deep: true
      }
    },
    mounted() {
      this.getDataFromApi();
    },
    methods: {
      closeForm() {
        this.show = false;
        this.step = 1;
        this.oldGoods = null;
        this.getDataFromApi();
      },
      lastStep() {
        if(this.step > 1){
          this.step--
        }
      },
      nextStep() {
        if(this.step < 4 && this.$refs.goodsForm.$refs.basic.validate()){
          this.step++
        }
      },
      addItem() {
        //把oldBrand变为null
        this.oldGoods = null;
        // 修改标记
        this.isEdit = false;
        // 显示弹窗
        this.show = true;
      },
      async editGoods(oldGoods) {
        // 发起请求，查询商品详情和skus
        oldGoods.spuDetail = await this.$http.loadData("/item/spu/detail/" + oldGoods.id);
        oldGoods.skus = await this.$http.loadData("/item/sku/list?id=" + oldGoods.id);
        // 修改标记
        this.isEdit = true;
        // 控制弹窗可见：
        this.show = true;
        // 获取要编辑的goods
        this.oldGoods = oldGoods;
      },
      deleteItem(id) {
        this.$message.confirm('此操作将永久删除该商品, 是否继续?')
          .then(() => {
            // 发起删除请求
            this.$http.delete("/item/goods/" + id)
              .then(() => {
                // 删除成功，重新加载数据
                this.getDataFromApi();
                this.$message.success('删除成功!');
              })
          })
          .catch(() => {
            this.$message.error('已取消删除');
          });

      },
      getDataFromApi() {
        // 发起请求
        this.$http.get("/item/spu/page", {
          params: {
            key: this.filter.search, // 搜索条件
            page: this.pagination.page,// 当前页
            rows: this.pagination.rowsPerPage,// 每页大小
            saleable: this.filter.saleable === 0 ? null : this.filter.saleable, // 上下架,如果为0则设为null
          }
        }).then(resp => { // 这里使用箭头函数
          this.items = resp.data.items;
          this.totalItems = resp.data.total;
          // 完成赋值后，把加载状态赋值为false
          this.loading = false;
        })
      },
      changeSaleable(id){
        // 发起put请求
        this.$http.put("/item/goods/change/"+id)
          .then(() => {
          // 修改状态成功,重新加载数据
          this.getDataFromApi();
          this.$message.success('修改上下架状态成功!');
        })
          .catch(() => {
            this.$message.error('修改失败!');
          });
      }
    }
  }
</script>

<style scoped>
  label {
    font-size: 14px;
  }
</style>
