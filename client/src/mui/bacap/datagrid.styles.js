const stylesDatagrid = {
  datagrid: {
    background: '#FFFFFF',
    boxShadow: 'rgb(0 0 0 / 2%) 0px 3.5px 5.5px',
    borderRadius: '8px',
    '& .MuiDataGrid-main': {
        borderRadius: 2
    },
    '& .MuiDataGrid-virtualScrollerRenderZone': {
      '& .MuiDataGrid-row': {
        '&:nth-of-type(2n)': {
          backgroundColor: 'rgba(235, 235, 235, .7)'
        },
      },
    },
    '& .MuiDataGrid-columnHeader:focus-within': {
      outline: 'none !important',
    },
    '& .MuiDataGrid-columnHeaders': {
      color: (theme) => theme.palette.primary.dark,
      fontSize: 16,
    },
  },
}

export default stylesDatagrid
