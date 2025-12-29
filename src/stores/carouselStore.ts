import { defineStore } from 'pinia';

export const useCarouselStore = defineStore('carousel', {
  state: () => ({
    images: [] as { id: string; src: string }[],
  }),
  actions: {
    addImage(src: string) {
      const newImage = { id: Date.now().toString(), src };
      this.images.push(newImage);
    },
    removeImage(id: string) {
      this.images = this.images.filter(image => image.id !== id);
    },
  },
});