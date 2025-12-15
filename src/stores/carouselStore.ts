import { defineStore } from 'pinia';

export const useCarouselStore = defineStore('carousel', {
  state: () => ({
    images: [
      { id: '1', src: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg' },
      { id: '2', src: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg' },
    ],
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