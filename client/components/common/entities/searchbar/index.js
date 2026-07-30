import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Index } from 'flexsearch'
import { useCollection } from '@/hooks/usefirestore'
import { _Utilities } from '@/services/utilities/utilities'
import SearchBar from './searchbar'
import useDebounce from '@/hooks/usedebounce'
import pageicons from './pageicons'

function SearchBarContainer ({ search, handleSearchClick }) {
  const { documents: keywords } = useCollection(_Utilities.PAGE_SEARCH, 'id')
  const [flexIndex, setFlexIndex] = useState(null)
  const [word, setWord] = useState(null)
  const [searchOptions, setSearchOptions] = useState([])
  const [pageNames, setPageNames] = useState({})
  const [currentOpt, setCurrentOpt] = useState(null)
  const debouncedValue = useDebounce(word, 500)
  const router = useRouter()

  useEffect(() => {
    if (keywords.length > 0) {
      // Set-up flexsearch settings
      const tempIndex = new Index({
        tokenize: 'full',
        matcher: 'simple',
        cache: true
      })

      // Insert content to flexsearch index
      keywords.forEach((word) => {
        tempIndex.add(word.id, word.content)
      })

      // Set the href to website name mappings
      setPageNames(keywords.reduce((acc, curr) => {
        let temp = pageicons.find(x => x.path === (curr.id === 'index' ? '/' : curr.id))
        const icon = (!temp) ? pageicons[4].icon : temp.icon

        return (acc === undefined)
          ? { [curr.id]: { name: curr.name, info: curr.info, icon, path: curr.path }}
          : { ...acc, [curr.id]: { name: curr.name, info: curr.info, icon, path: curr.path } }
      }, {}))
      setFlexIndex(tempIndex)
    }
  }, [keywords])

  useEffect(() => {
    if (debouncedValue) {
      // Search for keyword in the flexsearch index
      const results = flexIndex.search(debouncedValue, { limit: 10, suggest: true })

      // Update the dropdown items list
      setSearchOptions(results.map((item, index) => ({
        id: index,
        label: pageNames[item].name,
        info: pageNames[item].info,
        icon: pageNames[item].icon,
        href: (item === 'index') ? '/' : `/${pageNames[item].path}`
      })))
    }
  }, [debouncedValue, flexIndex, pageNames])

  const resetOptions = () => {
    setSearchOptions([])
    setCurrentOpt(null)
    setWord(null)
  }

  const onSelectItemChange = (e, newValue) => {
    if (newValue.id === undefined) {
      // Clear input
      resetOptions()
    } else {
      // Set selected page
      setCurrentOpt(newValue)
      router.push(newValue.href)
    }
  }

  // Handle keystrokes
  const handleTextChange = (e) => {
    if (!e) {
      return
    }

    const { value } = e.target
    if (value === '') {
      resetOptions()
    } else {
      setWord(value)
    }
  }

  // Handle the close button - clear selected options
  const handleClose = () => {
    if (search) {
      setSearchOptions([])
      setCurrentOpt(null)
    }

    handleSearchClick()
  }

  return (
    <SearchBar
      search={search}
      word={word}
      options={searchOptions}
      currentval={currentOpt}
      onSelectItemChange={onSelectItemChange}
      handleSearchClick={handleClose}
      onTextChange={handleTextChange}
    />
  )
}

export default SearchBarContainer
