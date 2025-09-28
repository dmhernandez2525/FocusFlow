export default {
  routes: [
    {
      method: 'GET',
      path: '/clients',
      handler: 'client.find',
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
      path: '/clients/:id',
      handler: 'client.findOne',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['findOne']
        }
      },
    },
    {
      method: 'GET',
      path: '/photographers/:photographer_id/clients',
      handler: 'client.findByPhotographer',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['find']
        }
      },
    },
    {
      method: 'POST',
      path: '/clients',
      handler: 'client.create',
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
      path: '/clients/:id',
      handler: 'client.update',
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
      path: '/clients/:id/lifecycle-stage',
      handler: 'client.updateLifecycleStage',
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
      path: '/clients/:id/tags/add',
      handler: 'client.addTag',
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
      path: '/clients/:id/tags/remove',
      handler: 'client.removeTag',
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
      path: '/clients/:id/followup',
      handler: 'client.updateFollowup',
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
      path: '/clients/:id',
      handler: 'client.delete',
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