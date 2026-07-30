import dynamic from 'next/dynamic'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { changeCodeToLabel } from '@/utils/recommendations'

function TENDAY_CONTENT({ selectedRow, cropType, action }) {
  const TextEditor = dynamic(
    () => import('@/components/common/ui/texteditor'),
    { ssr: false },
  )

  return (
    <>
      <span style={{ display: 'flex' }}>
        <Typography component="span" variant="body1">
          <strong>Crop:</strong>
        </Typography>
        <Box ml={1} component="span">
          <Typography component="span" variant="body1">
            {selectedRow?.row.crop}
          </Typography>
        </Box>
      </span>

      <span style={{ display: 'flex' }}>
        <Typography component="span" variant="body1">
          <strong>Crop Stage:</strong>
        </Typography>
        <Box ml={1} component="span">
          <Typography component="span" variant="body1">
            {selectedRow?.row?.crop_stage}
          </Typography>
        </Box>
      </span>

      <span style={{ display: 'flex' }}>
        <Typography component="span" variant="body1">
          <strong>Farming Activity:</strong>
        </Typography>
        <Box ml={1} component="span">
          <Typography component="span" variant="body1">
            {changeCodeToLabel(
              'farming_activity',
              selectedRow?.row.farming_activity,
              cropType,
            )}
          </Typography>
        </Box>
      </span>

      <span style={{ display: 'flex' }}>
        <Typography component="span" variant="body1">
          <strong>Climate Risk:</strong>
        </Typography>
        <Box ml={1} component="span">
          <Typography component="span" variant="body1">
            {changeCodeToLabel(
              'climate_risk',
              selectedRow?.row.climate_risk,
              cropType,
            )}
          </Typography>
        </Box>
      </span>

      {action === 'View' ? (
        <>
          <span>
            <Typography component="span" variant="subtitle1">
              <strong>Impact Outlook English:</strong>
            </Typography>

            <span
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.impact_outlook_english,
              }}
            ></span>
          </span>

          <span>
            <Typography component="span" variant="subtitle1">
              <strong>Impact Outlook Tagalog:</strong>
            </Typography>

            <span
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.impact_outlook_tagalog,
              }}
            ></span>
          </span>

          <span>
            <Typography component="span" variant="subtitle1">
              <strong>Management Recommendations English:</strong>
            </Typography>

            <span
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.management_recommendations_english,
              }}
            ></span>
          </span>

          <span>
            <Typography component="span" variant="subtitle1">
              <strong>Management Recommendations Tagalog:</strong>
            </Typography>

            <span
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.management_recommendations_tagalog,
              }}
            ></span>
          </span>
        </>
      ) : (
        <div>
          <Typography component="span" variant="subtitle1">
            <strong>Impact Outlook English:</strong>
          </Typography>

          <span>
            {/** Edit text */}
            <textarea
              id={'impactOutlookEnglish'}
              name={'impactOutlookEnglish'}
              hidden
            />

            <TextEditor
              name={'impactOutlookEnglish'}
              editorLoaded={true}
              value={selectedRow?.row.impact_outlook_english}
              isText={false}
              isDisabled={false}
              setContentCallback={(data) => {
                document.getElementById('impactOutlookEnglish').value = data
              }}
            />
          </span>

          <br />

          <Typography component="span" variant="subtitle1">
            <strong>Impact Outlook Tagalog:</strong>
          </Typography>

          <span>
            {/** Edit text */}
            <textarea
              id={'impactOutlookTagalog'}
              name={'impactOutlookTagalog'}
              hidden
            />

            <TextEditor
              name={'impactOutlookTagalog'}
              editorLoaded={true}
              value={selectedRow?.row.impact_outlook_tagalog}
              isText={false}
              isDisabled={false}
              setContentCallback={(data) => {
                document.getElementById('impactOutlookTagalog').value = data
              }}
            />
          </span>

          <br />

          <Typography component="span" variant="subtitle1">
            <strong>Managemenent Recommendations English:</strong>
          </Typography>

          <span>
            {/** Edit text */}
            <textarea
              id={'managementRecommendationsEnglish'}
              name={'managementRecommendationsEnglish'}
              hidden
            />

            <TextEditor
              name={'managementRecommendationsEnglish'}
              editorLoaded={true}
              value={selectedRow?.row.management_recommendations_english}
              isText={false}
              isDisabled={false}
              setContentCallback={(data) => {
                document.getElementById(
                  'managementRecommendationsEnglish',
                ).value = data
              }}
            />
          </span>

          <br />

          <Typography component="span" variant="subtitle1">
            <strong>Managemenent Recommendations Tagalog:</strong>
          </Typography>

          <span>
            {/** Edit text */}
            <textarea
              id={'managementRecommendationsTagalog'}
              name={'managementRecommendationsTagalog'}
              hidden
            />

            <TextEditor
              name={'managementRecommendationsTagalog'}
              editorLoaded={true}
              value={selectedRow?.row.management_recommendations_tagalog}
              isText={false}
              isDisabled={false}
              setContentCallback={(data) => {
                document.getElementById(
                  'managementRecommendationsTagalog',
                ).value = data
              }}
            />
          </span>
        </div>
      )}
    </>
  )
}

export default TENDAY_CONTENT
