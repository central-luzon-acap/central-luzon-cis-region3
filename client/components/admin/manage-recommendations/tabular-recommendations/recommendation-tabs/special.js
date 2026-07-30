import dynamic from 'next/dynamic'

import Typography from '@mui/material/Typography'

import { changeCodeToLabel } from '@/utils/recommendations'

function SPECIAL_CONTENT({ selectedRow, cropType, action }) {
  const TextEditor = dynamic(
    () => import('@/components/common/ui/texteditor'),
    { ssr: false },
  )

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Typography variant="subtitle1">
          <strong>Crop:</strong>
        </Typography>
        &nbsp;
        <Typography variant="subtitle1">{selectedRow?.row.crop}</Typography>
      </div>

      <div style={{ display: 'flex' }}>
        <Typography variant="subtitle1">
          <strong>Wind Signal:</strong>
        </Typography>
        &nbsp;
        <Typography variant="subtitle1">
          {changeCodeToLabel(
            'wind_signal',
            selectedRow?.row.wind_signal,
            cropType,
          )}
        </Typography>
      </div>

      {action === 'View' ? (
        <div>
          <div>
            <Typography variant="subtitle1">
              <strong>Impact Outlook English:</strong>
            </Typography>

            <div
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.impact_outlook_english,
              }}
            ></div>
          </div>

          <div>
            <Typography variant="subtitle1">
              <strong>Impact Outlook Tagalog:</strong>
            </Typography>

            <div
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.impact_outlook_tagalog,
              }}
            ></div>
          </div>

          <div>
            <Typography variant="subtitle1">
              <strong>Management Recommendations English:</strong>
            </Typography>

            <div
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.management_recommendations_english,
              }}
            ></div>
          </div>

          <div>
            <Typography variant="subtitle1">
              <strong>Management Recommendations Tagalog:</strong>
            </Typography>

            <div
              style={{
                textAlign: 'left',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: selectedRow?.row.management_recommendations_tagalog,
              }}
            ></div>
          </div>
        </div>
      ) : (
        <div>
          <Typography variant="subtitle1">
            <strong>Impact Outlook English:</strong>
          </Typography>
          <div>
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
                // TO-DO: Pass new values using store
                document.getElementById('impactOutlookEnglish').value = data
              }}
            />
          </div>

          <br />

          <Typography variant="subtitle1">
            <strong>Impact Outlook Tagalog:</strong>
          </Typography>

          <div>
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
                // TO-DO: Pass new values using store
                document.getElementById('impactOutlookTagalog').value = data
              }}
            />
          </div>

          <br />

          <Typography variant="subtitle1">
            <strong>Managemenent Recommendations English:</strong>
          </Typography>

          <div>
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
                // TO-DO: Pass new values using store
                document.getElementById(
                  'managementRecommendationsEnglish',
                ).value = data
              }}
            />
          </div>

          <br />

          <Typography variant="subtitle1">
            <strong>Managemenent Recommendations Tagalog:</strong>
          </Typography>

          <div>
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
                // TO-DO: Pass new values using store
                document.getElementById(
                  'managementRecommendationsTagalog',
                ).value = data
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default SPECIAL_CONTENT
