<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '@/components/BaseTable.vue'
import { getUnitsEvasionBatch } from '@/schemas/tables/units'
import { getCoursesEvasionBatch } from '@/schemas/tables/courses'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const rowData = ref([])
const loading = ref(false)

async function loadUnits() {
  loading.value = true
  try {
    const url = `${apiBase}/unidades?include_courses=true`

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })

    const text = await res.text()

    if (!res.ok) {
      throw new Error(`Falha ao carregar unidades. Status ${res.status}. Body: ${text}`)
    }

    const data = text ? JSON.parse(text) : { items: [] }
    const items = Array.isArray(data?.items) ? data.items : []

    const unitIds = items.map(unit => unit.id_unidade)
    const courseIds = items.flatMap(unit =>
      Array.isArray(unit.courses) ? unit.courses.map(c => c.id_curso) : []
    )

    const [unitEvasionById, courseEvasionById] = await Promise.all([
      getUnitsEvasionBatch(unitIds).catch(() => new Map()),
      getCoursesEvasionBatch(courseIds).catch(() => new Map())
    ])

    rowData.value = items.map((unit) => {
      const courses = Array.isArray(unit.courses) ? unit.courses : []

      return {
        id: `unidade-${unit.id_unidade}`,
        unidadeId: unit.id_unidade,
        name: unit.nome,
        campus: unit.campus,
        evasion: unitEvasionById.get(unit.id_unidade) ?? null,
        children: courses.map(course => ({
          id: `curso-${course.id_curso}`,
          cursoId: course.id_curso,
          unidadeId: course.id_unidade,
          name: course.nome,
          campus: course.campus,
          type: course.tipo,
          period: course.periodo,
          evasion: courseEvasionById.get(course.id_curso) ?? null
        }))
      }
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUnits().catch(() => {
    rowData.value = []
  })
})
</script>

<template>
  <BaseTable entity="units" :rowData="rowData" :loading="loading" />
</template>