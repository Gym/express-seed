export const USER_POLICIES = [{
  roles: ['admin'],
  allows: [{
    resources: '/users/:userId',
    permissions: '*'
  }]
}, {
  roles: ['user'],
  allows: [{
    resources: '/account',
    permissions: '*'
  }, {
    resources: '/users/:userId',
    permissions: 'put'
  }]
}, {
  roles: ['guest'],
  allows: [{
    resources: '/users',
    permissions: 'post'
  }]
}];
