export default {
  routes: [
    {
      method: 'GET',
      path: '/photographers',
      handler: 'photographer.find',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['find']
        }
      },
    },
    {
      method: 'GET',
      path: '/photographers/me',
      handler: 'photographer.me',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['find']
        }
      },
    },
    {
      method: 'GET',
      path: '/photographers/:id',
      handler: 'photographer.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['findOne']
        }
      },
    },
    {
      method: 'POST',
      path: '/photographers',
      handler: 'photographer.create',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['create']
        }
      },
    },
    {
      method: 'PUT',
      path: '/photographers/:id',
      handler: 'photographer.update',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['update']
        }
      },
    },
    {
      method: 'PATCH',
      path: '/photographers/:id/settings',
      handler: 'photographer.updateSettings',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['update']
        }
      },
    },
    {
      method: 'DELETE',
      path: '/photographers/:id',
      handler: 'photographer.delete',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['delete']
        }
      },
    },
  ],
};