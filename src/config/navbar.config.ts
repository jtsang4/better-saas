import type { NavbarConfig } from '@/types';

export const navbarConfig: NavbarConfig = {
  // Logo configuration
  logo: {
    url: '/',
    src: '/icons/apple-touch-icon.png',
    alt: 'logo.alt',
    title: 'logo.title',
  },

  // Authentication configuration
  auth: {
    login: {
      text: 'auth.login',
      url: '/login'
    },
    signup: {
      text: 'auth.signup',
      url: '/signup'
    },
  },

  // Menu configuration
  menu: {
    items: [
      {
        title: 'menu.blog',
        url: '/blog'
      },
      {
        title: 'menu.document',
        url: '/docs',
      },
      {
        title: 'menu.components',
        url: '/blocks',
      },
      {
        title: 'menu.pricing',
        url: '#pricing',
        onClick: 'handlePricingClick', // Special handler
      },
      {
        title: 'menu.resources',
        url: '#',
        items: [
          {
            title: 'menu.helpCenter',
            description: 'menu.helpCenterDescription',
            url: '#',
            icon: 'Zap',
          },
          {
            title: 'menu.contactUs',
            description: 'menu.contactUsDescription',
            url: '#',
            icon: 'Sunset',
          },
          {
            title: 'menu.status',
            description: 'menu.statusDescription',
            url: '#',
            icon: 'Trees',
          },
          {
            title: 'menu.termsOfService',
            description: 'menu.termsOfServiceDescription',
            url: '#',
            icon: 'Book',
          },
        ],
      },
    ],
  },
};
