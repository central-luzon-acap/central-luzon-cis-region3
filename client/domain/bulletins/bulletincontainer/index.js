import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/services/auth'
import PropTypes from 'prop-types'
import useDeleteBulletin from '@/hooks/bulletins/usedeletebulletin'
import useDownloadPDF from '@/hooks/bulletins/usedownloadpdf'
import { useFetchBulletins } from '@/hooks/bulletins/usefetchbulletins'
import { BULLETIN_ACTION } from '@/utils/constants/bulletins'
import { ADAPTER_STATES } from '@/store/constants'

import PdfList from '@/domain/bulletins/pdflist'

function BulletinContainer ({ provinces, subtitle, currentDefaultBulletin }) {
  const [currentBulletin, setSelectedBulletin] = useState(currentDefaultBulletin)
  const user = useAuth()

  // Delete the selected bulletin and PDF
  const { state: deleteState } = useDeleteBulletin(currentBulletin)

  // Download PDF file
  const { state: downloadState } = useDownloadPDF(currentBulletin)

  // Fetch and reload the bulletins list after item deletion.
  // Set each bulletin item's loading indicator and disabled state on item download, delete and bulk documents fetching status.
  const { state: listState, bulletins } = useFetchBulletins({
    currentbulletin: currentBulletin,
    statdload: downloadState,
    statdelete: deleteState,
    fetch: (currentBulletin.filename === '' && deleteState.error === '' && currentBulletin.action !== BULLETIN_ACTION.DOWNLOAD &&
      ([ADAPTER_STATES.FULLFILLED, ADAPTER_STATES.IDLE].includes(deleteState.status)))
  })

  // 20240612: "General" special weather bulletin for typhoons outside PAR
  // not connected to province/municipality and cropping calendar now have an "n/a" value where applicable
  const provinceList = useMemo(() => {
    if (!bulletins) return
    if (!provinces) return

    return bulletins?.['n/a'] ? [...provinces, 'n/a'] : provinces
  }, [bulletins, provinces])

  useEffect(() => {
    // Watch the PDF deletion status and reset the selected PDF file
    // Re-loads the bulletins list
    if ((deleteState.status === ADAPTER_STATES.FULLFILLED ||
      downloadState.status === ADAPTER_STATES.FULLFILLED ||
      deleteState.error !== '' || downloadState.error !== '') &&
      currentBulletin.filename !== ''
    ) {
      setSelectedBulletin(prev => ({ ...prev, filename: '', province: '' }))
    }
  }, [deleteState, downloadState, currentBulletin])

  const handleDeleteBulletin = (bulletin) => {
    const { province, filename } = bulletin
    setSelectedBulletin({ ...currentBulletin, filename, province, action: BULLETIN_ACTION.DELETE })
  }

  const handleClick = async (province, filename) => {
    setSelectedBulletin({ ...currentBulletin, filename, province, action: BULLETIN_ACTION.DOWNLOAD })
  }

  return (
    <PdfList
      provinces={provinceList}
      bulletins={bulletins}
      isDeleting={deleteState?.loading || false}
      isFetching={listState?.loading || false}
      isPDFLoading={downloadState?.loading || false}
      isUser={user.user !== null}
      handleClick={handleClick}
      onDeleteClick={handleDeleteBulletin}
      subtitle={subtitle}
    />
  )
}

BulletinContainer.propTypes = {
  provinces: PropTypes.array,
  subtitle: PropTypes.string,
  currentDefaultBulletin: PropTypes.object
}

export default BulletinContainer
