export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: NavigationItem[];
  roles?: string[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'main-navigation',
    title: 'Navigation Principale',
    type: 'group',
    icon: 'icon-group',
    roles: ['ADMIN', 'OPERATEUR', 'CAISSIER', 'CSITE', 'STATICIEN', 'ADMIN_GROUPE', 'USER'],
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/analytics',
        icon: 'feather icon-home',
        roles: ['ADMIN', 'OPERATEUR', 'CAISSIER', 'CSITE', 'STATICIEN', 'ADMIN_GROUPE', 'USER']
      },
    ]
  },
  {
    id: 'marchandises-management-group',
    title: 'Gestion Marchandises',
    type: 'group',
    icon: 'feather icon-package',
    roles: ['ADMIN', 'OPERATEUR', 'CAISSIER', 'CSITE', 'STATICIEN'],
    children: [
      {
        id: 'marchandises-operations-collapse',
        title: 'Opération',
        type: 'collapse',
        icon: 'feather icon-package',
        roles: ['ADMIN', 'OPERATEUR', 'CAISSIER', 'CSITE', 'STATICIEN', 'ADMIN_GROUPE'],
        children: [
          {
            id: 'marchandises-list',
            title: 'Voir & Gérer',
            type: 'item',
            url: '/marchandises',
            classes: 'nav-item',
            icon: 'feather icon-list',
            roles: ['ADMIN', 'OPERATEUR', 'CAISSIER', 'CSITE', 'STATICIEN', 'ADMIN_GROUPE']
          },
          {
            id: 'marchandises-add',
            title: 'Créer Marchandise',
            type: 'item',
            url: '/marchandises/new',
            classes: 'nav-item',
            icon: 'feather icon-plus-circle',
            roles: ['ADMIN', 'OPERATEUR']
          },
          {
            id: 'bon-expeditions-item',
            title: 'Gestion BE',
            type: 'item',
            url: '/bon-expeditions',
            classes: 'nav-item',
            icon: 'feather icon-file-text',
            roles: ['ADMIN', 'OPERATEUR', 'CSITE']
          }
        ]
      }
    ]
  },
  {
    id: 'partners-group',
    title: 'Partenaires',
    type: 'group',
    icon: 'feather icon-handshake',
    roles: ['ADMIN'],
    children: [
      {
        id: 'partners-collapse',
        title: 'Gestion Partenaires',
        type: 'collapse',
        icon: 'feather icon-thumbs-up',
        roles: ['ADMIN', 'ADMIN_GROUPE'],
        children: [
          {
            id: 'armateurs-gestion',
            title: 'Armateurs',
            type: 'item',
            url: '/armateurs',
            icon: 'feather icon-ship',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          },
          {
            id: 'consignataires-gestion',
            title: 'Consignataires',
            type: 'item',
            url: '/consignataires',
            icon: 'feather icon-truck',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          },
          {
            id: 'navires-gestion',
            title: 'Navires',
            type: 'item',
            url: '/navires',
            icon: 'feather icon-anchor',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          },
          {
            id: 'transitaires-gestion',
            title: 'Transitaires',
            type: 'item',
            url: '/transitaires',
            icon: 'feather icon-box',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          },
          {
            id: 'importateurs-gestion',
            title: 'Importateurs',
            type: 'item',
            url: '/importateurs',
            icon: 'feather icon-user',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          },
        ]
      }
    ]
  },
  {
    id: 'user-management-group',
    title: 'Gestion Utilisateurs',
    type: 'group',
    icon: 'feather icon-settings',
    roles: ['ADMIN'],
    children: [
      {
        id: 'user-management-collapse',
        title: 'Opérations Utilisateurs',
        type: 'collapse',
        icon: 'feather icon-user',
        roles: ['ADMIN', 'ADMIN_GROUPE'],
        children: [
          {
            id: 'utilisateurs-list',
            title: 'Voir & Gérer',
            type: 'item',
            url: '/utilisateurs',
            classes: 'nav-item',
            icon: 'feather icon-list',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          },
          {
            id: 'utilisateurs-add',
            title: 'Ajouter Utilisateur',
            type: 'item',
            url: '/utilisateurs/new',
            classes: 'nav-item',
            icon: 'feather icon-user-plus',
            roles: ['ADMIN', 'ADMIN_GROUPE']
          }
        ]
      }
    ]
  },
  {
    id: 'vehicule-config',
    title: 'Paramètres Véhicules',
    type: 'group',
    icon: 'feather icon-settings',
    roles: ['ADMIN'],
    children: [
      {
        id: 'vehicule-config',
        title: 'Gestion Véhicules',
        type: 'collapse',
        icon: 'feather icon-settings',
        roles: ['ADMIN'],
        children: [
          {
            id: 'nature-marchandises',
            title: 'Nature de Ma',
            type: 'item',
            url: '/nature-marchandises',
            icon: 'feather icon-list',
            roles: ['ADMIN']
          },
          {
            id: 'gammes-vehicules',
            title: 'Véhicules',
            type: 'item',
            url: '/gammes',
            icon: 'feather icon-tag',
            roles: ['ADMIN']
          },
          {
            id: 'modeles-vehicules',
            title: 'Modèles V',
            type: 'item',
            url: '/marques',
            icon: 'feather icon-truck',
            roles: ['ADMIN']
          }
        ]
      }
    ]
  },
  {
    id: 'group-management-group',
    title: 'Gestion des Groupes',
    type: 'group',
    icon: 'feather icon-users',
    roles: ['ADMIN'],
    children: [
      {
        id: 'group-operations-collapse',
        title: 'Opérations Groupes',
        type: 'collapse',
        icon: 'feather icon-settings',
        roles: ['ADMIN'],
        children: [
          {
            id: 'groupes-list-form',
            title: 'Voir & Gérer',
            type: 'item',
            url: '/groupes',
            classes: 'nav-item',
            icon: 'feather icon-list',
            roles: ['ADMIN']
          },
          {
            id: 'groupes-add',
            title: 'Ajouter Groupe',
            type: 'item',
            url: '/groupes/new',
            classes: 'nav-item',
            icon: 'feather icon-plus-circle',
            roles: ['ADMIN']
          }
        ]
      }
    ]
  },
  {
    id: 'cash-register-group-main',
    title: 'Gestion Caisse',
    type: 'group',
    icon: 'feather icon-dollar-sign',
    roles: ['ADMIN', 'ADMIN_GROUPE'],
    children: [
      {
        id: 'cash-register-details-collapse',
        title: 'Détails Caisse',
        type: 'collapse',
        icon: 'feather icon-credit-card',
        roles: ['ADMIN', 'CAISSIER', 'CSITE', 'ADMIN_GROUPE'],
        children: [
          {
            id: 'my-cash-summary-item',
            title: 'Ma Caisse',
            type: 'item',
            url: '/cash-register/my-summary',
            icon: 'feather icon-credit-card',
            roles: ['ADMIN', 'CAISSIER', 'ADMIN_GROUPE']
          },
          {
            id: 'site-cash-summaries-item',
            title: 'Caisse Site',
            type: 'item',
            url: '/cash-register/site-summaries',
            icon: 'feather icon-bar-chart-2',
            roles: ['ADMIN', 'CSITE', 'ADMIN_GROUPE']
          },
          {
            id: 'reports',
            title: 'Rapports',
            type: 'item',
            url: '/reports',
            icon: 'feather icon-bar-chart-2',
            classes: 'nav-item',
            roles: ['ADMIN', 'ADMIN_GROUPE', 'CSITE', 'STATICIEN']
          },
        ]
      }
    ]
  },
  {
    id: 'pays-ports-group',
    title: 'Pays & Ports',
    type: 'group',
    icon: 'feather icon-globe',
    roles: ['ADMIN'],
    children: [
      {
        id: 'pays-gestion-item',
        title: 'Gestion Pays',
        type: 'item',
        url: '/pays',
        icon: 'feather icon-globe',
        roles: ['ADMIN']
      },
      {
        id: 'ports-gestion-item',
        title: 'Gestion Ports',
        type: 'item',
        url: '/ports',
        icon: 'feather icon-compass',
        roles: ['ADMIN']
      }
    ]
  }
];
