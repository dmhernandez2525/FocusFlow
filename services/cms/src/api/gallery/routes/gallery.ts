export default {
  routes: [
    {
      method: 'GET',
      path: '/galleries',
      handler: 'gallery.find',
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
      path: '/galleries/:id',
      handler: 'gallery.findOne',
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
      path: '/galleries/access/:access_code',
      handler: 'gallery.findByAccessCode',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Public access for client viewing
      },
    },
    {
      method: 'GET',
      path: '/photographers/:photographer_id/galleries',
      handler: 'gallery.findByPhotographer',
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
      path: '/sessions/:session_id/galleries',
      handler: 'gallery.findBySession',
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
      path: '/galleries',
      handler: 'gallery.create',
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
      path: '/galleries/:id',
      handler: 'gallery.update',
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
      path: '/galleries/:id/settings',
      handler: 'gallery.updateSettings',
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
      path: '/galleries/:id/view',
      handler: 'gallery.recordView',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Public access for view tracking
      },
    },
    {
      method: 'PATCH',
      path: '/galleries/:id/password',
      handler: 'gallery.updatePassword',
      config: {
        policies: [],
        middlewares: [],
        auth: {
          scope: ['update']
        }
      },
    },
    {
      method: 'POST',
      path: '/galleries/access/:access_code/validate-password',
      handler: 'gallery.validatePassword',
      config: {
        policies: [],
        middlewares: [],
        auth: false, // Public access for password validation
      },
    },
    {
      method: 'PATCH',
      path: '/galleries/:id/photo-count',
      handler: 'gallery.updatePhotoCount',
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
      path: '/galleries/:id',
      handler: 'gallery.delete',
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