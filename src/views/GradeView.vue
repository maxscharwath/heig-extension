<template>
  <v-app-bar :extended="showMenu" app dense class="px-4">
    <div class="text-caption">
      {{
        $vuetify.locale.getScope()
          .t('$vuetify.grades.lastCheckAt')
      }} {{ updateAt.toLocaleString() }}
    </div>
    <v-spacer />
    <v-btn icon size="small" @click="fetchGrades">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
    <v-btn icon size="small" @click="showMenu = !showMenu">
      <v-icon>mdi-dots-vertical</v-icon>
    </v-btn>
    <template v-if="showMenu" v-slot:extension>
      <v-btn @click="checkAll">
        <v-icon color="yellow" icon="mdi-new-box" start />
        {{
          $vuetify.locale.getScope()
            .t('$vuetify.grades.checkAll')
        }}
      </v-btn>
    </template>
  </v-app-bar>
  <v-app-bar height=5 rounded v-if="loading"><v-progress-linear :indeterminate="true" /></v-app-bar>
  <v-container fluid>
    <v-expansion-panels v-if="result" multiple>
      <template v-for="course in result" :key="course.name">
        <v-expansion-panel v-if="!!course.average">
          <v-expansion-panel-title>
            <v-icon
              v-if="courseHasNewGrade(course.uuid)"
              class="mr-2"
              color="yellow"
              icon="mdi-new-box"
              size="large"
              @click.stop.prevent="checkCourse(course.uuid)"
            />
            {{ course.name }}
            <v-tooltip v-if="course.hasExam">
              <template v-slot:activator="{ props }">
                <v-icon end icon="mdi-school" size="x-small" v-bind="props" />
              </template>
              <span>{{
                $vuetify.locale.getScope()
                  .t('$vuetify.grades.hasExam')
              }}</span>
            </v-tooltip>
            <v-spacer />
            <v-chip color="primary">{{ course.average }}</v-chip>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-expansion-panels multiple>
              <v-expansion-panel v-for="section in course.sections" :key="section.name">
                <v-expansion-panel-title>
                  <v-icon
                    v-if="sectionHasNewGrade(section.uuid)"
                    class="mr-2"
                    color="yellow"
                    icon="mdi-new-box"
                    size="large"
                    @click.stop.prevent="checkSection(section.uuid)"
                  />
                  {{ section.name }}
                  <v-spacer />
                  <v-chip color="primary" text>{{ section.average }}</v-chip>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-list>
                    <template v-for="grade in section.grades" :key="grade.name">
                      <v-list-item
                        v-if="!!grade.grade"
                        @focus="checkGrade(grade.uuid)"
                        @mouseover="checkGrade(grade.uuid)">

                        <template v-slot:prepend v-if="gradeIsNew(grade.uuid)">
                          <v-avatar icon size="x-small">
                            <v-icon color="yellow" icon="mdi-new-box" size="large" />
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ grade.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip :ripple="false" class="mr-1" size="x-small" variant="outlined">
                            <v-icon icon="mdi-percent" start />
                            {{ grade.coefficient }}
                          </v-chip>
                          <v-chip :ripple="false" class="mr-1" size="x-small" variant="outlined">
                            <v-icon icon="mdi-chart-bar" start />
                            {{ grade.average }}
                          </v-chip>
                          <v-chip :ripple="false" class="mr-1" size="x-small" variant="outlined">
                            <v-icon icon="mdi-clock" start />
                            {{ new Date(grade.date).toLocaleDateString() }}
                          </v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                          <v-chip color="primary">{{ grade.grade }}</v-chip>
                        </template>
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
import { ref } from 'vue';
import browser from 'webextension-polyfill';
import { newGrades, result, updateAt } from '@/store/store'

const showMenu = ref(false);
const loading = ref<boolean>(false);

const gradeIsNew = (gradeUuid: string) => !!(newGrades.value ?? {})[gradeUuid];
const sectionHasNewGrade = (sectionUuid: string) => Object.values(newGrades.value ?? {})
  .some((grade) => grade[1] === sectionUuid);
const courseHasNewGrade = (courseUuid: string) => Object.values(newGrades.value ?? {})
  .some((grade) => grade[0] === courseUuid);

const checkAll = () => {
  newGrades.value = {};
};

const checkGrade = (gradeUuid: string) => {
  if (!newGrades.value) {
    return;
  }
  delete newGrades.value[gradeUuid];
  newGrades.value = { ...newGrades.value };
};

const checkSection = (sectionUuid: string) => {
  Object.entries(newGrades.value ?? {})
    .forEach(([gradeUuid, data]) => {
      if (data[1] === sectionUuid && newGrades.value) {
        delete newGrades.value[gradeUuid];
      }
    });
  newGrades.value = { ...newGrades.value };
};

const checkCourse = (courseUuid: string) => {
  Object.entries(newGrades.value ?? {})
    .forEach(([gradeUuid, data]) => {
      if (data[0] === courseUuid && newGrades.value) {
        delete newGrades.value[gradeUuid];
      }
    });
  newGrades.value = { ...newGrades.value };
};

async function fetchGrades() {
  if (loading.value) {
    return;
  }
  loading.value = true;
  const t = setTimeout(() => {
    loading.value = false;
  }, 10000);
  browser.runtime.sendMessage({
    type: 'fetchResults',
  })
    .finally(() => {
      clearTimeout(t);
      loading.value = false;
    });
}
</script>
<style>
.v-expansion-panel-text__wrapper {
  padding: 0 !important;
}
</style>
