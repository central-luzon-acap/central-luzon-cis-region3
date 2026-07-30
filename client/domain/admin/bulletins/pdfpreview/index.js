import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Image from 'next/image'
import { assetPrefixer, imageLoader } from '@/utils/img-loader'

// Common Components
import EmptyState from '@/common/ui/empty_state'
import LoadingCircle from '@/common/ui/loadingcircle'

function PDFPreview ({
  open,
  pdfPreview,
  error = '',
  loading = false,
  toggleViewerOpen
}) {
  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      aria-labelledby="data-saved-success"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="data-saved-success">
        {pdfPreview.filename
          ? `Bulletin Preview - ${pdfPreview.filename}`
          : 'Bulletin Preview'}
      </DialogTitle>
      <DialogContent sx={{ padding: 0, overflow: 'hidden' }}>
        <Box id="alert-dialog-description">
          {loading? (
            <div
              style={{ width: '100%', height: '90vh', textAlign: 'center' }}
            >
              <LoadingCircle text="Loading Preview...">
                <Image
                  unoptimized
                  src={assetPrefixer('images/icons/data-processing-128.png')}
                  height={100}
                  width={100}
                  loader={imageLoader}
                  alt="Loading Preview"
                />
              </LoadingCircle>
            </div>
          ) : error !== '' ? (
            <div style={{ width: '100%', height: '100vh' }}>
              <EmptyState message={error} />
            </div>
          ) : (
            <embed
              src={pdfPreview.url}
              style={{ width: '100%', height: '70vh' }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={toggleViewerOpen} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PDFPreview
