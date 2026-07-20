<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseTable from '@/components/BaseTable.vue'
import UserDocumentsModal from '@/components/UserDocumentsModal.vue'
import { maskDateTime } from '@/utils/regex'

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

const rowData = ref([])
const showModal = ref(false)
const selectedUser = ref(null)
const loading = ref(false)

const pendingUsers = computed(() => {
  return rowData.value.filter(user => {
    const status = String(user?.status ?? '').trim().toUpperCase()
    return status === 'PENDENTE' || status === 'PENDING'
  }).length
})

const havePending = computed(() => pendingUsers.value > 0)

const personasData = ref(null)
const personasLoading = ref(false)

async function loadHighRiskPersonas() {
  personasLoading.value = true
  try {
    const res = await fetch(`${apiBase}/students/personas/high-risk`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })

    const text = await res.text()
    if (!res.ok) throw new Error(`Erro ao carregar personas: ${res.status}`)

    const json = text ? JSON.parse(text) : {}
    personasData.value = json?.data ?? null
  } finally {
    personasLoading.value = false
  }
}

function openDocuments(user) {
  selectedUser.value = user
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedUser.value = null
}

function removeSelectedUserFromTable() {
  const selectedId = selectedUser.value?.id ?? selectedUser.value?.id_usuario
  if (!selectedId) return

  rowData.value = rowData.value.filter((user) => {
    const userId = user?.id ?? user?.id_usuario
    return userId !== selectedId
  })
}

async function handleUsersRefresh() {
  removeSelectedUserFromTable()

  try {
    await loadUsers()
  } catch (e) {
    error(e)
  }
}

async function loadUsers() {
  loading.value = true

  try {
    const url = `${apiBase}/admin/pending-users`;
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" },
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Falha ao carregar usuários. Status ${res.status}. Body: ${text}`);
    }

    const data = text ? JSON.parse(text) : { items: [] }
    const items = Array.isArray(data?.items) ? data.items : []

    rowData.value = items.map(u => ({
      ...u,
      id: u.id,
      nome: u.nome,
      email: u.email,
      status: u.status,
      categoria: u.categoria,
      campus: u.campus,
      data_cadastro: maskDateTime(u.data_cadastro),
      data_atualizacao: maskDateTime(u.data_atualizacao),
      documents: u.documentos ?? [],
    }))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers().catch((e) => {
    error(e)
    rowData.value = []
  })

  loadHighRiskPersonas().catch((e) => {
    error(e)
    personasData.value = null
  })
})
</script>

<template>
  <section class="general-section">

    <div v-if="havePending" class="warning-wrapper">
      <p>⚠️</p>
      <p>
        Existem {{ pendingUsers }} usuários pendentes de aprovação para o uso do sistema
      </p>
    </div>

    <section v-if="personasLoading" class="personas-section personas-loading">
      <p>Carregando Personas...</p>
    </section>

    <section v-else-if="personasData" class="personas-section">
      <div class="personas-header">
        <h2>Perfis com maior risco de evasão</h2>
        <p>
          {{ personasData.population.high_risk_count }} estudantes com alto risco
          entre {{ personasData.population.total_scored }} avaliados
        </p>
      </div>

      <div class="personas-grid">
        <article v-for="persona in personasData.personas" :key="persona.name" class="persona-card">
          <h4>{{ persona.name }}</h4>
          <p class="persona-summary">{{ persona.summary }}</p>

          <div class="signals">
            <span v-for="signal in persona.common_signals.slice(0, 3)" :key="signal" class="signal-tag">
              {{ signal }}
            </span>
          </div>

          <small class="confidence-note">
            {{ persona.confidence_note }}
          </small>
        </article>
      </div>
    </section>
    <div class="pending-users-wrapper">
      <h2>Usuários Pendentes</h2>
      <BaseTable entity="users" :rowData="rowData" @open-documents="openDocuments" :loading="loading" />
    </div>
  </section>
  <UserDocumentsModal v-if="showModal" :user="selectedUser" @close="closeModal" @refresh="handleUsersRefresh" />
</template>

<style scoped>
.general-section {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.warning-wrapper {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  border: solid 1px rgb(226, 44, 44);
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  align-items: center;
}

.personas-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.personas-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.personas-header p {
  margin: 0.25rem 0 0;
  opacity: 0.8;
}

.personas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.persona-card {
  border: 1px solid var(--ag-border-color, #dadfe4);
  border-radius: 0.75rem;
  padding: 1rem;
  background: var(--theme-bg);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.persona-card h4 {
  margin: 0;
  font-size: 1rem;
}

.persona-summary {
  margin: 0;
  line-height: 1.5;
}

.signals {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.signal-tag {
  font-size: 0.85rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.05);
}

.confidence-note {
  opacity: 0.7;
}

.pending-users-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>