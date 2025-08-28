<template>
  <div class="image-gallery">
    <!-- Imagen principal -->
    <div class="main-image" @click="openLightbox">
      <img :src="currentImage" :alt="alt">
      <div class="zoom-indicator">
        <i class="fas fa-search-plus"></i>
      </div>
    </div>

    <!-- Miniaturas -->
    <div class="thumbnails">
      <div
        v-for="(imagen, index) in imagenes"
        :key="index"
        class="thumbnail"
        :class="{ active: currentImage === imagen }"
        @click="currentImage = imagen"
      >
        <img :src="imagen" :alt="alt">
      </div>
    </div>

    <!-- Lightbox -->
    <div v-if="isLightboxOpen" class="lightbox" @click="closeLightbox">
      <button class="close-button" @click="closeLightbox">&times;</button>
      <button class="nav-button prev" @click="prevImage" :disabled="currentIndex === 0">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="lightbox-content">
        <img :src="currentImage" :alt="alt">
      </div>
      <button class="nav-button next" @click="nextImage" :disabled="currentIndex === imagenes.length - 1">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ImageGallery',
  
  props: {
    imagenes: {
      type: Array,
      required: true
    },
    alt: {
      type: String,
      default: 'Imagen de producto'
    }
  },

  setup(props) {
    const currentImage = ref(props.imagenes[0])
    const isLightboxOpen = ref(false)
    
    const currentIndex = computed(() => {
      return props.imagenes.indexOf(currentImage.value)
    })

    const openLightbox = () => {
      isLightboxOpen.value = true
    }

    const closeLightbox = () => {
      isLightboxOpen.value = false
    }

    const prevImage = () => {
      if (currentIndex.value > 0) {
        currentImage.value = props.imagenes[currentIndex.value - 1]
      }
    }

    const nextImage = () => {
      if (currentIndex.value < props.imagenes.length - 1) {
        currentImage.value = props.imagenes[currentIndex.value + 1]
      }
    }

    return {
      currentImage,
      isLightboxOpen,
      currentIndex,
      openLightbox,
      closeLightbox,
      prevImage,
      nextImage
    }
  }
}
</script>

<style scoped>
.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: zoom-in;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover img {
  transform: scale(1.05);
}

.zoom-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.main-image:hover .zoom-indicator {
  opacity: 1;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
}

.thumbnails::-webkit-scrollbar {
  height: 4px;
}

.thumbnails::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.thumbnails::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
}

.thumbnail.active {
  border-color: #007bff;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 1rem;
  transition: opacity 0.3s ease;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev {
  left: 1rem;
}

.nav-button.next {
  right: 1rem;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

@media (max-width: 768px) {
  .thumbnail {
    width: 60px;
    height: 60px;
  }

  .nav-button {
    font-size: 1.5rem;
    padding: 0.5rem;
  }
}
</style> 