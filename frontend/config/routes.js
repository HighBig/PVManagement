export default [
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/',
    component: '../layouts/SecurityLayout',
    routes: [
      {
        path: '/',
        component: '../layouts/BasicLayout',
        authority: ['admin', 'user'],
        routes: [
          {
            path: '/',
            redirect: '/report/bill',
          },
          {
            name: 'report',
            icon: 'table',
            path: '/report',
            routes: [
              {
                path: '/',
                redirect: '/report/bill',
              },
              {
                name: 'bill',
                icon: 'smile',
                path: '/report/bill',
                component: './report/bill',
              },
            ]
          },
          {
            name: 'information',
            icon: 'edit',
            path: '/information',
            routes: [
              {
                path: '/',
                redirect: '/information/electricity',
              },
              {
                name: 'electricity',
                icon: 'smile',
                path: '/information/electricity',
                component: './information/electricity',
              },
              {
                name: 'settlement',
                icon: 'smile',
                path: '/information/settlement',
                component: './information/settlement',
              },
            ],
          },
          {
            name: 'archives',
            icon: 'file',
            path: '/archives',
            routes: [
              {
                path: '/',
                redirect: '/archives/company',
              },
              {
                name: 'company',
                icon: 'smile',
                path: '/archives/company',
                component: './archives/company',
              },
              {
                name: 'station',
                icon: 'smile',
                path: '/archives/station',
                component: './archives/station',
              },
              {
                name: 'meter',
                icon: 'smile',
                path: '/archives/meter',
                component: './archives/meter',
              },
            ],
          },
          {
            name: 'account',
            icon: 'user',
            path: '/account',
            routes: [
              {
                path: '/',
                redirect: '/account/settings',
              },
              {
                name: 'settings',
                icon: 'smile',
                path: '/account/settings',
                component: './account/settings',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
];
