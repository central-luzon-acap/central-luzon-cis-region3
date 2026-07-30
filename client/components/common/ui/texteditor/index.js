import PropTypes from 'prop-types'

import Box from '@mui/material/Box'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

/**
 * For best results in most React dev environments, import this component as:
 * const TextEditor = dynamic(() => import('@/components/common/ui/texteditor'), { ssr: false })
 * --> inside a function Component (not outside)
*/
function TextEditor ({
  editorLoaded = true,
  name,
  value,
  styles,
  isText = false,
  isDisabled = false,
  toolbarConfig,
  setContentCallback
}) {
  const defaultMintHeight = '100px'

  const toolbarSettings = [
    'bold', 'italic', '|',
    'numberedList', 'bulletedList', '|',
    'outdent', 'indent', '|',
    'undo', 'redo'
  ]

  const setCurrentContent = (newContent) => {
    setContentCallback?.(newContent)
  }

  const getTextContent = (html) => {
    // Create a temporary element to parse the HTML content
    const tempElement = document.createElement('div')
    tempElement.innerHTML = html

    // Extract text content without HTML tags
    return tempElement.textContent || tempElement.innerText
  }

  return (
    <Box sx={{ '& .ck-focused': {'border': '1px solid #8c8c8c !important' }}} >
      {editorLoaded ? (
        <CKEditor
          editor={ClassicEditor}
          config={{
            toolbar: toolbarConfig ?? toolbarSettings
          }}
          id={name}
          name={name}
          data={value}
          disabled={isDisabled}
          onReady={(editor) => {
            // Log available toolbar items
            // console.log(Array.from( editor.ui.componentFactory.names()))

            // Disable buttons if isText-only
            if (isText) {
              for (let i = 0; i < editor.ui.view.toolbar.items.length; i += 1) {
                editor.ui.view.toolbar.items.get(i).isEnabled = false
              }
            }

            // Set editor height
            const element = editor.editing.view.document.getRoot()
            const editableElement = editor.ui.view.editable.element
            editableElement.style.border = 'none'

            // Set editor styles
            editor.editing.view.change((writer) => {
              writer.setStyle('min-height', defaultMintHeight, element)
              writer.setStyle('height', '100%', element)

              for (const styleKey in styles) {
                writer.setStyle(styleKey, styles[styleKey], element)
              }
            })
          }}
          onBlur={(e, editor) => {
            const data = editor.getData()

            setCurrentContent(isText
              ? getTextContent(data)
              : data
            )
          }}
        />
      ) : (
        <div>Loading...</div>
      )}
    </Box>
  )
}

TextEditor.propTypes = {
  /** ref or flag when the parent component is mounted */
  editorLoaded: PropTypes.bool,
  /** Form name */
  name: PropTypes.string,
  /** Initial text editor value */
  value: PropTypes.string,
  /** Regular CSS styles (not in camel case i.e., "padding-top") */
  styles: PropTypes.object,
  /** Flag to return only the text content within the HTML tags */
  isText: PropTypes.bool,
  /** List of CKEditor5 toolbar configuration */
  toolbarConfig: PropTypes.array,
  /** Callback on editor content change */
  setContentCallback: PropTypes.func
}

export default TextEditor
