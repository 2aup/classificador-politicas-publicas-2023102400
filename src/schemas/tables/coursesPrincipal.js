import { riskColor } from "@/utils/colorScaleDroptout"

export default {
  columns: [
    {
      field: 'name',
      headerName: 'tables.general.name',
      cellRenderer: 'agGroupCellRenderer',
      minWidth: 250
    },

    {
      field: 'totalAlunos',
      headerName: 'Total de Alunos',
      minWidth: 150
    },

    {
      field: 'evadidos',
      headerName: 'Evadidos',
      minWidth: 120
    },

    {
      field: 'evasion',
      headerName: 'Taxa de Evasão',
      minWidth: 150,

      valueFormatter: params =>
        typeof params.value === 'number'
          ? `${params.value}%`
          : '---',

      cellStyle: params =>
        typeof params.value === 'number'
          ? {
              backgroundColor: riskColor(params.value)
            }
          : null
    }
  ],

  subtable: {
    mode: 'masterDetail',

    detailGridOptions: {
      suppressRowTransform: true,

      tooltipShowDelay: 200,
      tooltipHideDelay: 2000,

      suppressColumnVirtualisation: true,

      defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        filter: true,
        resizable: true
      },

      columnDefs: [
        {
          field: 'id',
          headerName: 'ID Curso',
          width: 110,
          pinned: 'left'
        },

        {
          field: 'name',
          headerName: 'Curso',
          minWidth: 250
        },

        {
          field: 'type',
          headerName: 'Modalidade',
          minWidth: 160
        },

        {
          field: 'period',
          headerName: 'Período',
          minWidth: 160
        },

        {
          field: 'unity',
          headerName: 'Unidade',
          minWidth: 250
        },

        {
          field: 'campus',
          headerName: 'Câmpus',
          minWidth: 250
        },
      ],

      onFirstDataRendered: params => {
        params.api.sizeColumnsToFit()
      }
    },

    getDetailRowData(params) {
      const cursos = Array.isArray(params.data.children)
        ? params.data.children
        : []

      params.successCallback(cursos)
    }
  }
}