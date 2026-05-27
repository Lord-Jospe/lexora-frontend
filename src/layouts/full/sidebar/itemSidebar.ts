export interface ChildItem {
  id: string;
  name: string;
  icon?: string;
  url?: string;
  children?: ChildItem[];
  disabled?: boolean;
}

export interface MenuItem {
  heading?: string;
  children?: ChildItem[];
}

import { uniqueId } from 'lodash';

const itemSidebar: MenuItem[] = [
  {
    heading: 'Menú Principal',
    children: [
      // {
      //   id: uniqueId(),
      //   name: 'Home',
      //   icon: 'solar:widget-2-linear',
      //   url: '/admin',
      // },
      {
        id: uniqueId(),
        name: 'Cargar documentos',
        icon: 'solar:upload-minimalistic-linear',
        url: '/admin/cargar-documentos',
      },
      {
        id: uniqueId(),
        name: 'Revisión de facturas',
        icon: 'solar:document-text-linear',
        url: '/admin/revision-facturas',
      },
      {
        id: uniqueId(),
        name: 'Historial de facturas',
        icon: 'solar:folder-open-linear',
        url: '/admin/historial-facturas',
      },
      {
        id: uniqueId(),
        name: 'Proveedores',
        icon: 'solar:users-group-rounded-linear',
        url: '/admin/proveedores',
      },
    ],
  },
];

export default itemSidebar;