<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="border border-gray-300 rounded-md focus-within:border-[#33c7d1] focus-within:ring-1 focus-within:ring-[#33c7d1]">
      <Editor
        v-model="content"
        api-key="edz9tu27g5neryq1rrc88l7hogfeps0gg5qzxyjpowcsjyki"
        :init="editorConfig"
        :disabled="disabled"
        @onChange="handleChange"
        @onBlur="handleBlur"
        @onFocus="handleFocus"
      />
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
    
    <p v-if="helpText" class="mt-1 text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Editor from '@tinymce/tinymce-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Escribe aquí la descripción...'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  height: {
    type: [String, Number],
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

const content = ref(props.modelValue)

// Configuración oficial del editor TinyMCE con tu API key
const editorConfig = {
  height: props.height,
  placeholder: props.placeholder,
  toolbar_mode: 'sliding',
  plugins: [
    // Core editing features
    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
    // Features premium incluidas en tu cuenta gratuita
    'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'ai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
  ],
  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
  tinycomments_mode: 'embedded',
  tinycomments_author: 'CoralGris',
  mergetags_list: [
    { value: 'Producto.Nombre', title: 'Nombre del Producto' },
    { value: 'Producto.Precio', title: 'Precio del Producto' },
    { value: 'Producto.Categoria', title: 'Categoría del Producto' },
  ],
  ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('AI Assistant no implementado')),
  uploadcare_public_key: 'c450407332d7ea7e76d0',
  // Configuración personalizada
  branding: false,
  elementpath: false,
  resize: false,
  statusbar: false,
  menubar: false,
  setup: (editor) => {
    console.log('Configurando editor TinyMCE...')
    editor.on('init', () => {
      console.log('Editor TinyMCE inicializado correctamente')
      if (props.modelValue) {
        editor.setContent(props.modelValue)
      }
    })
  }
}

// Sincronizar el contenido con el v-model
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

watch(content, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleChange = (e) => {
  emit('change', e)
}

const handleBlur = (e) => {
  emit('blur', e)
}

const handleFocus = (e) => {
  emit('focus', e)
}
</script>

<style scoped>
/* Estilos personalizados para el editor */
:deep(.tox-tinymce) {
  border: none !important;
}

:deep(.tox .tox-toolbar) {
  background-color: #f9fafb !important;
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.tox .tox-tbtn) {
  background-color: transparent !important;
}

:deep(.tox .tox-tbtn:hover) {
  background-color: #e5e7eb !important;
}

:deep(.tox .tox-tbtn--enabled) {
  background-color: #d1d5db !important;
}

:deep(.tox .tox-edit-area) {
  background-color: white !important;
}

:deep(.tox .tox-edit-area__iframe) {
  background-color: white !important;
}

:deep(.tox .tox-toolbar__group) {
  padding: 0 8px !important;
}

:deep(.tox .tox-tbtn svg) {
  fill: #374151 !important;
}

:deep(.tox .tox-tbtn:hover svg) {
  fill: #33c7d1 !important;
}

:deep(.tox .tox-tbtn--enabled svg) {
  fill: #33c7d1 !important;
}
</style>
