<template>
    <v-list density="compact">
      <template v-for="course in result" :key="course.name">
        <v-list-group v-if="!!course.average">
          <template v-slot:activator="{props}">
            <v-list-item v-bind="props" :title="course.name">
              <template v-slot:append>
                <v-list-item-action-text end>
                  <v-chip color="primary">{{course.average??'-'}}</v-chip>
                </v-list-item-action-text>
              </template>
            </v-list-item>
          </template>
          <v-list density="compact">
            <template v-for="section in course.sections" :key="section.name">
              <v-list-group v-if="!!section.average">
                <template v-slot:activator="{ props  }">
                  <v-list-item v-bind="props" :title="section.name">
                    <template v-slot:append>
                      <v-list-item-action-text end>
                        <v-chip color="primary">{{section.average??'-'}}</v-chip>
                      </v-list-item-action-text>
                    </template>
                  </v-list-item>
                </template>
                <v-list>
                  <template v-for="grade in section.grades" :key="grade.name">
                    <v-list-item v-if="!!grade.grade">
                      <v-list-item-header>
                        <v-list-item-title>{{grade.name}}</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip variant="outlined" class="mr-1" size="x-small" :ripple="false">
                            <v-icon start icon="mdi-chart-bar"></v-icon>
                            {{grade.average}}
                          </v-chip>
                          <v-chip variant="outlined" class="mr-1" size="x-small" :ripple="false">
                            <v-icon start icon="mdi-clock"></v-icon>
                            {{grade.weight}}
                            {{new Date(grade.date).toLocaleDateString()}}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item-header>
                      <v-list-item-action-text>
                        <v-chip color="primary">{{grade.grade}}</v-chip>
                      </v-list-item-action-text>
                    </v-list-item>
                  </template>
                </v-list>
              </v-list-group>
            </template>
          </v-list>
        </v-list-group>
      </template>
    </v-list>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import CourseInterface from '@/core/entity/CourseInterface';

const result = ref<CourseInterface[]>([]);
chrome.storage.local.get('gradesData', (changes) => {
  result.value = changes?.gradesData ?? [];
});
chrome.storage.onChanged.addListener((changes) => {
  result.value = changes?.gradesData.newValue ?? [];
});
</script>

<style>
</style>
