<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectClasses = computed(() => ({
  'border-red-300 focus:border-red-500 focus:ring-red-500': props.error,
  'border-gray-300 focus:border-[#33c7d1] focus:ring-[#33c7d1]': !props.error
}))
</script>

<template>
  <div>
    <label 
      :for="label" 
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <select
      :id="label"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :required="required"
      class="mt-1 block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
      :class="selectClasses"
    >
      <option value="">Seleccionar...</option>
      <option 
        v-for="option in options" 
        :key="option.value" 
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template> 