import { useState, useEffect } from 'react'

/**
 * Removes duplicate recommendations in the impacts recommendations.
 * @param {Object[]} recommendations - Firestore documents containing recommendations
 * @returns {Object[]} (1) One-item array containing processed "impact" and "impact_tagalog" HTML tags minus duplicate text.
 */
export default function useRecommendationsImpacts (recommendations) {
  const [group, setConsolidatedRecommendations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')

    if (recommendations?.length > 0) {
      try {
        let impacts = recommendations.map(recommendation => ({
          impact: recommendation.impact_outlook_english,
          impact_tagalog: recommendation.impact_outlook_tagalog
        })).filter(item => item.impact_outlook_english !== '' && item.impact_outlook_tagalog !== '')

        impacts = itemizeUniqueHTMLText(impacts)

        setConsolidatedRecommendations([{
          impact: buildString(impacts.impact),
          impact_tagalog: buildString(impacts.impact_tagalog)
        }])
        return
      } catch (err) {
        setError(err)
      }
    } else {
      setConsolidatedRecommendations([])
    }
  }, [recommendations])

  // Build the list of text to HTML tags
  const buildString = (list) => {
    let container = '-'

    let htmlText = list.reduce((processed, item) => {
      if (item.includes('<p>')) {
        if (container === 'list') {
          processed += '</ul>'
        }
        processed += item
        container = 'p'
      } else {
        if (['-', 'p'].includes(container)) {
          processed += '<ul>'
        }

        processed += item
        container = 'list'
      }

      return processed
    }, '')

    if (container === 'list') {
      htmlText+= '</ul>'
    }

    return htmlText
  }

  // Create a list of unique text from HTML tags containing <p> and <ul> tags
  const itemizeUniqueHTMLText = (impacts) => {
    // 20240528: Consider cases where the tagalog set of recommendations is exactly the same as the eng version or vice-versa
    const list = {
      impact: [],
      impact_tagalog: []
    }

    return impacts.reduce((store, item) => {
      Object.keys(store).forEach(key => {
        let string = item[key].replace(/<ul>/g, '')
        string = string.replace(/<\/ul>/g, '')
        string = string.replace(/<li>/g, '')

        string.split('<\/li>').forEach(item => {
          // Check for text in <p>
          if (item.includes('<p>')) {
            let pString = item.replace(/<p>/g, '')
            const pItems = pString.split('</p>')

            pItems.forEach(pText => {
              if (!list[key].includes(pText) && pText !== '') {
                list[key].push(pText)
                store[key].push(`<p>${pText}</p>`)
              }
            })
          } else {
            // Regular list item
            if (!list[key].includes(item) && item !== '') {
              list[key].push(item)
              store[key].push(`<li>${item}</li>`)
            }
          }
        })
      })

      return { ...store }
    }, { impact: [], impact_tagalog: [] })
  }

  return { group, error }
}
