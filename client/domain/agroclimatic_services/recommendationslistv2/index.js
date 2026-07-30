import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import EmptyState from '@/common/ui/empty_state'

function RecommendationsList({
  impactOutlookOnly,
  recommendations = [],
  title = '',
  titleFontSize = 'h5',
  recommendationsEng = 'management_recommendations_english',
  recommendationsTag = 'management_recommendations_tagalog',
  impactOutlookEng = 'impact_outlook_english',
  impactOutlookTag = 'impact_outlook_tagalog',
  isTagalog = null,
  isShowTitle = true,
  isShowImpactOutlookSubtitle = true,
}) {
  const [isEnglish, setIsEnglish] = useState(true)

  useEffect(() => {
    if (isTagalog !== null) {
      setIsEnglish(!isTagalog)
    }
  }, [isTagalog])

  return (
    <div>
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        {isShowTitle && (
          <div style={{ flexGrow: 1 }}>
            <Typography variant={titleFontSize}>
              {title} Recommendations
            </Typography>
          </div>
        )}

        {/** Language toggle button */}
        {isTagalog === null && (
          <Chip
            variant="outlined"
            size="small"
            label={isEnglish ? 'Tagalog' : 'English'}
            onClick={() => setIsEnglish((prev) => !prev)}
            className="toggleButton"
          />
        )}
      </div>

      {/** Recommendation(s) Text */}
      {recommendations.length > 0 ? (
        <div>
          <>
            {impactOutlookOnly && (
              <div>
                {isShowImpactOutlookSubtitle && (
                  <Typography variant="subtitle1">Impact Outlooks</Typography>
                )}
                {recommendations.map((recommendation, index) => {
                  return (
                    <div
                      key={index}
                      dangerouslySetInnerHTML={{
                        __html: isEnglish
                          ? recommendation[impactOutlookEng] ||
                            'No Impact Outlook'
                          : recommendation[impactOutlookTag] ||
                            'Walang makitang impak awtluk',
                      }}
                    />
                  )
                })}

                <br />
              </div>
            )}
          </>

          {isShowImpactOutlookSubtitle && (
            <>
              {isShowTitle && (
                <Typography variant="subtitle1">Recommendations</Typography>
              )}
              {recommendations.map((recommendation, index) => {
                return (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={{
                      __html: isEnglish
                        ? recommendation[recommendationsEng] ||
                          'No Recommendations'
                        : recommendation[recommendationsTag] ||
                          'Walang makitang rekomendasyon',
                    }}
                  />
                )
              })}
            </>
          )}
        </div>
      ) : (
        <EmptyState message="We cannot find recommendations for your selected options." />
      )}
    </div>
  )
}

RecommendationsList.propTypes = {
  recommendations: PropTypes.array,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  titleFontSize: PropTypes.string,
  recommendationsEng: PropTypes.string,
  recommendationsTag: PropTypes.string,
  isTagalog: PropTypes.bool,
  isShowTitle: PropTypes.bool,
}

export default RecommendationsList
