import { Loading, Redirect } from '@shopify/app-bridge/actions'

import { createLoading, createRedirect } from '../utils'

const loading = createLoading()
const redirect = createRedirect()

function startLoading () {
  return loading.dispatch(Loading.Action.START)
}

redirect.subscribe(Redirect.Action.APP, () => {
  startLoading()
})

const createResource = url => ({
  url,
  index: () => {
    return redirect.dispatch(Redirect.Action.APP, url)
  },
  new: () => {
    return redirect.dispatch(Redirect.Action.APP, `${url}/new`)
  },
  show: id => {
    return redirect.dispatch(Redirect.Action.APP, `${url}/${id}`)
  },
  edit: id => {
    return redirect.dispatch(Redirect.Action.APP, `${url}/${id}/edit`)
  },
})

export function useRedirects () {
  const shopify = {
    order: id => () =>
      redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
        name: Redirect.ResourceType.Order,
        resource: {
          id: `${id}`,
        },
      }),
    product: id => () =>
      redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
        name: Redirect.ResourceType.Product,
        resource: {
          id: `${id}`,
        },
      }),
  }

  return {
    to: {
      home: {
        index: () => redirect.dispatch(Redirect.Action.APP, '/'),
      },

      products: createResource(`/products`),
    }
  }
}
