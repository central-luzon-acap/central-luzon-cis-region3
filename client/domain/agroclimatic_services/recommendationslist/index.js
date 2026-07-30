import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Chip from '@mui/material/Chip'
import EmptyState from '@/common/ui/empty_state'

function RecommendationsList ({
  recommendations = [],
  isTagalog = null,
  }) {

  const [isEnglish, setIsEnglish] = useState(true)

  useEffect(() => {
    if (isTagalog !== null) setIsEnglish(!isTagalog)
  }, [isTagalog])

  return (
    <div>
      <div style={{ display: 'flex' }}>
        {/** Language toggle button */}
        {isTagalog === null &&
        <Chip
          variant='outlined'
          size='small'
          label={(isEnglish) ? 'Tagalog' : 'English'}
          onClick={() => setIsEnglish(prev => !prev)}
          className='toggleButton'
        />
        }
      </div>

      {/** Recommendation(s) Text */}
      {recommendations.length > 0
        ? <div>
            <>
              {recommendations.map((recommendation, index) => {
                return <div key={index} dangerouslySetInnerHTML={{__html: (isEnglish)
                  ? recommendation['management_recommendations_english'] || 'No Recommendations'
                  : recommendation['management_recommendations_tagalog'] || 'Walang makitang rekomendasyon' }}
                />
              })}
            </>
          </div>
        : <EmptyState message='We cannot find recommendations for your selected options.' />
      }
    </div>
  )
}

RecommendationsList.propTypes = {
  recommendations: PropTypes.array,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  titleFontSize: PropTypes.string,
  // recommendationsEng: PropTypes.string,
  // recommendationsTag: PropTypes.string,
  isTagalog: PropTypes.bool,
  isShowTitle: PropTypes.bool
}

export default RecommendationsList
