<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  filters: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['filter-change'])

const filterValues = ref({})

const handleFilterChange = (key, value) => {
  filterValues.value[key] = value
  emit('filter-change', filterValues.value)
}
</script>

<template>
  <div class="mb-6 bg-white p-4 rounded-lg shadow">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div v-for="filter in filters" :key="filter.key">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ filter.label }}</label>
        <input
          v-if="filter.type === 'text'"
          type="text"
          :placeholder="filter.placeholder"
          @input="handleFilterChange(filter.key, $event.target.value)"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
        >
        <select
          v-else-if="filter.type === 'select'"
          @change="handleFilterChange(filter.key, $event.target.value)"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-[#33c7d1] focus:ring-[#33c7d1]"
        >
          <option v-for="option in filter.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template> 