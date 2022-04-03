<template>
  <Disclosure as="nav" class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex items-center justify-between h-16">
        <div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex-shrink-0 flex items-center">
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
          </div>
            <div class="flex space-x-4">
              <router-link
                v-for="item in navigation"
                :key="item.name"
                :to="item.href"
                :class="[
                  item.current ?
                  'bg-gray-900 text-white' :
                  'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'px-3 py-2 rounded-md text-sm font-medium'
                  ]"
                :aria-current="item.current ? 'page' : undefined">
                {{ item.name }}
              </router-link>
            </div>
        </div>
      </div>
    </div>
  </Disclosure>
</template>

<script lang="ts" setup>
import { Disclosure } from '@headlessui/vue'

const navigation = [
  { name: 'Home', href: '/', current: true },
  { name: 'About', href: '/about', current: false },
]
</script>

<style scoped>

</style>
