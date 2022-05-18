<template>
  <v-card
    class="text-center mb-3"
    v-if="!!menu.starter || !!menu.dessert || !!menu.mainCourse.join()"
  >
    <v-card-header class="d-flex justify-center">
      <div>
        <div class="text-overline">{{menu.starter}}</div>
        <v-divider/>
        <div class="text-h6">{{menu.mainCourse[0]}}</div>
        <div class="text-overline">{{menu.mainCourse.slice(1).join('\n')}}</div>
        <v-divider/>
        <div class="text-overline">{{menu.dessert}}</div>
      </div>
    </v-card-header>
    <v-card-actions class="d-flex justify-center">
      {{menu.rating.count}}
      <v-rating
        v-model="menu.rating.value"
        @change="$emit('rate',menu.hash,menu.rating.value)"
        empty-icon="mdi-heart-outline"
        full-icon="mdi-heart"
        half-icon="mdi-heart-half-full"
        half-increments
        hover
        length="5"
        density="comfortable"
        color="red"
      ></v-rating>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { PropType, toRef } from 'vue';

interface Menu {
  starter: string;
  mainCourse: string[];
  dessert: string;
  containsPork: boolean;
  hash: string;
  rating: {
    value: number;
    count: number;
  };
}

const props = defineProps({
  menu: {
    type: Object as PropType<Menu>,
    required: true,
  },
});

const menu = toRef(props, 'menu');

</script>
