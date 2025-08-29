<template>
  <div 
    v-if="content" 
    class="prose prose-sm max-w-none"
    v-html="sanitizedContent"
  />
  <div v-else class="text-gray-500 italic">
    Sin descripción disponible
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  allowTags: {
    type: Array,
    default: () => [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]
  },
  allowAttributes: {
    type: Array,
    default: () => [
      'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'
    ]
  }
})

// Sanitizar el contenido HTML para prevenir XSS
const sanitizedContent = computed(() => {
  if (!props.content) return ''
  
  return DOMPurify.sanitize(props.content, {
    ALLOWED_TAGS: props.allowTags,
    ALLOWED_ATTR: props.allowAttributes,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  })
})
</script>

<style scoped>
/* Estilos para el contenido renderizado */
:deep(.prose) {
  color: #374151;
  line-height: 1.6;
}

:deep(.prose p) {
  margin-bottom: 1rem;
}

:deep(.prose ul), :deep(.prose ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

:deep(.prose li) {
  margin-bottom: 0.5rem;
}

:deep(.prose strong), :deep(.prose b) {
  font-weight: 600;
  color: #111827;
}

:deep(.prose em), :deep(.prose i) {
  font-style: italic;
}

:deep(.prose h1), :deep(.prose h2), :deep(.prose h3), 
:deep(.prose h4), :deep(.prose h5), :deep(.prose h6) {
  font-weight: 600;
  color: #111827;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

:deep(.prose h1) { font-size: 1.5rem; }
:deep(.prose h2) { font-size: 1.25rem; }
:deep(.prose h3) { font-size: 1.125rem; }

:deep(.prose blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
  margin: 1rem 0;
}

:deep(.prose code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.prose pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

:deep(.prose a) {
  color: #33c7d1;
  text-decoration: underline;
}

:deep(.prose a:hover) {
  color: #2ba3ac;
}

:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

:deep(.prose th), :deep(.prose td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

:deep(.prose th) {
  background-color: #f9fafb;
  font-weight: 600;
}
</style>
