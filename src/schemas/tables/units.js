import { riskColor } from "@/utils/colorScaleDroptout"

const treeLabelById = new Map()

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getUnitEvasion(unidadeId, highRiskThreshold = 0.7) {
  const url = new URL(`${apiBase}/unidades/${unidadeId}/risco-evasao`)
  url.searchParams.set('high_risk_threshold', String(highRiskThreshold))

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include'
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body?.detail || 'Erro ao calcular evasão da unidade.')
  }

  return body?.risco_percentual ?? null
}

export async function getUnitsEvasionBatch(unidadeIds, highRiskThreshold = 0.7) {
  const ids = [...new Set(unidadeIds)].filter(id => id != null)
  const byId = new Map()
  if (ids.length === 0) return byId

  const url = new URL(`${apiBase}/unidades/risco-evasao`)
  url.searchParams.set('ids', ids.join(','))
  url.searchParams.set('high_risk_threshold', String(highRiskThreshold))

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include'
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(body?.detail || 'Erro ao calcular evasão das unidades.')
  }

  for (const item of body?.items ?? []) {
    byId.set(item.id_unidade, item.risco_percentual)
  }

  return byId
}

export default {
  columns: [
    { field: 'campus', headerName: 'tables.general.campus' },
    { field: 'type', headerName: 'tables.courses.type', onlyFor: 'child' },
    { field: 'period', headerName: 'tables.courses.period', onlyFor: 'child' },
    {
      field: 'evasion',
      headerName: 'tables.general.evasion',
      cellStyle: params => {
        const value = params.value
        const color = riskColor(value)
        if (value == null || color == null) return null
        return { backgroundColor: color }
      }
    }
  ],

  subtable: {
    mode: 'tree',

    tree: {
      getPath: row => row.treePath,
      groupColumn: {
        headerName: 'tables.general.name',
        suppressCount: true,
        cellRendererParams: {
          innerRenderer: params => treeLabelById.get(String(params.value)) ?? params.value
        }
      },

      buildRows(rawRows) {
        treeLabelById.clear()
        const rows = []

        rawRows.forEach(parent => {
          const parentId = String(parent.id)
          treeLabelById.set(parentId, parent.name)

          rows.push({
            ...parent,
            __type: 'parent',
            treePath: [parentId]
          })

          parent.children?.forEach(child => {
            const childId = String(child.id)
            treeLabelById.set(childId, child.name)

            rows.push({
              ...child,
              __type: 'child',
              treePath: [parentId, childId]
            })
          })
        })

        return rows
      }
    }
  }
}