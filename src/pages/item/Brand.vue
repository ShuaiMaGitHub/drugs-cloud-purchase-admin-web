<template>
  <v-card>
    <v-card-title>
      <v-btn @click="addBrand" color="primary">新增品牌</v-btn>
      <!--搜索框-->
      <v-spacer/>
      <v-text-field
        append-icon="search"
        label="搜索"
        single-line
        hide-details
        v-model="key"
      />
    </v-card-title>
    <v-divider/>
    <v-data-table
      :headers="headers"
      :items="brands"
      :pagination.sync="pagination"
      :total-items="totalBrands"
      :loading="loading"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center"><img v-if="!!props.item.image" width="102" height="36" :src="props.item.image"/></td>
        <td class="text-xs-center">{{ props.item.letter }}</td>
        <td class="justify-center layout px-0">
          <v-btn icon @click="editBrand(props.item)">
            <i class="el-icon-edit"/>
          </v-btn>
          <!--<td class="justify-center layout px-0">
          <v-btn flat icon color="indigo" @click="editBrand(this.props.items">
            <v-icon>edit</v-icon>
          </v-btn>-->
          <v-btn icon @click="deleteBrand(props.item)">
            <i class="el-icon-delete"/>
          </v-btn>
        </td>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat>
          <v-card-text>Peek-a-boo!</v-card-text>
        </v-card>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          对不起，没有查询到任何数据 :(
        </v-alert>
      </template>
      <!--      <template slot="pageText" slot-scope="props">-->
      <!--        共{{props.itemsLength}}条,当前:{{ props.pageStart }} - {{ props.pageStop }}-->
      <!--      </template>-->
    </v-data-table>

    <!--弹出的对话框-->
    <v-dialog v-model="show" max-width="500" scrollable v-if="show">
      <v-card>
        <!--对话框的标题-->
        <v-toolbar dark dense color="primary">
          <!--<span class="headline">{{isEdit ? '修改品牌' : '新增品牌'}}</span>-->
          <v-toolbar-title>{{isEdit ? '修改品牌' : '新增品牌'}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <!--关闭窗口的按钮-->
          <v-btn icon @click.native="show = false"><v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <!--对话框的内容 表单 -->
        <v-card-text class="px-5 py-2">
          <brand-form v-bind:oldBrand="oldBrand" v-bind:isEdit="isEdit" @close="show = false" :reload="getDataFromApi"/>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import BrandForm from './BrandForm'

  export default {
    name: "brand",
    components: {
      BrandForm
    },
    data() {
      return {

        headers: [// 表头
          {text: '品牌id', align: 'center', value: 'id'},
          {text: '名称', align: 'center', sortable: false, value: 'name'},
          {text: 'LOGO', align: 'center', sortable: false, value: 'image'},
          {text: '首字母', align: 'center', value: 'letter', sortable: true,},
          {text: '操作', align: 'center', sortable: false}
        ],
        key: '',// 过滤字段
        totalBrands: 0,// 总条数
        brands: [],// 表格数据
        loading: false,
        pagination: {},// 分页信息
        show: false,// 是否弹出窗口
        isEdit: false, // 判断是编辑还是新增
        oldBrand:{} // 旧数据
      }
    },
    watch: {
      pagination: {
        handler() {
          this.getDataFromApi();
        },
        deep: true
      },
      key() {
        this.getDataFromApi();
        this.pagination.page = 1;
      },
      show(val, oldVal) {
        // 表单关闭后重新加载数据
        if (oldVal) {
          this.getDataFromApi();
        }
      }
    },
    created() {
      this.getDataFromApi();
    },
    methods: {
      addBrand() {
        //修改标记
        this.isEdit = false;
        //控制弹窗可见
        this.show = true;
        //把oldBrand变成null*********初始为{}的话弹窗将无法关闭**************
        this.oldBrand = null;
      },
      editBrand(oldBrand){
        //根据品牌信息查询商品分类
        this.$http.get("/item/category/bid/"+oldBrand.id).then(
          ({data}) => {
            this.isEdit = true;
            this.show = true;
            this.oldBrand = oldBrand;
            this.oldBrand.categories = date;
          }
        ).catch();
      },
      deleteBrand(item) {
        this.$message.confirm('此操作将永久删除该品牌, 是否继续?').then(() => {
          // 发起删除请求
          this.$http.delete("/item/brand/bid/" + item.id)
            .then(() => {
              // 删除成功，重新加载数据
              this.$message.success("删除成功！");
              // 把查询的值设置为空
              this.key = "";
              this.getDataFromApi();
              this.pagination.page = 1;
            })
        }).catch(() => {
          this.$message.info("删除已取消！");
        });

      },
      getDataFromApi() {
        this.loading = true;
        this.$http.get("/item/brand/page", {
          params: {
            // 当前页码
            page: this.pagination.page,
            // 每页大小
            rows: this.pagination.rowsPerPage,
            // 排序字段
            sortBy: this.pagination.sortBy,
            // 是否降序
            desc: this.pagination.descending,
            key: this.key // 搜索条件
          }
        }).then(resp => {
          this.brands = resp.data.items;
          this.totalBrands = resp.data.total;
          this.loading = false;
        })
      }
    }
  }
</script>

<style scoped>

</style>
