<template>
  <main class="container">
    <div class="header-top">
      <el-button @click="openDialog" type="primary" :icon="Plus">Добавить</el-button>
      <el-input
        v-model="searchModel"
        placeholder="Поиск по модели"
        @input="debouncedFn"
        clearable
      />
      <el-select
        v-model="selectedCategory"
        placeholder="Выберите категорию"
        @change="fetchProducts"
      >
        <el-option value="" label="Все">Все</el-option>
        <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
        />
      </el-select>
    </div>
    <div class="main-wrapper">
      <div class="table-container">
        <Table
          :list="products"
          :loading="isLoading"
          @edit="handleEdit"
          @delete="handleDelete"
          @show="show = true"
        />
        <span class="no-data" v-if="!products?.length && !loading"> No data </span>
      </div>
      <el-skeleton style="width: 100%" :rows="5" animated :loading="loading">
        <template #template>
          <el-skeleton-item
            v-for="i in 10"
            :key="i"
            variant="text"
            style="width: 100%; height: 40px; margin-top: 4px"
          ></el-skeleton-item>
        </template>
      </el-skeleton>
      <el-pagination
        v-if="products?.length && total > 10"
        v-model:current-page="currentPage"
        v-model:page-size="pageSizeCount"
        background
        :page-sizes="[10, 20, 30, 40]"
        layout="sizes, prev, pager, next"
        :total="total"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-if="selectedProduct !== null"
      close-on-press-escape
      @close="handleCloseModal"
      v-model="isShowOpenDialog"
      title="Заполните формы"
      width="500"
      center
    >
      <template #default>
        <el-form :rules="rules" ref="formRef" :model="selectedProduct" class="form-wrapper">
          <el-form-item prop="model" class="form-wrapper-el-item" label="Модель" clearable>
            <el-input
              class="form-wrapper-el-input"
              style="width: 100%"
              v-model="selectedProduct.model"
              placeholder="Please input"
            />
          </el-form-item>
          <el-form-item prop="releaseYear" class="form-wrapper-el-item" label="Год выпуска">
            <el-date-picker
              v-model="selectedProduct.releaseYear"
              type="year"
              placeholder="Pick a year"
            />
          </el-form-item>
          <el-form-item prop="category" class="form-wrapper-el-item" label="Категорй">
            <el-select v-model="selectedProduct.category" placeholder="Выберите категорию">
              <el-option value="" label="Все">Все</el-option>
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="price" class="form-wrapper-el-item" label="Цена">
            <el-input
              v-model="selectedProduct.price"
              placeholder="Please input"
              clearable
              :formatter="(value: any) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value: any) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </el-form-item>

          <el-form-item prop="createDate" class="form-wrapper-el-item" label="Cоздать дату">
            <el-date-picker
              v-model="selectedProduct.createDate"
              type="date"
              placeholder="Pick a day"
              :size="size"
            />
          </el-form-item>
          <el-checkbox v-model="selectedProduct.visible" label="Видимость" size="large" />
        </el-form>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="isLoading" v-if="!isEdit" type="primary" @click="submit()">
            Добавить
          </el-button>
          <el-button :loading="isLoading" v-else type="primary" @click="saveChanges">
            Редактировать
          </el-button>
        </div>
      </template>
    </el-dialog>
  </main>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch, reactive } from 'vue'
import axios from '@/services/axios'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import debounce from 'lodash.debounce'
import Table from '@/components/Table.vue'

const formRef = ref<FormInstance>()

const size = ref<'default' | 'large' | 'small'>('default')
const products = ref()
const categories = ref()
const searchModel = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSizeCount = ref(10)
const total = ref()

const loading = ref(false)
const show = ref(false)
const isShowOpenDialog = ref(false)
const isLoading = ref(false)
const isEdit = ref(false)

interface RuleForm {
  id: number
  model: string
  releaseYear: string
  category: string[]
  price: string
  createDate: string
  visible: boolean
}

const rules = reactive<FormRules<RuleForm>>({
  model: [{ required: true, message: 'Модель обязательна для заполнения', trigger: 'blur' }],
  releaseYear: [
    { required: true, message: 'Год выпуска обязателен для заполнения', trigger: 'blur' }
  ],
  category: [{ required: true, message: 'Категория обязательна для выбора', trigger: 'blur' }],
  price: [{ required: true, message: 'Цена обязательна для заполнения', trigger: 'blur' }],
  createDate: [
    { required: false, message: 'Дата создания обязательна для выбора', trigger: 'blur' }
  ],
  visible: [{ required: false, message: 'Выберите видимость', trigger: 'blur' }]
})

const selectedProduct = ref<RuleForm>({
  id: 0,
  model: '',
  releaseYear: '',
  category: [],
  price: '',
  createDate: '',
  visible: false
})
const fetchProducts = async (searchQuery = '', _limit = 10, _page = 1) => {
  const response = await axios.get('/products', {
    params: {
      _limit,
      _page,
      q: searchQuery
    }
  })
  products.value = response.data
  total.value = parseInt(response.headers['x-total-count'])
}

const debouncedFn = debounce(async (searchQuery: string) => {
  await fetchProducts(searchQuery)
}, 300)

const fetchCategories = async () => {
  const response = await axios.get('/categories')
  categories.value = response.data
}

const handleCurrentChange = (_page: number, _limit: number) => {
  currentPage.value = _page
  pageSizeCount.value = _limit
  fetchProducts(searchModel.value, pageSizeCount.value, currentPage.value)
}

watch(
  () => products.value,
  () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
)

const handleCloseModal = () => {
  isShowOpenDialog.value = false
  clearDataForm()
  formRef.value?.resetFields()
}

const handleEdit = (product: any) => {
  isEdit.value = true
  selectedProduct.value = { ...product }
  isShowOpenDialog.value = true
}

const saveChanges = async () => {
  isLoading.value = true
  try {
    await axios.put(`/products/${selectedProduct.value?.id}`, selectedProduct.value)
    await fetchProducts()
    isShowOpenDialog.value = false
    isLoading.value = false
  } catch (error) {
    console.error('Ошибка при обновлении товара', error)
  }
}

const handleDelete = async (id: number) => {
  isLoading.value = true
  try {
    await axios.delete(`/products/` + id)

    const index = products.value.findIndex((product: any) => product.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
      total.value -= 1 // Уменьшаем общее количество элементов
    }
    isLoading.value = false
  } catch (error) {
    console.error('Ошибка при удалении товара', error)
  }
}

const openDialog = () => {
  isShowOpenDialog.value = true
  isEdit.value = false
  clearDataForm()
}

function clearDataForm() {
  return (selectedProduct.value = {
    id: 0,
    model: '',
    releaseYear: '',
    category: null,
    price: '',
    createDate: '',
    visible: false
  })
}

const submit = async () => {
  try {
    const valid = await formRef.value?.validate()
    if (valid) {
      isLoading.value = true
      const res = await axios.post('/products', {
        model: selectedProduct.value.model,
        releaseYear: selectedProduct.value.releaseYear,
        category: selectedProduct.value.category,
        price: selectedProduct.value.price,
        createDate: selectedProduct.value.createDate,
        visible: selectedProduct.value.visible
      })

      products.value = [...products.value, res.data]
      await fetchProducts()

      isShowOpenDialog.value = false
      isLoading.value = false
    } else {
      console.log('Validation failed')
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>
<style>
.main-wrapper {
  padding-bottom: 90px;
}
.header-top {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  gap: 24px;
  margin-bottom: 32px;
  width: 70%;
}

.form-wrapper {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 12px;
}

.form-wrapper-el-item {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  margin-bottom: 4px;
}
.el-form-item__content {
  width: 100%;
}
.table-container {
  overflow-x: scroll;
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
}

.no-data {
  display: block;
  text-align: center;
  margin: 12px auto;
}
.el-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 32px;
}
</style>
