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
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
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

const inputClasses = computed(() => ({
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
    
    <div class="mt-1">
      <input
        :id="label"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :required="required"
        class="block w-full rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
        :class="inputClasses"
      >
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template> 