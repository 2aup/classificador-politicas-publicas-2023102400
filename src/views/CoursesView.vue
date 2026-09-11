<script setup>
import { ref, watch, onMounted } from 'vue'
import BaseTable from '@/components/BaseTable.vue'
import { getCourseEvasion } from '@/schemas/tables/courses'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const rowData = ref([])
const loading = ref(false)
const viewType = ref('nome_principal')

async function loadCurrentView() {
  rowData.value = []

  if (viewType.value === 'nome_principal') {
    await loadCoursesDetailed()
    return
  }

  await loadCourses()
}

async function attachCourseEvasion(rows) {
  return await Promise.all(
    rows.map(async (row) => {
      try {
        const evasion = await getCourseEvasion(row.id_curso)
        return { ...row, evasion }
      } catch {
        return { ...row, evasion: null }
      }
    })
  )
}

async function fetchCourseStudents(cursoId) {
  const url = `${apiBase}/cursos/${cursoId}/alunos`
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' }
  })

  const text = await res.text()

  if (!res.ok) {
    throw new Error(`Falha ao carregar alunos do curso ${cursoId}. Status ${res.status}. Body: ${text}`)
  }

  const data = text ? JSON.parse(text) : { items: [] }
  return Array.isArray(data?.items) ? data.items : []
}

async function loadCourses() {
  loading.value = true

  try {
    const url = `${apiBase}/cursos`

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })

    const text = await res.text()

    if (!res.ok) {
      throw new Error(`Falha ao carregar cursos. Status ${res.status}. Body: ${text}`)
    }

    const data = text ? JSON.parse(text) : { items: [] }
    const items = Array.isArray(data?.items) ? data.items : []

    const itemsWithEvasion = await attachCourseEvasion(items)

    rowData.value = itemsWithEvasion.map(course => ({
      id: course.id_curso,
      courseId: course.id_curso,
      name: course.nome_curso,
      unity: course.nome_unidade,
      campus: course.nome_campus,
      type: course.modalidade,
      period: course.nome_periodo,
      evasion: course.evasion,
      children: null,
      async loadDetail() {
        if (Array.isArray(this.children)) {
          return this.children
        }

        const students = await fetchCourseStudents(this.courseId)
        this.children = students.map(student => ({
          ...student,
          impact: student.impact ?? {}
        }))

        return this.children
      }
    }))
  } finally {
    loading.value = false
  }
}

async function loadCoursesDetailed() {
  loading.value = true

  try {
    const url = `${apiBase}/cursos?group_by=principal`

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json'
      }
    })

    const text = await res.text()

    if (!res.ok) {
      throw new Error(
        `Falha ao carregar cursos detalhados. Status ${res.status}. Body: ${text}`
      )
    }

    const data = text ? JSON.parse(text) : []

    const groups = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : []

    rowData.value = groups.map(group => {
      const courses = Array.isArray(group.cursos_detalhados)
        ? group.cursos_detalhados
        : []

      return {
        id: `principal-${group.nome_principal}`,

        principal: group.nome_principal,
        name: group.nome_principal,

        totalAlunos: group.total_alunos ?? 0,
        evadidos: group.evadidos ?? 0,
        evasion: group.taxa ?? 0,

        children: courses.map(course => ({
          id: course.id_curso,
          courseId: course.id_curso,

          name: course.nome_curso,
          unity: course.nome_unidade,
          campus: course.nome_campus,
          type: course.modalidade,
          period: course.nome_periodo,

          evasion: course.evasion ?? null,

          children: null
        })),

        async loadDetail() {
          return this.children ?? []
        }
      }
    })
  } finally {
    loading.value = false
  }
}

watch(viewType, () => {
  loadCurrentView().catch(error => {
    console.error('Erro ao carregar cursos:', error)
    rowData.value = []
  })
})

onMounted(() => {
  loadCurrentView().catch(error => {
    console.error('Erro ao carregar cursos:', error)
    rowData.value = []
  })
})
</script>

<template>
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
    <label
      for="viewType"
      style="font-weight: 600; font-size: 14px;"
    >
      Visão
    </label>

    <select
      id="viewType"
      v-model="viewType"
      style="
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background-color: #fff;
        color: #374151;
        font-size: 14px;
        cursor: pointer;
        outline: none;
        min-width: 180px;
      "
    >
      <option value="none">Nenhum</option>
      <option value="nome_principal">Nome Principal</option>
    </select>
  </div>

  <BaseTable
    :key="`courses-${viewType}`"
    :entity="viewType === 'nome_principal' ? 'coursesPrincipal' : 'courses'"
    :rowData="rowData"
    :loading="loading"
  />
</template>