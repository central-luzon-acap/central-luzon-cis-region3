import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

import TENDAY_CONTENT from './recommendation-tabs/tenday'
import TENDAY_SMS_CONTENT from './recommendation-tabs/tenday_sms'
import SEASONAL_CONTENT from './recommendation-tabs/seasonal'
import SEASONAL_GENERAL_CONTENT from './recommendation-tabs/seasonal_general'
import SEASONAL_SMS_CONTENT from './recommendation-tabs/seasonal_sms'
import SPECIAL_CONTENT from './recommendation-tabs/special'
import SPECIAL_SMS_CONTENT from './recommendation-tabs/special_sms'

function RecommendationDialog({
  action,
  open,
  handleClose,
  selectedRow,
  cropType,
  recommendationType,
  handleSubmit,
}) {
  return (
    <Dialog
      fullWidth
      maxWidth={'md'}
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event) => {
          event.preventDefault()
          if (recommendationType.label.includes('SMS')) {
            const { sms } = event.target

            delete selectedRow.row.crop_stage

            handleSubmit({
              ...selectedRow.row,
              sms: sms.value || selectedRow.row.sms,
            })
          } else {
            const {
              impactOutlookEnglish,
              impactOutlookTagalog,
              managementRecommendationsEnglish,
              managementRecommendationsTagalog,
            } = event.target

            handleSubmit({
              ...selectedRow.row,
              impact_outlook_english:
                impactOutlookEnglish.value ||
                selectedRow.row.impact_outlook_english,
              impact_outlook_tagalog:
                impactOutlookTagalog.value ||
                selectedRow.row.impact_outlook_tagalog,
              management_recommendations_english:
                managementRecommendationsEnglish.value ||
                selectedRow.row.management_recommendations_english,
              management_recommendations_tagalog:
                managementRecommendationsTagalog.value ||
                selectedRow.row.management_recommendations_tagalog,
            })
          }
        },
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {action === 'View'
          ? `View ${recommendationType.label} Recommendation`
          : `Edit ${recommendationType.label} Recommendation`}
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="alert-dialog-description">
          {recommendationType.value === 'tenday' && (
            <TENDAY_CONTENT
              selectedRow={selectedRow}
              cropType={cropType}
              action={action}
            />
          )}

          {recommendationType.value === 'tenday_sms' && (
            <TENDAY_SMS_CONTENT selectedRow={selectedRow} action={action} />
          )}

          {recommendationType.value === 'seasonal' && (
            <SEASONAL_CONTENT
              selectedRow={selectedRow}
              cropType={cropType}
              action={action}
            />
          )}

          {recommendationType.value === 'seasonal_general' && (
            <SEASONAL_GENERAL_CONTENT
              selectedRow={selectedRow}
              cropType={cropType}
              action={action}
            />
          )}

          {recommendationType.value === 'seasonal_sms' && (
            <SEASONAL_SMS_CONTENT selectedRow={selectedRow} action={action} />
          )}

          {recommendationType.value === 'special' && (
            <SPECIAL_CONTENT
              selectedRow={selectedRow}
              cropType={cropType}
              action={action}
            />
          )}

          {recommendationType.value === 'special_sms' && (
            <SPECIAL_SMS_CONTENT
              selectedRow={selectedRow}
              cropType={cropType}
              action={action}
            />
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {action === 'Edit' && <Button type="submit">Update</Button>}
      </DialogActions>
    </Dialog>
  )
}

export default RecommendationDialog
