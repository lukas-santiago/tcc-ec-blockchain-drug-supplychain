import { Route, RootRoute } from '@tanstack/react-router'

import { Index } from '../pages/Index'
import { About } from '../pages/About'
import { Root } from '../pages/Root'

const rootRoute = new RootRoute({
  component: Root,
})

export const routeTree = rootRoute.addChildren([
  new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
  }),
  new Route({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: About,
  }),
])
