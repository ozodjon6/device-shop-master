<template>
  <table class="table-wrap" v-if="!list || !loading" list="">
    <thead v-if="THeadLabel">
      <tr>
        <th v-for="(item, i) in THeadLabel" :key="i">
          <span>{{ item }}</span>
        </th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in list" :key="product?.id">
        <td>
          <span>{{ product?.id }}</span>
        </td>
        <td>
          <span>{{ product?.model }}</span>
        </td>
        <td>
          <span>{{ dayjs(product?.releaseYear).format('YYYY') }}</span>
        </td>
        <td>
          <span>{{ product?.category }}</span>
        </td>
        <td>
          <span>{{ product?.price }}</span>
        </td>
        <td>
          <span>{{ dayjs(product?.createDate).format('DD MM YYYY') }}</span>
        </td>
        <td>
          <el-checkbox v-model="product.visible" label="Видимость" size="large" />
        </td>
        <td>
          <el-button size="small" @click="handleEdit(product)">Edit</el-button>
        </td>
        <td>
          <el-button size="small" type="danger" @click="confirmDelete(product?.id)"
            >Delete
          </el-button>
        </td>
      </tr>
    </tbody>
  </table>
  <el-dialog @close="show = false" v-model="show" title="Вы уверены хотите удалить" center>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="show = false">Отмень</el-button>
        <el-button :loading="loading" type="primary" @click="handleDelete(productId)">
          Удалить
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { THeadLabel } from '@/types/common'
import dayjs from 'dayjs'
import { ref } from 'vue'

interface Props {
  list: {
    id: number
    model: string
    releaseYear: string
    category: []
    price: string
    createDate: string
    visible: boolean
  }[]
  loading: boolean
}

defineProps<Props>()
const productId = ref(null)

const emits = defineEmits(['edit', 'delete', 'show'])
const show = ref(false)
const handleEdit = (product: any) => {
  // Вызов события edit и передача данных
  emits('edit', product)
}

const confirmDelete = (id: any) => {
  productId.value = id
  show.value = true
}

const handleDelete = (productId: any) => {
  emits('delete', productId)
  setTimeout(() => {
    show.value = false
  }, 500)
}
</script>

<style scoped>
.table-wrap {
  border-collapse: collapse;
  width: 100%;
}

.table-container th,
.table-container td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

tr {
  width: 100%;
}

.table-container th {
  background-color: #f2f2f2;
}

.table-container tr:nth-child(even) {
  background-color: #f2f2f2;
}

.table-container tr:hover {
  background-color: #ddd;
}

/* Center align text in table header */
.table-container th {
  text-align: center;
}

/* Center align text in table cells */
.table-container td {
  text-align: center;
}
</style>
