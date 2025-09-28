export default {
  routes: [
    {
      method: 'GET',
      path: '/sessions',
      handler: 'session.find',
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
      path: '/sessions/:id',
      handler: 'session.findOne',
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
      path: '/photographers/:photographer_id/sessions',
      handler: 'session.findByPhotographer',
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
      path: '/clients/:client_id/sessions',
      handler: 'session.findByClient',
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
      path: '/photographers/:photographer_id/sessions/upcoming',
      handler: 'session.getUpcoming',
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
      path: '/photographers/:photographer_id/sessions/overdue',
      handler: 'session.getOverdue',
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
      path: '/sessions',
      handler: 'session.create',
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
      path: '/sessions/:id',
      handler: 'session.update',
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
      path: '/sessions/:id/status',
      handler: 'session.updateStatus',
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
      path: '/sessions/:id/payment-status',
      handler: 'session.updatePaymentStatus',
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
      path: '/sessions/:id/contract-status',
      handler: 'session.updateContractStatus',
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
      path: '/sessions/:id/delivered',
      handler: 'session.markDelivered',
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
      path: '/sessions/:id',
      handler: 'session.delete',
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