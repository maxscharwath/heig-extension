<template>
  <v-app-bar app dense>
    <div class="text-caption">Last Check at {{updateAt.toLocaleString()}}</div>
    <v-spacer></v-spacer>
    <v-btn icon @click="fetchGrades">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
  </v-app-bar>
  <v-progress-linear indeterminate="true" v-if="loading"/>
  <v-container fluid>
    <v-expansion-panels multiple v-if="result">
      <template v-for="course in result" :key="course.name">
        <v-expansion-panel v-if="!!course.average">
          <v-expansion-panel-title>
            <v-list-item-icon
              icon="mdi-new-box"
              v-if="courseHasNewGrade(course)"
              color="yellow" class="mr-2" size="large"/>
            {{course.name}}
            <v-spacer/>
            <v-chip color="primary" text>{{course.average}}</v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-expansion-panels multiple>
              <v-expansion-panel v-for="section in course.sections" :key="section.name">
                <v-expansion-panel-title>
                  <v-list-item-icon
                    icon="mdi-new-box"
                    v-if="sectionHasNewGrade(section)" color="yellow" class="mr-2" size="large"/>
                  {{section.name}}
                  <v-spacer/>
                  <v-chip color="primary" text>{{section.average}}</v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list>
                    <template v-for="grade in section.grades" :key="grade.name">
                      <v-list-item v-if="!!grade.grade" @mouseover="checkGrade(grade)" @focus="checkGrade(grade)">
                        <v-list-item-icon
                          v-if="gradeIsNew(grade)"
                          icon="mdi-new-box" color="yellow" class="mr-2" size="large"/>
                        <v-list-item-header>
                          <v-list-item-title>{{grade.name}}</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip variant="outlined" class="mr-1" size="x-small" :ripple="false">
                              <v-icon start icon="mdi-percent"></v-icon>
                              {{grade.coefficient}}
                            </v-chip>
                            <v-chip variant="outlined" class="mr-1" size="x-small" :ripple="false">
                              <v-icon start icon="mdi-chart-bar"></v-icon>
                              {{grade.average}}
                            </v-chip>
                            <v-chip variant="outlined" class="mr-1" size="x-small" :ripple="false">
                              <v-icon start icon="mdi-clock"></v-icon>
                              {{new Date(grade.date).toLocaleDateString()}}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item-header>
                        <v-list-item-action>
                          <v-chip color="primary">{{grade.grade}}</v-chip>
                        </v-list-item-action>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </template>
    </v-expansion-panels>
  </v-container>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, toRaw } from 'vue';
import CourseInterface from '@/core/entity/CourseInterface';
import getStorageRef from '@/store/Storage';
import { Grade } from '@/core/manager/GradesManager';
import GradeInterface from '@/core/entity/GradeInterface';
import SectionInterface from '@/core/entity/SectionInterface';

const result = getStorageRef<CourseInterface[]>('gradesData', []);
const newGrades = getStorageRef<Grade[]>('newGrades', []);
const updateAt = getStorageRef<Date>('updatedAt', new Date(), {
  from: (value) => new Date(value ?? 0),
  to: (value) => value.toISOString(),
});

const loading = ref<boolean>(false);

const gradeIsNew = (grade: GradeInterface) => newGrades.value.some((g) => g.grade.uuid === toRaw(grade).uuid);

const sectionHasNewGrade = (section: SectionInterface) => toRaw(section)
  .grades
  .some((g) => gradeIsNew(g));

const courseHasNewGrade = (course: CourseInterface) => toRaw(course)
  .sections
  .some((s) => sectionHasNewGrade(s))
onUnmounted(() => {
  updateAt.unlink();
  result.unlink();
});

const checkGrade = (grade:GradeInterface) => {
  newGrades.value = newGrades.value.filter((g) => g.grade.uuid !== toRaw(grade).uuid);
}

async function fetchGrades() {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const t = setTimeout(() => {
    loading.value = false;
  }, 10000);
  chrome.runtime.sendMessage({
    type: 'fetchResults',
  }, () => {
    clearTimeout(t);
    loading.value = false;
  });
}
</script>
<style>
.v-expansion-panel-text__wrapper {
  padding: 0!important;
}
</style>
