import PropTypes from 'prop-types'
import produce from 'immer'
import { useCallback, useEffect, useMemo, useReducer } from 'react'

import {
  checkIfFormIsDirty,
  checkIfFormIsSaveable,
  extractValueFromTransformedData,
  transformInitialData,
  transformObject,
  tryAndGetDirtyFieldsToCheckFromInitialData,
  tryAndGetSaveableFieldsToCheckFromInitialData,
} from './utils'

const TYPES = {
  HANDLE_DATA_CHANGE: 'HANDLE_DATA_CHANGE',
  IS_DIRTY: 'IS_DIRTY',
  IS_SAVEABLE: 'IS_SAVEABLE',
  RESET_FORM: 'RESET_FORM',
  REINITIALISE_DATA: 'REINITIALISE_DATA',
}

const reducer = produce((draft, action) => {
  switch (action.type) {
    case TYPES.HANDLE_DATA_CHANGE: {
      draft.data[action.payload.key].value = action.payload.value

      return draft
    }
    case TYPES.IS_DIRTY: {
      draft.isDirty = action.payload.isDirty

      return draft
    }
    case TYPES.IS_SAVEABLE: {
      draft.isSaveable = action.payload.isSaveable

      return draft
    }
    case TYPES.RESET_FORM: {
      Object.keys(draft.data).forEach(key => {
        draft.data[key].value = draft.data[key].initialValue
      })

      return draft
    }
    case TYPES.REINITIALISE_DATA: {
      Object.entries(action.payload.data)
        .filter(([key]) => key in draft.data)
        .forEach(([key, value]) => {
          draft.data[key].value = value
          draft.data[key].initialValue = value
        })

      return draft
    }
    default:
      throw new Error()
  }
})

export function useForm ({
  initialData,
  dirtyFieldsToCheck = tryAndGetDirtyFieldsToCheckFromInitialData(initialData),
  saveableFieldsToCheck = tryAndGetSaveableFieldsToCheckFromInitialData(
    initialData,
  ),
}) {
  PropTypes.checkPropTypes(
    useForm.propTypes,
    { initialData, dirtyFieldsToCheck, saveableFieldsToCheck },
    'prop',
    'useForm',
  )
  const initialState = {
    data: transformInitialData(initialData),
    isDirty: false,
    isSaveable: false,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const handleDataChange = useCallback(
    ({ key, value }) =>
      dispatch({
        type: TYPES.HANDLE_DATA_CHANGE,
        payload: { key, value },
      }),
    [],
  )

  const setIsDirty = useCallback(
    isDirty =>
      dispatch({
        type: TYPES.IS_DIRTY,
        payload: { isDirty },
      }),
    [],
  )

  const setIsSaveable = useCallback(
    isSaveable =>
      dispatch({
        type: TYPES.IS_SAVEABLE,
        payload: { isSaveable },
      }),
    [],
  )

  const resetForm = useCallback(
    () =>
      dispatch({
        type: TYPES.RESET_FORM,
        payload: {},
      }),
    [],
  )

  const reinitialiseData = useCallback(
    data =>
      dispatch({
        type: TYPES.REINITIALISE_DATA,
        payload: { data },
      }),
    [],
  )

  const formStateAsData = useMemo(
    () => transformObject(state.data, extractValueFromTransformedData),
    [state.data],
  )

  useEffect(() => {
    const isNewFormDirty = checkIfFormIsDirty(state, dirtyFieldsToCheck)
    const isNewFormSaveable = checkIfFormIsSaveable(
      state,
      saveableFieldsToCheck,
    )

    if (isNewFormDirty !== state.isDirty) {
      setIsDirty(isNewFormDirty)
    }

    if (isNewFormSaveable !== state.isSaveable) {
      setIsSaveable(isNewFormSaveable)
    }
  }, [
    dirtyFieldsToCheck,
    saveableFieldsToCheck,
    setIsDirty,
    setIsSaveable,
    state,
  ])

  return [
    state,
    {
      handleDataChange,
      formStateAsData,
      resetForm,
      reinitialiseData,
    },
  ]
}

useForm.propTypes = {
  initialData: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
        null,
      ]).isRequired,
      initialValueIsOk: PropTypes.bool,
      checkForDirty: PropTypes.bool,
      checkForSaveable: PropTypes.bool,
    }),
  ),
}