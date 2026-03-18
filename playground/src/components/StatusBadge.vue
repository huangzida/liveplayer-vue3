<script setup lang="ts">
const props = defineProps<{
  label: string;
  tone?: 'amber' | 'sky' | 'emerald' | 'rose';
}>();

const toneClasses = {
  amber: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  sky: 'border-sky-300/30 bg-sky-300/10 text-sky-100',
  emerald: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100',
  rose: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
};
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]"
    :class="toneClasses[props.tone ?? 'amber']"
  >
    {{ props.label }}
  </span>
</template>