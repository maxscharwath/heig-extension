<template>
    <section v-for="course in result" :key="course.name">
      <h1>{{course.name}} - {{course.average}}</h1>
      <dl v-for="section in course.sections" :key="section.name">
        <dt>{{section.name}} - {{section.average}}</dt>
        <dd v-for="grade in section.grades" :key="grade.name">
          <span>{{grade.name}} - {{grade.grade}} ({{grade.average}})</span>
        </dd>
      </dl>
    </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import CourseInterface from '@/core/entity/CourseInterface';

const result = ref<CourseInterface[]>([]);
chrome.storage.local.get('result', (changes) => {
  if (changes.result) {
    result.value = changes.result;
  }
});
chrome.storage.onChanged.addListener((changes) => {
  console.log(changes);
  if (changes.result) {
    result.value = changes.result.newValue;
  }
});
</script>

<style>
</style>
