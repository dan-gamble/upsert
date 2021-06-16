export const transformObject = (obj, fnc) =>
  Object.fromEntries(Object.entries(obj).map(fnc))

export function transformInitialData (initialData) {
  return Object.fromEntries(
    initialData.map(initialDatum => {
      return [
        initialDatum.key,
        {
          value: initialDatum.value,
          initialValue: initialDatum.value,
          initialValueIsOk:
            'initialValueIsOk' in initialDatum
              ? initialDatum.initialValueIsOk
              : false,
        },
      ]
    }),
  )
}

export function checkIfFormIsDirty (state, fieldsToCheck) {
  return Object.entries(state.data)
    .filter(([key]) => checkIfKeyIsInIncludedFields(key))
    .some(([key, value]) => fieldHasValueThatIsntDefault(value))

  function checkIfKeyIsInIncludedFields (key) {
    return fieldsToCheck.includes(key)
  }

  function fieldHasValueThatIsntDefault ({ value, initialValue }) {
    return value !== initialValue
  }
}

export function checkIfFormIsSaveable (state, fieldsToCheck) {
  return Object.entries(state.data)
    .filter(([key]) => checkIfKeyIsInIncludedFields(key))
    .every(([key, value]) => fieldHasValueThatIsntDefault(value))

  function checkIfKeyIsInIncludedFields (key) {
    return fieldsToCheck.includes(key)
  }

  function fieldHasValueThatIsntDefault ({
    value,
    initialValue,
    initialValueIsOk,
  }) {
    return value !== initialValue || initialValueIsOk
  }
}

export function tryAndGetDirtyFieldsToCheckFromInitialData (initialData) {
  const keyToCheckFor = 'checkForDirty'

  return initialData
    .map(initialDatum => {
      if (keyToCheckFor in initialDatum) {
        return initialDatum
      }

      return {
        ...initialDatum,
        [keyToCheckFor]: true,
      }
    })
    .filter(initialDatum => initialDatum[keyToCheckFor])
    .map(initialDatum => initialDatum.key)
}

export function tryAndGetSaveableFieldsToCheckFromInitialData (initialData) {
  const keyToCheckFor = 'checkForSaveable'

  return initialData
    .map(initialDatum => {
      if (keyToCheckFor in initialDatum) {
        return initialDatum
      }

      return {
        ...initialDatum,
        [keyToCheckFor]: true,
      }
    })
    .filter(initialDatum => initialDatum[keyToCheckFor])
    .map(initialDatum => initialDatum.key)
}

export function extractValueFromTransformedData ([key, { value }]) {
  return [key, value]
}

export function getInitialData (data, initialKeys) {
  return Object.entries(data)
    .filter(([key]) => initialKeys.includes(key))
    .map(([key, value]) => ({
      key,
      value,
      initialValue: value,
      initialValueIsOk: true,
    }))
}

export function createBaseInitialData ({
  baseData = [],
  data = {},
  isEdit = true,
} = {}) {
  if (Object.keys(data).length === 0) return baseData

  return baseData.map(baseDatum => {
    if (!Object.keys(data).includes(baseDatum.key)) return baseDatum

    baseDatum.value = data[baseDatum.key]
    baseDatum.initialValue = data[baseDatum.key]

    if (isEdit) {
      baseDatum.initialValueIsOk = true
    }

    return baseDatum
  })
}